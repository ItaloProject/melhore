import Link from 'next/link'
import { requirePlatformAdmin, storeAccess } from '@/lib/auth/platform'
import { getPlatformStores } from '@/lib/queries/platform'
import { billingLabel, accessLabel } from '@/lib/platform/labels'
import { formatCurrency, formatDate } from '@/lib/utils'

export default async function BillingPage() {
  await requirePlatformAdmin()
  const stores = await getPlatformStores()
  const expected = stores.reduce((sum, store) => sum + Number(store.monthly_price || 0), 0)
  const paid = stores.filter((s) => s.billing_status === 'paid')
  const late = stores.filter((s) => storeAccess(s) !== 'ok')

  return (
    <div className="p-7 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mensalidades</h1>
        <p className="text-sm text-slate-400 mt-1">Quem pagou, quem está em trial e quem pode voltar depois de 1 mês parado.</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Stat label="Receita prevista / mês" value={formatCurrency(expected)} />
        <Stat label="Lojas pagas" value={String(paid.length)} />
        <Stat label="Pendentes ou bloqueadas" value={String(late.length)} />
      </div>

      <div className="rounded-2xl border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-[11px] uppercase tracking-wider text-slate-500">
            <tr>
              <th className="text-left font-medium px-4 py-3">Loja</th>
              <th className="text-left font-medium px-4 py-3">Valor</th>
              <th className="text-left font-medium px-4 py-3">Status</th>
              <th className="text-left font-medium px-4 py-3">Vencimento</th>
              <th className="text-left font-medium px-4 py-3">Último pagamento</th>
              <th className="text-left font-medium px-4 py-3">Acesso</th>
            </tr>
          </thead>
          <tbody>
            {stores.map((store) => (
              <tr key={store.id} className="border-t border-white/5">
                <td className="px-4 py-3">
                  <Link href={`/plataforma/lojas/${store.id}`} className="font-medium hover:text-brand-300">
                    {store.name}
                  </Link>
                </td>
                <td className="px-4 py-3">{formatCurrency(store.monthly_price)}</td>
                <td className="px-4 py-3">{billingLabel(store.billing_status)}</td>
                <td className="px-4 py-3 text-slate-400">
                  {store.current_period_end ? formatDate(store.current_period_end) : store.trial_ends_at ? formatDate(store.trial_ends_at) : '—'}
                </td>
                <td className="px-4 py-3 text-slate-400">
                  {store.last_payment_at ? formatDate(store.last_payment_at) : '—'}
                </td>
                <td className="px-4 py-3 text-xs text-slate-500">{accessLabel(store)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-xs text-slate-400 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold mt-2">{value}</p>
    </div>
  )
}
