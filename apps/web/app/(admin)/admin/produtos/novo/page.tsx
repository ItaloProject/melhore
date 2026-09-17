import { requireStore } from '@/lib/queries/store'
import { ProductForm } from '@/components/admin/product-form'

export default async function NovoProdutoPage() {
  const { storeId } = await requireStore()

  return (
    <div className="p-6 space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">Novo Produto</h1>
      <ProductForm storeId={storeId} />
    </div>
  )
}
