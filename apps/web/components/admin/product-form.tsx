'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Plus, Trash2, Upload, ImageOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { saveProduct, type ProductVariantInput } from '@/lib/actions/products'
import { toast } from 'sonner'

interface VariantRow extends ProductVariantInput {
  key: string
}

export interface ProductFormInitial {
  id: string
  name: string
  description: string | null
  category: string | null
  price: number
  comparePrice: number | null
  images: string[]
  active: boolean
  variants: { id: string; size: string | null; color: string | null; colorHex: string | null; priceOverride: number | null; quantity: number; minQuantity: number }[]
}

function emptyVariant(): VariantRow {
  return { key: crypto.randomUUID(), quantity: 0, minQuantity: 3 }
}

export function ProductForm({ storeId, initial }: { storeId: string; initial?: ProductFormInitial }) {
  const router = useRouter()
  const [name, setName] = useState(initial?.name ?? '')
  const [category, setCategory] = useState(initial?.category ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [price, setPrice] = useState(initial ? String(initial.price) : '')
  const [comparePrice, setComparePrice] = useState(initial?.comparePrice ? String(initial.comparePrice) : '')
  const [active, setActive] = useState(initial?.active ?? true)
  const [images, setImages] = useState<string[]>(initial?.images ?? [])
  const [uploading, setUploading] = useState(false)
  const [variants, setVariants] = useState<VariantRow[]>(
    initial?.variants.length
      ? initial.variants.map((v) => ({
          key: v.id,
          id: v.id,
          size: v.size ?? undefined,
          color: v.color ?? undefined,
          colorHex: v.colorHex ?? undefined,
          priceOverride: v.priceOverride ?? undefined,
          quantity: v.quantity,
          minQuantity: v.minQuantity,
        }))
      : [emptyVariant()]
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const updateVariant = (key: string, patch: Partial<VariantRow>) => {
    setVariants((prev) => prev.map((v) => (v.key === key ? { ...v, ...patch } : v)))
  }

  const removeVariant = (key: string) => {
    setVariants((prev) => (prev.length > 1 ? prev.filter((v) => v.key !== key) : prev))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `${storeId}/products/${crypto.randomUUID()}.${ext}`
    const { error: uploadError } = await supabase.storage.from('store-assets').upload(path, file)
    setUploading(false)
    if (uploadError) {
      toast.error('Erro ao enviar imagem: ' + uploadError.message)
      return
    }
    const { data } = supabase.storage.from('store-assets').getPublicUrl(path)
    setImages((prev) => [...prev, data.publicUrl])
  }

  const removeImage = (url: string) => setImages((prev) => prev.filter((i) => i !== url))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const priceNum = Number(price.replace(',', '.'))
    if (!name.trim() || isNaN(priceNum) || priceNum <= 0) {
      setError('Preencha nome e preço válidos.')
      return
    }

    setSaving(true)
    const result = await saveProduct({
      productId: initial?.id,
      name,
      description,
      categoryName: category,
      price: priceNum,
      comparePrice: comparePrice ? Number(comparePrice.replace(',', '.')) : undefined,
      images,
      active,
      variants: variants.map((v) => ({
        id: v.id,
        size: v.size?.trim() || undefined,
        color: v.color?.trim() || undefined,
        colorHex: v.colorHex || undefined,
        priceOverride: v.priceOverride,
        quantity: Number(v.quantity) || 0,
        minQuantity: Number(v.minQuantity) || 3,
      })),
    })

    setSaving(false)
    if (result.error) {
      setError(result.error)
      return
    }
    toast.success(initial ? 'Produto atualizado!' : 'Produto criado!')
    router.push('/admin/produtos')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-3xl">
      <Card>
        <CardHeader><CardTitle>Informações do produto</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Input label="Nome do produto" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <Input label="Categoria" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Camisas, Calças..." />
          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="rounded border-gray-300" />
              Produto ativo (visível na vitrine)
            </label>
          </div>
          <Input label="Preço (R$)" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0,00" required inputMode="decimal" />
          <Input label="Preço comparativo (opcional)" value={comparePrice} onChange={(e) => setComparePrice(e.target.value)} placeholder="0,00" inputMode="decimal" />
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Imagens</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {images.map((url) => (
              <div key={url} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                <Image src={url} alt="Produto" fill className="object-cover" unoptimized />
                <button
                  type="button"
                  onClick={() => removeImage(url)}
                  className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center text-xs"
                >
                  ×
                </button>
              </div>
            ))}
            <label className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 hover:border-brand-400 flex flex-col items-center justify-center gap-1 cursor-pointer text-gray-400 transition-colors">
              <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleImageUpload} />
              {uploading ? <Upload className="w-5 h-5 animate-pulse" /> : <Plus className="w-5 h-5" />}
              <span className="text-[10px]">{uploading ? 'Enviando' : 'Adicionar'}</span>
            </label>
          </div>
          {images.length === 0 && (
            <p className="text-xs text-gray-400 mt-2 flex items-center gap-1"><ImageOff className="w-3.5 h-3.5" /> Nenhuma imagem ainda.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Variações e estoque</CardTitle>
            <Button type="button" size="sm" variant="outline" onClick={() => setVariants((prev) => [...prev, emptyVariant()])}>
              <Plus className="w-3.5 h-3.5" /> Adicionar variação
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-gray-400 -mt-1">
            Deixe tamanho e cor em branco se o produto não tiver variações.
          </p>
          {variants.map((v) => (
            <div key={v.key} className="grid grid-cols-2 sm:grid-cols-6 gap-2 items-end border-b border-gray-100 pb-3 last:border-0">
              <Input label="Tamanho" value={v.size ?? ''} onChange={(e) => updateVariant(v.key, { size: e.target.value })} placeholder="M" />
              <Input label="Cor" value={v.color ?? ''} onChange={(e) => updateVariant(v.key, { color: e.target.value })} placeholder="Preta" />
              <Input
                label="Preço espec."
                value={v.priceOverride?.toString() ?? ''}
                onChange={(e) => updateVariant(v.key, { priceOverride: e.target.value ? Number(e.target.value.replace(',', '.')) : undefined })}
                placeholder="opcional"
                inputMode="decimal"
              />
              <Input
                label="Estoque"
                type="number"
                value={String(v.quantity)}
                onChange={(e) => updateVariant(v.key, { quantity: Number(e.target.value) })}
              />
              <Input
                label="Mín."
                type="number"
                value={String(v.minQuantity)}
                onChange={(e) => updateVariant(v.key, { minQuantity: Number(e.target.value) })}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-red-500 hover:bg-red-50"
                onClick={() => removeVariant(v.key)}
                disabled={variants.length === 1}
                title={v.id ? 'Variações salvas não podem ser removidas por aqui' : 'Remover'}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.push('/admin/produtos')}>Cancelar</Button>
        <Button type="submit" variant="primary" loading={saving}>{initial ? 'Salvar alterações' : 'Criar produto'}</Button>
      </div>
    </form>
  )
}
