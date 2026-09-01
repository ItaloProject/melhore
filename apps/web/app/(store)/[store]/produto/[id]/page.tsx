'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ShoppingCart, MessageCircle, MapPin, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'

// Mock product
const product = {
  id: '1',
  name: 'Camisa Preta Básica',
  price: 89.90,
  compare: 119.90,
  description: 'Camisa básica de algodão premium. Caimento perfeito, tecido macio e respirável. Ideal para o dia a dia ou ocasiões mais descontraídas.',
  images: [],
  sizes: ['P', 'M', 'G', 'GG'],
  colors: [
    { name: 'Preta', hex: '#1a1a1a' },
    { name: 'Branca', hex: '#f5f5f5' },
    { name: 'Cinza',  hex: '#9ca3af' },
  ],
  stock: {
    'P-Preta': 4, 'M-Preta': 8, 'G-Preta': 5, 'GG-Preta': 2,
    'P-Branca': 3, 'M-Branca': 6, 'G-Branca': 0, 'GG-Branca': 4,
    'P-Cinza':  2, 'M-Cinza':  5, 'G-Cinza':  3, 'GG-Cinza': 1,
  },
}

export default function ProductPage({ params }: { params: { store: string; id: string } }) {
  const [size, setSize] = useState<string | null>(null)
  const [color, setColor] = useState<string | null>(null)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  const stockKey = size && color ? `${size}-${color}` : null
  const available = stockKey ? (product.stock[stockKey as keyof typeof product.stock] ?? 0) : null
  const canAdd = available !== null && available > 0

  const handleAdd = () => {
    if (!canAdd) return
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center gap-3">
          <Link href={`/${params.store}`} className="p-1.5 hover:bg-gray-50 rounded-lg -ml-1.5">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <span className="text-sm text-gray-500">{product.name}</span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Images */}
          <div>
            <div className="aspect-square bg-white rounded-xl border border-gray-200 flex items-center justify-center text-gray-300">
              <svg className="w-24 h-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>

          {/* Info */}
          <div className="space-y-5">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-2xl font-bold text-gray-900">{formatCurrency(product.price)}</span>
                {product.compare && (
                  <>
                    <span className="text-base text-gray-400 line-through">{formatCurrency(product.compare)}</span>
                    <Badge variant="danger">
                      -{Math.round((1 - product.price / product.compare) * 100)}%
                    </Badge>
                  </>
                )}
              </div>
            </div>

            {/* Color selector */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                Cor{color ? `: ${color}` : ''}
              </p>
              <div className="flex gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setColor(c.name)}
                    title={c.name}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      color === c.name ? 'border-brand-500 scale-110' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
            </div>

            {/* Size selector */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                Tamanho{size ? `: ${size}` : ''}
              </p>
              <div className="flex gap-2 flex-wrap">
                {product.sizes.map((s) => {
                  const key = color ? `${s}-${color}` : null
                  const qty = key ? (product.stock[key as keyof typeof product.stock] ?? 0) : null
                  const outOfStock = qty === 0
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

            {/* Stock info */}
            {available !== null && (
              <div className="flex items-center gap-2">
                {available > 0 ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-700 font-medium">
                      {available <= 3 ? `Últimas ${available} unidades` : `Em estoque (${available})`}
                    </span>
                  </>
                ) : (
                  <span className="text-sm text-red-600 font-medium">Sem estoque nessa combinação</span>
                )}
              </div>
            )}

            {/* Qty */}
            {canAdd && (
              <div className="flex items-center gap-3">
                <p className="text-sm font-medium text-gray-700">Qtd:</p>
                <div className="flex items-center gap-2 border border-gray-300 rounded-lg overflow-hidden">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-3 py-2 text-gray-600 hover:bg-gray-50">−</button>
                  <span className="px-3 text-sm font-semibold">{qty}</span>
                  <button onClick={() => setQty(q => Math.min(available!, q + 1))} className="px-3 py-2 text-gray-600 hover:bg-gray-50">+</button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="primary"
                size="lg"
                className="flex-1"
                disabled={!canAdd}
                onClick={handleAdd}
              >
                {added ? (
                  <><CheckCircle className="w-4 h-4" /> Adicionado!</>
                ) : (
                  <><ShoppingCart className="w-4 h-4" /> Adicionar ao Carrinho</>
                )}
              </Button>
              <a
                href={`https://wa.me/5511999990000?text=Olá! Tenho interesse na ${product.name}${size ? ` (${size}` : ''}${color ? ` / ${color})` : '.'}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-green-500 text-green-700 hover:bg-green-50 text-sm font-medium transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </a>
            </div>

            {/* Description */}
            <div className="border-t border-gray-100 pt-5">
              <p className="text-sm text-gray-500 leading-relaxed">{product.description}</p>
            </div>

            {/* Location */}
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <MapPin className="w-4 h-4" />
              <span>Rua das Flores, 123 — São Paulo, SP</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
