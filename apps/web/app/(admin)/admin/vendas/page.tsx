import { createClient } from '@/lib/supabase/server'
import { requireStore } from '@/lib/queries/store'
import { VendasClient } from './client'

async function getOpenSession(storeId: string) {
  const supabase = createClient()
  const { data } = await supabase
    .from('cash_sessions')
    .select('id')
    .eq('store_id', storeId)
    .eq('status', 'open')
    .order('opened_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  return data?.id ?? null
}

export default async function VendasPage() {
  const { storeId } = await requireStore()
  const sessionId = await getOpenSession(storeId)

  return (
    <div className="p-6 space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">PDV — Venda Balcão</h1>
      {!sessionId && (
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
          Nenhum caixa aberto.{' '}
          <a href="/admin/caixa" className="font-semibold underline">Abrir caixa</a> antes de registrar vendas.
        </div>
      )}
      <VendasClient storeId={storeId} sessionId={sessionId} />
    </div>
  )
}
