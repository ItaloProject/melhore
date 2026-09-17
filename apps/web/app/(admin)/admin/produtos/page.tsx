import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { requireStore } from '@/lib/queries/store'
import { ProdutosClient } from './client'

const PAGE_SIZE = 20

async function getProducts(storeId: string, page: number, q: string) {
  const supabase = createClient()
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  let query = supabase
    .from('products')
    .select(
      `
      id, name, price, active,
      categories(name),
      product_variants(
        id,
        inventory(quantity, reserved)
      )
    `,
      { count: 'exact' }
    )
    .eq('store_id', storeId)

  if (q) query = query.ilike('name', `%${q}%`)

  const { data, count } = await query.order('created_at', { ascending: false }).range(from, to)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const products = (data ?? []).map((p: any) => {
    const variants = p.product_variants ?? []
    const stock = variants.reduce((s: number, v: any) => {
      const inv = v.inventory?.[0]
      return s + ((inv?.quantity ?? 0) - (inv?.reserved ?? 0))
    }, 0)
    return {
      id: p.id,
      name: p.name,
      category: p.categories?.name ?? p.categories?.[0]?.name ?? '—',
      price: Number(p.price),
      variants: variants.length,
      stock,
      active: p.active,
    }
  })

  return { products, total: count ?? 0 }
}

export default async function ProdutosPage({
  searchParams,
}: {
  searchParams: { page?: string; q?: string }
}) {
  const { storeId } = await requireStore()
  const page = Math.max(1, Number(searchParams.page) || 1)
  const q = searchParams.q ?? ''
  const { products, total } = await getProducts(storeId, page, q)

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Produtos</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} produto{total !== 1 ? 's' : ''} cadastrado{total !== 1 ? 's' : ''}</p>
        </div>
        <Link href="/admin/produtos/novo">
          <Button variant="primary">
            <Plus className="w-4 h-4" /> Novo Produto
          </Button>
        </Link>
      </div>

      <ProdutosClient products={products} storeId={storeId} total={total} page={page} pageSize={PAGE_SIZE} initialQuery={q} />
    </div>
  )
}
