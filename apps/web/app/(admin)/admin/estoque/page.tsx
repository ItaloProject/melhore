import { Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { requireStore } from '@/lib/queries/store'
import { EstoqueClient } from './client'

async function getInventory(storeId: string) {
  const supabase = createClient()
  const { data } = await supabase
    .from('inventory')
    .select(`
      id, quantity, reserved, min_quantity,
      product_variants(
        id, size, color,
        products(name)
      )
    `)
    .eq('store_id', storeId)
    .order('quantity', { ascending: true })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((i: any) => ({
    id: i.id,
    variantId: i.product_variants?.id ?? '',
    product: i.product_variants?.products?.name ?? i.product_variants?.products?.[0]?.name ?? '—',
    size:  i.product_variants?.size  ?? '—',
    color: i.product_variants?.color ?? '—',
    qty:      i.quantity,
    reserved: i.reserved,
    min:      i.min_quantity,
  }))
}

export default async function EstoquePage() {
  const { storeId } = await requireStore()
  const inventory = await getInventory(storeId)

  const normal   = inventory.filter(i => (i.qty - i.reserved) > i.min).length
  const critical = inventory.filter(i => (i.qty - i.reserved) > 0 && (i.qty - i.reserved) <= i.min).length
  const empty    = inventory.filter(i => (i.qty - i.reserved) === 0).length

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Estoque</h1>
          <p className="text-sm text-gray-500 mt-0.5">Controle por variação (tamanho + cor)</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Filter className="w-4 h-4" /> Filtros</Button>
          <Button variant="primary">Ajustar Estoque</Button>
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        <span className="inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-1.5 text-sm font-medium text-green-700">
          {normal} variações normais
        </span>
        <span className="inline-flex items-center gap-2 rounded-full bg-yellow-50 px-4 py-1.5 text-sm font-medium text-yellow-700">
          {critical} variações críticas
        </span>
        <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-1.5 text-sm font-medium text-red-700">
          {empty} sem estoque
        </span>
      </div>

      <EstoqueClient inventory={inventory} storeId={storeId} />
    </div>
  )
}
