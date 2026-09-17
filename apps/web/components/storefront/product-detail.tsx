'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { ShoppingCart, MessageCircle, CheckCircle, ImageOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { useCartStore } from '@/lib/stores/cart'
import type { StorefrontProductDetail } from '@/lib/queries/storefront'

function variantLabel(size: string | null, color: string | null) {
  return [size, color].filter(Boolean).join(' / ') || 'Único'
}

export function ProductDetail({
  storeSlug,
  product,
  whatsapp,
}: {
  storeSlug: string
  product: StorefrontProductDetail
  whatsapp: string | null
}) {
  const addItem = useCartStore((s) => s.addItem)
  const [size, setSize] = useState<string | null>(null)
  const [color, setColor] = useState<string | null>(null)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  const sizes = useMemo(
    () => Array.from(new Set(product.variants.map((v) => v.size).filter(Boolean))) as string[],
    [product.variants]
  )
  const colors = useMemo(() => {
    const map = new Map<string, string | null>()
    product.variants.forEach((v) => {
      if (v.color) map.set(v.color, v.colorHex)
    })
    return Array.from(map.entries()).map(([name, hex]) => ({ name, hex }))
  }, [product.variants])

  const needsSize = sizes.length > 0
  const needsColor = colors.length > 0

  const selected = product.variants.find(
    (v) => (!needsSize || v.size === size) && (!needsColor || v.color === color)
  )

  const ready = (!needsSize || size) && (!needsColor || color)
  const canAdd = ready && !!selected && selected.available > 0

  const handleAdd = () => {
    if (!selected || !canAdd) return
    addItem(
      storeSlug,
      {
        variantId: selected.id,
        productId: product.id,
        productName: product.name,
        variantLabel: variantLabel(selected.size, selected.color),
        price: selected.price,
        image: product.images[0] ?? null,
        maxQty: selected.available,
      },
      qty
    )
    setAdded(true)
    setQty(1)
    setTimeout(() => setAdded(false), 2000)
  }

  const waMessage = encodeURIComponent(
    `Olá! Tenho interesse na ${product.name}${selected ? ` (${variantLabel(selected.size, selected.color)})` : ''}.`
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Images */}
      <div>
        <div className="aspect-square bg-white rounded-xl border border-gray-200 relative flex items-center justify-center text-gray-300 overflow-hidden">
          {product.images[0] ? (
            <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
          ) : (
            <ImageOff className="w-20 h-20" strokeWidth={1} />
          )}
        </div>
      </div>

      {/* Info */}
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
          {selected && (
            <div className="flex items-center gap-3 mt-2">
              <span className="text-2xl font-bold text-gray-900">{formatCurrency(selected.price)}</span>
            </div>
          )}
        </div>

        {needsColor && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Cor{color ? `: ${color}` : ''}</p>
            <div className="flex gap-2">
              {colors.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setColor(c.name)}
                  title={c.name}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    color === c.name ? 'border-brand-500 scale-110' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: c.hex ?? '#ccc' }}
                />
              ))}
            </div>
          </div>
        )}

        {needsSize && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Tamanho{size ? `: ${size}` : ''}</p>
            <div className="flex gap-2 flex-wrap">
              {sizes.map((s) => {
                const match = product.variants.find(
                  (v) => v.size === s && (!needsColor || v.color === color)
                )
                const outOfStock = needsColor && color ? (match?.available ?? 0) === 0 : false
                return (
                  <button
                    key={s}
                    onClick={() => !outOfStock && setSize(s)}
                    disabled={outOfStock}
                    className={`w-12 h-12 rounded-lg border-2 text-sm font-semibold transition-colors ${
                      size === s
                        ? 'border-brand-500 bg-brand-50 text-brand-700'
                        : outOfStock
                        ? 'border-gray-200 text-gray-300 cursor-not-allowed line-through'
                        : 'border-gray-300 text-gray-700 hover:border-brand-400'
                    }`}
                  >
                    {s}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {ready && (
          <div className="flex items-center gap-2">
            {selected && selected.available > 0 ? (
              <>
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-700 font-medium">
                  {selected.available <= 3 ? `Últimas ${selected.available} unidades` : `Em estoque (${selected.available})`}
                </span>
              </>
            ) : (
              <span className="text-sm text-red-600 font-medium">Sem estoque nessa combinação</span>
            )}
          </div>
        )}

        {canAdd && (
          <div className="flex items-center gap-3">
            <p className="text-sm font-medium text-gray-700">Qtd:</p>
            <div className="flex items-center gap-2 border border-gray-300 rounded-lg overflow-hidden">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-3 py-2 text-gray-600 hover:bg-gray-50">−</button>
              <span className="px-3 text-sm font-semibold">{qty}</span>
              <button onClick={() => setQty((q) => Math.min(selected!.available, q + 1))} className="px-3 py-2 text-gray-600 hover:bg-gray-50">+</button>
            </div>
          </div>
        )}

        <div className="flex gap-3 flex-wrap">
          <Button variant="primary" size="lg" className="flex-1" disabled={!canAdd} onClick={handleAdd}>
            {added ? (
              <><CheckCircle className="w-4 h-4" /> Adicionado!</>
            ) : (
              <><ShoppingCart className="w-4 h-4" /> Adicionar ao Carrinho</>
            )}
          </Button>
          {whatsapp && (
            <a
              href={`https://wa.me/${whatsapp}?text=${waMessage}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-green-500 text-green-700 hover:bg-green-50 text-sm font-medium transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </a>
          )}
        </div>

        {product.description && (
          <div className="border-t border-gray-100 pt-5">
            <p className="text-sm text-gray-500 leading-relaxed">{product.description}</p>
          </div>
        )}
      </div>
    </div>
  )
}
