import { createClient } from '@/lib/supabase/server'
import { requireStore } from '@/lib/queries/store'
import { CaixaClient } from './client'

async function getCaixaData(storeId: string) {
  const supabase = createClient()

  const { data: session } = await supabase
    .from('cash_sessions')
    .select('id, opening_balance, opened_at')
    .eq('store_id', storeId)
    .eq('status', 'open')
    .maybeSingle()

  if (!session) return { session: null, sales: [] }

  const { data: sales } = await supabase
    .from('sales')
    .select('id, total, payment_method, created_at, sale_items(product_name, variant_label)')
    .eq('session_id', session.id)
    .order('created_at', { ascending: false })

  return {
    session,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sales: (sales ?? []).map((s: any) => ({
      id: s.id,
      total: Number(s.total),
      paymentMethod: s.payment_method,
      createdAt: s.created_at,
      label: s.sale_items?.[0]
        ? s.sale_items[0].product_name + (s.sale_items.length > 1 ? ` +${s.sale_items.length - 1}` : '')
        : 'Venda',
    })),
  }
}

export default async function CaixaPage() {
  const { storeId } = await requireStore()
  const { session, sales } = await getCaixaData(storeId)

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Caixa</h1>
      </div>
      <CaixaClient session={session} sales={sales} />
    </div>
  )
}
