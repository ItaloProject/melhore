import { createClient } from '@/lib/supabase/server'
import { requireStore } from '@/lib/queries/store'
import { PedidosClient } from './client'

async function getOrders(storeId: string) {
  const supabase = createClient()
  const { data } = await supabase
    .from('orders')
    .select('id, customer_name, customer_email, customer_phone, status, type, total, notes, created_at, order_items(product_name, variant_label, quantity, unit_price, total)')
    .eq('store_id', storeId)
    .order('created_at', { ascending: false })
    .limit(100)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((o: any) => ({
    id: o.id,
    customerName: o.customer_name,
    customerEmail: o.customer_email,
    customerPhone: o.customer_phone,
    status: o.status,
    type: o.type,
    total: Number(o.total),
    notes: o.notes,
    createdAt: o.created_at,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    items: (o.order_items ?? []).map((i: any) => ({
      productName: i.product_name,
      variantLabel: i.variant_label,
      quantity: i.quantity,
      unitPrice: Number(i.unit_price),
      total: Number(i.total),
    })),
  }))
}

export default async function PedidosPage() {
  const { storeId } = await requireStore()
  const orders = await getOrders(storeId)

  return (
    <div className="p-6 space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>
      <PedidosClient orders={orders} />
    </div>
  )
}
