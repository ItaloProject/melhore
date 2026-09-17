import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { getStoreBySlug, getStorefrontProduct } from '@/lib/queries/storefront'
import { ProductDetail } from '@/components/storefront/product-detail'

export const dynamic = 'force-dynamic'

export default async function ProductPage({ params }: { params: { store: string; id: string } }) {
  const store = await getStoreBySlug(params.store)
  if (!store) notFound()

  const product = await getStorefrontProduct(store.id, params.id)
  if (!product) notFound()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center gap-3">
          <Link href={`/${params.store}`} className="p-1.5 hover:bg-gray-50 rounded-lg -ml-1.5">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <span className="text-sm text-gray-500 truncate">{product.name}</span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <ProductDetail storeSlug={store.slug} product={product} whatsapp={store.whatsapp} />
      </div>
    </div>
  )
}
