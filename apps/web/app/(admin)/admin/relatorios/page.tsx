import { createClient } from '@/lib/supabase/server'
import { requireStore } from '@/lib/queries/store'
import { RelatoriosClient } from './client'

async function getSales(storeId: string) {
  const supabase = createClient()
  const since = new Date()
  since.setDate(since.getDate() - 90)

  const { data } = await supabase
    .from('sales')
    .select('id, total, payment_method, created_at, sale_items(product_name, quantity, total)')
    .eq('store_id', storeId)
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: false })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((s: any) => ({
    id: s.id,
    total: Number(s.total),
    paymentMethod: s.payment_method as string,
    createdAt: s.created_at as string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    items: (s.sale_items ?? []).map((i: any) => ({
      productName: i.product_name as string,
      quantity: i.quantity as number,
      total: Number(i.total),
    })),
  }))
}

export default async function RelatoriosPage() {
  const { storeId } = await requireStore()
  const sales = await getSales(storeId)

  return (
    <div className="p-6 space-y-5">
      <RelatoriosClient sales={sales} />
    </div>
  )
}
