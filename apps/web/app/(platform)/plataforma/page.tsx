import Link from 'next/link'
import { Building2, Ban, Database, Wallet, Clock, Users, Landmark, ShoppingBag } from 'lucide-react'
import { requirePlatformAdmin } from '@/lib/auth/platform'
import { getPlatformStats, getPlatformStores } from '@/lib/queries/platform'
import { formatCurrency } from '@/lib/utils'
import { storeAccess } from '@/lib/auth/platform'
import { billingLabel } from '@/lib/platform/labels'

export default async function PlatformHomePage() {
  await requirePlatformAdmin()
  const [{ stats, setupRequired }, stores] = await Promise.all([
    getPlatformStats(),
    getPlatformStores(),
  ])

  const late = stores.filter((s) => storeAccess(s) !== 'ok')

  const cards = [
    { label: 'Lojas ativas', value: stats.stores_active, icon: Building2, hint: 'Contas liberadas' },
    { label: 'Lojas inativas', value: stats.stores_inactive, icon: Ban, hint: 'Bloqueadas por você' },
    { label: 'Bancos criados', value: stats.stores_total, icon: Database, hint: 'Cada loja é um banco de dados' },
    { label: 'Mensalidades em dia', value: stats.billing_paid, icon: Wallet, hint: 'Pagas no período' },
    { label: 'Atrasadas / trial', value: `${stats.billing_late} / ${stats.billing_trial}`, icon: Clock, hint: 'Cobrança pendente' },
    { label: 'Usuários', value: stats.users_total, icon: Users, hint: 'Logins nas lojas' },
    { label: 'Caixas abertos', value: stats.cash_open, icon: Landmark, hint: 'PDV em operação' },
    { label: 'Vendas no mês', value: formatCurrency(Number(stats.sales_month)), icon: ShoppingBag, hint: 'Soma de todas as lojas' },
  ]

  return (
    <div className="p-7 space-y-8">
      <div>
        <p className="text-[11px] uppercase tracking-widest text-brand-300/80 font-semibold">Console do dono</p>
        <h1 className="text-2xl font-bold tracking-tight mt-1">Visão da plataforma</h1>
        <p className="text-sm text-slate-400 mt-1">Lojas, assinaturas e operação — sem misturar com o PDV de uma loja.</p>
      </div>

      {setupRequired && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 text-sm text-amber-100">
          Rode o SQL <code className="text-amber-200">supabase/migrations/20260901210000_platform_console.sql</code> no editor SQL do Supabase
          e coloque seu e-mail em <code className="text-amber-200">PLATFORM_ADMIN_EMAILS</code>. Sem isso, a lista pode vir vazia.
        </div>
      )}

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-slate-400 uppercase tracking-wide">{card.label}</p>
              <card.icon className="w-4 h-4 text-brand-400" />
            </div>
            <p className="text-2xl font-bold tracking-tight">{card.value}</p>
            <p className="text-[11px] text-slate-500 mt-1">{card.hint}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold">Atenção agora</h2>
            <Link href="/plataforma/mensalidades" className="text-xs text-brand-300 hover:text-white">Ver mensalidades</Link>
          </div>
          {late.length === 0 ? (
            <p className="text-sm text-slate-500">Nenhuma loja atrasada ou bloqueada.</p>
          ) : (
            <ul className="space-y-2">
              {late.slice(0, 8).map((store) => (
                <li key={store.id} className="flex items-center justify-between gap-3 text-sm">
                  <Link href={`/plataforma/lojas/${store.id}`} className="font-medium hover:text-brand-300 truncate">
                    {store.name}
                  </Link>
                  <span className="text-xs text-slate-500 shrink-0">{billingLabel(store.billing_status)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-sm font-semibold mb-3">Próximos passos que valem a pena</h2>
          <ul className="text-sm text-slate-400 space-y-2 leading-relaxed">
            <li>• PIX automático (Mercado Pago) para marcar pagamento sem você lançar na mão.</li>
            <li>• Aviso no WhatsApp 3 dias antes da mensalidade e no dia do vencimento.</li>
            <li>• Histórico de quem você impersonou (auditoria completa).</li>
            <li>• Planos (básico / completo) com teto de produtos e usuários.</li>
            <li>• Backup agendado no Storage, não só download JSON.</li>
            <li>• Trial de 14 dias já entra no cadastro; depois a loja cai em carência de 1 mês e pode voltar pagando — os dados não são apagados.</li>
          </ul>
        </section>
      </div>
    </div>
  )
}
