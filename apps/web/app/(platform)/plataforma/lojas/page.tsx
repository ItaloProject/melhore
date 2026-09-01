import Link from 'next/link'
import { requirePlatformAdmin, storeAccess } from '@/lib/auth/platform'
import { getPlatformStores } from '@/lib/queries/platform'
import { accountLabel, billingLabel, accessLabel } from '@/lib/platform/labels'
import { formatDate } from '@/lib/utils'

export default async function PlatformStoresPage({
  searchParams,
}: {
  searchParams: { status?: string; q?: string }
}) {
  await requirePlatformAdmin()
  const all = await getPlatformStores()
  const q = (searchParams.q ?? '').trim().toLowerCase()
  const status = searchParams.status ?? 'all'

  const stores = all.filter((store) => {
    const access = storeAccess(store)
    if (status === 'active' && store.account_status !== 'active') return false
    if (status === 'inactive' && store.account_status !== 'inactive') return false
    if (status === 'late' && access === 'ok') return false
    if (q && !`${store.name} ${store.slug} ${store.owner_email ?? ''} ${store.phone ?? ''}`.toLowerCase().includes(q)) {
      return false
    }
    return true
  })

  const filters = [
    { id: 'all', label: 'Todas' },
    { id: 'active', label: 'Ativas' },
    { id: 'inactive', label: 'Inativas' },
    { id: 'late', label: 'Atrasadas / bloqueadas' },
  ]

  return (
    <div className="p-7 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Lojas</h1>
          <p className="text-sm text-slate-400 mt-1">{stores.length} resultado(s)</p>
        </div>
        <form className="flex gap-2">
          <input
            name="q"
            defaultValue={searchParams.q}
            placeholder="Buscar nome, e-mail, telefone"
            className="w-64 rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm placeholder:text-slate-600"
          />
          <button className="rounded-xl bg-brand-600 px-4 text-sm font-medium">Filtrar</button>
        </form>
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <Link
            key={filter.id}
            href={filter.id === 'all' ? '/plataforma/lojas' : `/plataforma/lojas?status=${filter.id}`}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
              status === filter.id
                ? 'bg-brand-600/20 border-brand-500/40 text-brand-200'
                : 'border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            {filter.label}
          </Link>
        ))}
      </div>

      <div className="rounded-2xl border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-[11px] uppercase tracking-wider text-slate-500">
            <tr>
              <th className="text-left font-medium px-4 py-3">Loja</th>
              <th className="text-left font-medium px-4 py-3">Dono</th>
              <th className="text-left font-medium px-4 py-3">Conta</th>
              <th className="text-left font-medium px-4 py-3">Mensalidade</th>
              <th className="text-left font-medium px-4 py-3">Acesso</th>
              <th className="text-left font-medium px-4 py-3">Criada</th>
            </tr>
          </thead>
          <tbody>
            {stores.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-slate-500">Nenhuma loja neste filtro.</td>
              </tr>
            ) : stores.map((store) => (
              <tr key={store.id} className="border-t border-white/5 hover:bg-white/[0.03]">
                <td className="px-4 py-3">
                  <Link href={`/plataforma/lojas/${store.id}`} className="font-medium hover:text-brand-300">
                    {store.name}
                  </Link>
                  <p className="text-xs text-slate-500">/{store.slug}</p>
                </td>
                <td className="px-4 py-3 text-slate-300">
                  {store.owner_email ?? '—'}
                  {store.phone && <p className="text-xs text-slate-500">{store.phone}</p>}
                </td>
                <td className="px-4 py-3">{accountLabel(store.account_status)}</td>
                <td className="px-4 py-3">{billingLabel(store.billing_status)}</td>
                <td className="px-4 py-3 text-xs text-slate-400">{accessLabel(store)}</td>
                <td className="px-4 py-3 text-slate-500">{store.created_at ? formatDate(store.created_at) : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
