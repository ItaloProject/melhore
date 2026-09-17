import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requireStore } from '@/lib/queries/store'
import { ProductForm, type ProductFormInitial } from '@/components/admin/product-form'

async function getProduct(storeId: string, productId: string): Promise<ProductFormInitial | null> {
  const supabase = createClient()
  const { data } = await supabase
    .from('products')
    .select(`
      id, name, description, price, compare_price, images, active,
      categories(name),
      product_variants(id, size, color, color_hex, price_override, inventory(quantity, min_quantity))
    `)
    .eq('store_id', storeId)
    .eq('id', productId)
    .maybeSingle()

  if (!data) return null

  return {
    id: data.id,
    name: data.name,
    description: data.description,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    category: (data.categories as any)?.name ?? (data.categories as any)?.[0]?.name ?? null,
    price: Number(data.price),
    comparePrice: data.compare_price != null ? Number(data.compare_price) : null,
    images: data.images ?? [],
    active: data.active,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    variants: (data.product_variants ?? []).map((v: any) => {
      const inv = Array.isArray(v.inventory) ? v.inventory[0] : v.inventory
      return {
        id: v.id,
        size: v.size,
        color: v.color,
        colorHex: v.color_hex,
        priceOverride: v.price_override != null ? Number(v.price_override) : null,
        quantity: inv?.quantity ?? 0,
        minQuantity: inv?.min_quantity ?? 3,
      }
    }),
  }
}

export default async function EditarProdutoPage({ params }: { params: { id: string } }) {
  const { storeId } = await requireStore()
  const product = await getProduct(storeId, params.id)
  if (!product) notFound()

  return (
    <div className="p-6 space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">Editar Produto</h1>
      <ProductForm storeId={storeId} initial={product} />
    </div>
  )
}
