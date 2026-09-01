import { MapPin, Phone, Instagram, Search } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'

// Mock store + products — substituir por Supabase
const store = {
  name: 'Moda Verão',
  slug: 'moda-verao',
  primary_color: '#c026d3',
  banner_url: null,
  logo_url: null,
  address: 'Rua das Flores, 123',
  city: 'São Paulo',
  state: 'SP',
  phone: '(11) 99999-0000',
  whatsapp: '5511999990000',
  instagram: 'modaverao',
}

const categories = ['Todos', 'Camisas', 'Calças', 'Vestidos', 'Blusas', 'Acessórios']

const products = [
  { id: '1', name: 'Camisa Preta Básica', price: 89.90, compare: 119.90, images: [], stock: 15, category: 'Camisas', featured: true },
  { id: '2', name: 'Calça Jeans Skinny',  price: 189.90, compare: null,  images: [], stock: 6,  category: 'Calças',  featured: false },
  { id: '3', name: 'Vestido Floral Midi', price: 229.90, compare: 269.90,images: [], stock: 4,  category: 'Vestidos',featured: true  },
  { id: '4', name: 'Blusa de Frio Cinza', price: 129.90, compare: null,  images: [], stock: 2,  category: 'Blusas', featured: false },
  { id: '5', name: 'Top Cropped Branco',  price: 59.90,  compare: null,  images: [], stock: 9,  category: 'Camisas', featured: false },
  { id: '6', name: 'Bermuda Cargo Bege',  price: 119.90, compare: 149.90,images: [], stock: 0,  category: 'Calças',  featured: false },
]

export default function StorefrontPage({ params }: { params: { store: string } }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-brand-600 text-white font-bold text-sm flex items-center justify-center">
              {store.name.charAt(0)}
            </div>
            <span className="font-bold text-gray-900">{store.name}</span>
          </div>
          <div className="flex-1 max-w-sm hidden sm:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="search"
                placeholder="Buscar produtos..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
          <Link href={`/${params.store}/carrinho`} className="relative p-2 hover:bg-gray-50 rounded-lg">
            <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </Link>
        </div>
      </header>

      {/* Banner */}
      <div className="w-full h-48 bg-gradient-to-r from-brand-600 to-brand-800 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-3xl font-bold">{store.name}</h1>
          <p className="text-brand-100 text-sm mt-1">{store.city}, {store.state}</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-thin">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                cat === 'Todos'
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-brand-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p) => (
            <Link key={p.id} href={`/${params.store}/produto/${p.id}`} className="group">
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                {/* Image placeholder */}
                <div className="aspect-[3/4] bg-gray-100 relative flex items-center justify-center text-gray-300">
                  <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {p.stock === 0 && (
                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                      <Badge variant="default">Esgotado</Badge>
                    </div>
                  )}
                  {p.compare && p.stock > 0 && (
                    <div className="absolute top-2 left-2">
                      <Badge variant="danger">
                        -{Math.round((1 - p.price / p.compare) * 100)}%
                      </Badge>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-brand-600 transition-colors">
                    {p.name}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="text-base font-bold text-gray-900">{formatCurrency(p.price)}</span>
                    {p.compare && (
                      <span className="text-xs text-gray-400 line-through">{formatCurrency(p.compare)}</span>
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

        {/* Store info */}
        <div className="mt-12 bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Informações da Loja</h2>
          <div className="grid sm:grid-cols-3 gap-4 text-sm text-gray-600">
            {store.address && (
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <span>{store.address}, {store.city} - {store.state}</span>
              </div>
            )}
            {store.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                <a href={`tel:${store.phone}`} className="hover:text-brand-600">{store.phone}</a>
              </div>
            )}
            {store.instagram && (
              <div className="flex items-center gap-2">
                <Instagram className="w-4 h-4 text-gray-400 shrink-0" />
                <a href={`https://instagram.com/${store.instagram}`} target="_blank" rel="noreferrer" className="hover:text-brand-600">
                  @{store.instagram}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
