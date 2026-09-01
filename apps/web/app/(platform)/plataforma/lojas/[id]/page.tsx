import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requirePlatformAdmin, storeAccess } from '@/lib/auth/platform'
import { getPlatformStore, getStorePayments } from '@/lib/queries/platform'
import { recordStorePayment, updatePlatformStore } from '@/lib/actions/platform'
import { accountLabel, billingLabel, accessLabel } from '@/lib/platform/labels'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  BackupButton,
  OpenStoreButton,
  StatusButtons,
  UnpaidButton,
} from '@/components/platform/store-actions'

export default async function PlatformStorePage({ params }: { params: { id: string } }) {
  await requirePlatformAdmin()
  const store = await getPlatformStore(params.id)
  if (!store) notFound()
  const payments = await getStorePayments(store.id)
  const access = storeAccess(store)

  return (
    <div className="p-7 space-y-6 max-w-5xl">
      <div>
        <Link href="/plataforma/lojas" className="text-xs text-slate-500 hover:text-white">← Lojas</Link>
        <h1 className="text-2xl font-bold tracking-tight mt-2">{store.name}</h1>
        <p className="text-sm text-slate-400 mt-1">
          {accountLabel(store.account_status)} · {billingLabel(store.billing_status)} · {accessLabel(store)}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <OpenStoreButton storeId={store.id} />
        <Link
          href={`/${store.slug}`}
          target="_blank"
          className="inline-flex items-center rounded-xl border border-white/10 px-4 py-2 text-sm font-medium hover:bg-white/5"
        >
          Abrir vitrine
        </Link>
        <StatusButtons storeId={store.id} active={store.account_status === 'active'} />
        <UnpaidButton storeId={store.id} />
        <BackupButton storeId={store.id} slug={store.slug} />
      </div>

      {access === 'grace' && (
        <p className="text-sm text-amber-200 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
          Em carência de 1 mês. A loja ainda pode voltar só pagando — os dados não são apagados.
        </p>
      )}
      {access === 'locked' && (
        <p className="text-sm text-rose-200 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">
          Bloqueada. O dono entra, vê a tela de assinatura e reativa quando pagar. Nada é excluído.
        </p>
      )}

      <div className="grid lg:grid-cols-2 gap-5">
        <form action={updatePlatformStore} className="rounded-2xl border border-white/10 p-5 space-y-3">
          <h2 className="text-sm font-semibold">Editar cadastro</h2>
          <input type="hidden" name="storeId" value={store.id} />
          <Field name="name" label="Nome" defaultValue={store.name} />
          <Field name="phone" label="Telefone" defaultValue={store.phone ?? ''} />
          <Field name="email" label="E-mail" defaultValue={store.email ?? ''} />
          <Field name="city" label="Cidade" defaultValue={store.city ?? ''} />
          <Field name="monthly_price" label="Mensalidade (R$)" defaultValue={String(store.monthly_price)} />
          <label className="block text-xs text-slate-400">Notas internas
            <textarea
              name="notes"
              defaultValue={store.notes ?? ''}
              rows={3}
              className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white"
            />
          </label>
          <Button type="submit" variant="primary">Salvar</Button>
        </form>

        <form action={recordStorePayment} className="rounded-2xl border border-white/10 p-5 space-y-3">
          <h2 className="text-sm font-semibold">Registrar pagamento</h2>
          <input type="hidden" name="storeId" value={store.id} />
          <Field name="amount" label="Valor" defaultValue={String(store.monthly_price)} />
          <label className="block text-xs text-slate-400">Método
            <select name="method" className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm">
              <option value="pix">Pix</option>
              <option value="transfer">Transferência</option>
              <option value="cash">Dinheiro</option>
              <option value="complimentary">Cortesia</option>
            </select>
          </label>
          <Field name="months" label="Meses pagos" defaultValue="1" />
          <Field name="notes" label="Observação" defaultValue="" />
          <Button type="submit" variant="primary">Lançar pagamento</Button>
          <p className="text-[11px] text-slate-500">
            Isso libera a loja, marca como paga e abre 1 mês extra de carência depois do período.
          </p>
        </form>
      </div>

      <section className="rounded-2xl border border-white/10 overflow-hidden">
        <div className="px-5 py-3 border-b border-white/10">
          <h2 className="text-sm font-semibold">Histórico de mensalidades</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="text-[11px] uppercase tracking-wider text-slate-500">
            <tr>
              <th className="text-left font-medium px-5 py-2">Quando</th>
              <th className="text-left font-medium px-5 py-2">Valor</th>
              <th className="text-left font-medium px-5 py-2">Método</th>
              <th className="text-left font-medium px-5 py-2">Período</th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr><td colSpan={4} className="px-5 py-8 text-slate-500">Nenhum pagamento lançado.</td></tr>
            ) : payments.map((pay) => (
              <tr key={pay.id} className="border-t border-white/5">
                <td className="px-5 py-3">{formatDate(pay.paid_at)}</td>
                <td className="px-5 py-3">{formatCurrency(pay.amount)}</td>
                <td className="px-5 py-3 capitalize">{pay.method}</td>
                <td className="px-5 py-3 text-slate-500">
                  {pay.period_start && pay.period_end
                    ? `${formatDate(pay.period_start)} — ${formatDate(pay.period_end)}`
                    : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}

function Field({
  name,
  label,
  defaultValue,
}: {
  name: string
  label: string
  defaultValue: string
}) {
  return (
    <label className="block text-xs text-slate-400">
      {label}
      <input
        name={name}
        defaultValue={defaultValue}
        className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white"
      />
    </label>
  )
}
