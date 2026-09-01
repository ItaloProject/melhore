import { Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { createClient } from '@/lib/supabase/server'
import { requireStore } from '@/lib/queries/store'
import { ProdutosClient } from './client'

async function getProducts(storeId: string) {
  const supabase = createClient()
  const { data } = await supabase
    .from('products')
    .select(`
      id, name, price, active,
      categories(name),
      product_variants(
        id,
        inventory(quantity, reserved)
      )
    `)
    .eq('store_id', storeId)
    .order('created_at', { ascending: false })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((p: any) => {
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
}

export default async function ProdutosPage() {
  const { storeId } = await requireStore()
  const products = await getProducts(storeId)

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Produtos</h1>
          <p className="text-sm text-gray-500 mt-0.5">{products.length} produto{products.length !== 1 ? 's' : ''} cadastrado{products.length !== 1 ? 's' : ''}</p>
        </div>
        <Button variant="primary">
          <Plus className="w-4 h-4" /> Novo Produto
        </Button>
      </div>

      <ProdutosClient products={products} storeId={storeId} />
    </div>
  )
}
