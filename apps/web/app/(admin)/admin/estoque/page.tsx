import { createClient } from '@/lib/supabase/server'
import { requireStore } from '@/lib/queries/store'
import { EstoqueClient } from './client'

const PAGE_SIZE = 20

async function getInventory(storeId: string, page: number, q: string) {
  const supabase = createClient()
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  let query = supabase
    .from('product_variants')
    .select(
      `
      id, size, color,
      products!inner(name, store_id),
      inventory!inner(id, quantity, reserved, min_quantity)
    `,
      { count: 'exact' }
    )
    .eq('products.store_id', storeId)

  if (q) {
    query = query.or(`products.name.ilike.%${q}%,size.ilike.%${q}%,color.ilike.%${q}%`)
  }

  const { data, count } = await query.order('id').range(from, to)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const items = (data ?? []).map((v: any) => {
    const inv = Array.isArray(v.inventory) ? v.inventory[0] : v.inventory
    const prod = Array.isArray(v.products) ? v.products[0] : v.products
    return {
      id: inv?.id,
      variantId: v.id,
      product: prod?.name ?? '—',
      size: v.size ?? '—',
      color: v.color ?? '—',
      qty: inv?.quantity ?? 0,
      reserved: inv?.reserved ?? 0,
      min: inv?.min_quantity ?? 3,
    }
  })

  return { items, total: count ?? 0 }
}

export default async function EstoquePage({
  searchParams,
}: {
  searchParams: { page?: string; q?: string }
}) {
  const { storeId } = await requireStore()
  const page = Math.max(1, Number(searchParams.page) || 1)
  const q = searchParams.q ?? ''
  const { items, total } = await getInventory(storeId, page, q)

  const normal   = items.filter(i => (i.qty - i.reserved) > i.min).length
  const critical = items.filter(i => (i.qty - i.reserved) > 0 && (i.qty - i.reserved) <= i.min).length
  const empty    = items.filter(i => (i.qty - i.reserved) === 0).length

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Estoque</h1>
        <p className="text-sm text-gray-500 mt-0.5">Controle por variação (tamanho + cor)</p>
      </div>

      <div className="flex gap-3 flex-wrap">
        <span className="inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-1.5 text-sm font-medium text-green-700">
          {normal} variações normais (nesta página)
        </span>
        <span className="inline-flex items-center gap-2 rounded-full bg-yellow-50 px-4 py-1.5 text-sm font-medium text-yellow-700">
          {critical} variações críticas
        </span>
        <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-1.5 text-sm font-medium text-red-700">
          {empty} sem estoque
        </span>
      </div>

      <EstoqueClient inventory={items} storeId={storeId} total={total} page={page} pageSize={PAGE_SIZE} initialQuery={q} />
    </div>
  )
}
