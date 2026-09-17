import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { getStoreBySlug } from '@/lib/queries/storefront'
import { CartClient } from '@/components/storefront/cart-client'

export const dynamic = 'force-dynamic'

export default async function CarrinhoPage({ params }: { params: { store: string } }) {
  const store = await getStoreBySlug(params.store)
  if (!store) notFound()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center gap-3">
          <Link href={`/${params.store}`} className="p-1.5 hover:bg-gray-50 rounded-lg -ml-1.5">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="font-semibold text-gray-900">Carrinho</h1>
        </div>
      </header>

      <CartClient storeSlug={store.slug} whatsapp={store.whatsapp} />
    </div>
  )
}
