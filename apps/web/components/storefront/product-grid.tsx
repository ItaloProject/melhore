'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, ImageOff } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import type { StorefrontProduct } from '@/lib/queries/storefront'

export function ProductGrid({
  storeSlug,
  products,
  accent,
}: {
  storeSlug: string
  products: StorefrontProduct[]
  accent: string
}) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('Todos')

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category).filter(Boolean) as string[])
    return ['Todos', ...Array.from(set)]
  }, [products])

  const filtered = products.filter(
    (p) =>
      (category === 'Todos' || p.category === category) &&
      p.name.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div>
      <div className="relative max-w-sm mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          type="search"
          placeholder="Buscar produtos..."
          className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      {categories.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-thin">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                category === cat
                  ? 'text-white border-transparent'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-brand-400'
              }`}
              style={category === cat ? { background: accent } : undefined}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {products.length === 0 ? (
        <p className="text-center text-gray-400 py-16 text-sm">
          Essa loja ainda não cadastrou produtos.
        </p>
      ) : filtered.length === 0 ? (
        <p className="text-center text-gray-400 py-16 text-sm">Nenhum produto encontrado.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((p) => (
            <Link key={p.id} href={`/${storeSlug}/produto/${p.id}`} className="group">
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-[3/4] bg-gray-100 relative flex items-center justify-center text-gray-300">
                  {p.images[0] ? (
                    <Image src={p.images[0]} alt={p.name} fill className="object-cover" />
                  ) : (
                    <ImageOff className="w-10 h-10" strokeWidth={1} />
                  )}
                  {p.stock === 0 && (
                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                      <Badge variant="default">Esgotado</Badge>
                    </div>
                  )}
                  {p.comparePrice && p.stock > 0 && (
                    <div className="absolute top-2 left-2">
                      <Badge variant="danger">-{Math.round((1 - p.price / p.comparePrice) * 100)}%</Badge>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-brand-600 transition-colors">
                    {p.name}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="text-base font-bold text-gray-900">{formatCurrency(p.price)}</span>
                    {p.comparePrice && (
                      <span className="text-xs text-gray-400 line-through">{formatCurrency(p.comparePrice)}</span>
                    )}
                  </div>
                  {p.stock > 0 && p.stock <= 3 && (
                    <p className="text-xs text-orange-600 font-medium mt-1">Últimas {p.stock} unidades</p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
