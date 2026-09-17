import { notFound } from 'next/navigation'
import { MapPin, Phone, Instagram } from 'lucide-react'
import { getStoreBySlug, getStorefrontProducts } from '@/lib/queries/storefront'
import { StorefrontHeader } from '@/components/storefront/header'
import { ProductGrid } from '@/components/storefront/product-grid'

export const dynamic = 'force-dynamic'

export default async function StorefrontPage({ params }: { params: { store: string } }) {
  const store = await getStoreBySlug(params.store)
  if (!store) notFound()

  const products = await getStorefrontProducts(store.id)

  return (
    <div className="min-h-screen bg-gray-50">
      <StorefrontHeader storeSlug={store.slug} storeName={store.name} logoUrl={store.logo_url} />

      <div
        className="w-full h-40 sm:h-48 flex items-center justify-center text-white"
        style={{ background: `linear-gradient(135deg, ${store.primary_color}, #111827)` }}
      >
        <div className="text-center px-4">
          <h1 className="text-2xl sm:text-3xl font-bold">{store.name}</h1>
          {store.city && (
            <p className="text-white/80 text-sm mt-1">
              {store.city}{store.state ? `, ${store.state}` : ''}
            </p>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <ProductGrid storeSlug={store.slug} products={products} accent={store.primary_color} />

        {(store.address || store.phone || store.instagram) && (
          <div className="mt-12 bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Informações da Loja</h2>
            <div className="grid sm:grid-cols-3 gap-4 text-sm text-gray-600">
              {store.address && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <span>
                    {store.address}
                    {store.city ? `, ${store.city}` : ''}
                    {store.state ? ` - ${store.state}` : ''}
                  </span>
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
                  <a
                    href={`https://instagram.com/${store.instagram}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-brand-600"
                  >
                    @{store.instagram}
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
