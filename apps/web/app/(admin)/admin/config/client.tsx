'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Save, Store, Phone, MapPin, Palette, Globe, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { updateStoreSettings } from '@/lib/actions/store-settings'

interface StoreRow {
  id: string
  name: string
  slug: string
  phone: string | null
  whatsapp: string | null
  email: string | null
  instagram: string | null
  address: string | null
  city: string | null
  state: string | null
  primary_color: string
  logo_url: string | null
}

export function ConfigClient({ store }: { store: StoreRow }) {
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [logoUrl, setLogoUrl] = useState(store.logo_url)
  const [color, setColor] = useState(store.primary_color)

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `${store.id}/logo.${ext}`

    const { error } = await supabase.storage.from('store-assets').upload(path, file, { upsert: true })
    setUploading(false)

    if (error) {
      toast.error('Erro ao enviar logo: ' + error.message)
      return
    }

    const { data } = supabase.storage.from('store-assets').getPublicUrl(path)
    setLogoUrl(`${data.publicUrl}?v=${Date.now()}`)
    toast.success('Logo enviada! Clique em Salvar para confirmar.')
  }

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)

    const form = new FormData(e.currentTarget)
    const result = await updateStoreSettings({
      name: form.get('name') as string,
      slug: form.get('slug') as string,
      phone: form.get('phone') as string,
      whatsapp: form.get('whatsapp') as string,
      email: form.get('email') as string,
      instagram: form.get('instagram') as string,
      address: form.get('address') as string,
      city: form.get('city') as string,
      state: form.get('state') as string,
      primaryColor: color,
      logoUrl: logoUrl ?? undefined,
    })

    setSaving(false)

    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success('Configurações salvas!')
  }

  return (
    <form onSubmit={handleSave} className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="w-4 h-4 text-gray-400" /> Identidade
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input name="name" label="Nome da loja" defaultValue={store.name} required />
          <Input
            name="slug"
            label="Slug (URL)"
            defaultValue={store.slug}
            required
            leftIcon={<span className="text-gray-400 text-xs">melhore.com.br/</span>}
          />
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Logo</label>
            <label className="flex items-center gap-4 border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-brand-400 cursor-pointer transition-colors">
              <input type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" className="hidden" onChange={handleLogoUpload} />
              {logoUrl ? (
                <Image src={logoUrl} alt="Logo" width={48} height={48} className="rounded-lg object-cover" unoptimized />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                  <Upload className="w-5 h-5" />
                </div>
              )}
              <span className="text-sm text-gray-500">
                {uploading ? 'Enviando...' : logoUrl ? 'Clique para trocar o logo' : 'Clique para fazer upload do logo (PNG, SVG)'}
              </span>
            </label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-gray-400" /> Contato
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input name="phone" label="Telefone" type="tel" defaultValue={store.phone ?? ''} placeholder="(11) 99999-0000" />
          <Input name="whatsapp" label="WhatsApp" type="tel" defaultValue={store.whatsapp ?? ''} placeholder="5511999990000" />
          <Input name="email" label="E-mail" type="email" defaultValue={store.email ?? ''} placeholder="loja@email.com" />
          <Input name="instagram" label="Instagram" defaultValue={store.instagram ?? ''} placeholder="@minha_loja" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-400" /> Endereço
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Input name="address" label="Endereço" defaultValue={store.address ?? ''} placeholder="Rua das Flores, 123" />
          </div>
          <Input name="city" label="Cidade" defaultValue={store.city ?? ''} placeholder="São Paulo" />
          <Input name="state" label="Estado" defaultValue={store.state ?? ''} placeholder="SP" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-gray-400" /> Aparência da Vitrine
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cor principal</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-12 h-10 rounded-lg border border-gray-300 cursor-pointer"
              />
              <span className="text-sm text-gray-500">Usada em botões e destaques da vitrine</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-gray-400" /> Vitrine Online
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <span className="text-sm text-gray-500 flex-1 truncate">
              melhore.com.br/<span className="font-semibold text-gray-900">{store.slug}</span>
            </span>
            <Button variant="outline" size="sm" type="button" onClick={() => window.open(`/${store.slug}`, '_blank')}>
              Abrir vitrine
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button variant="primary" size="lg" type="submit" loading={saving}>
          <Save className="w-4 h-4" /> Salvar Configurações
        </Button>
      </div>
    </form>
  )
}
