import { TrendingUp, Package, ShoppingCart, AlertTriangle, ArrowUpRight, ArrowDownRight, Zap } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { createClient } from '@/lib/supabase/server'
import { requireStore } from '@/lib/queries/store'

async function getDashboardData(storeId: string) {
  const supabase = createClient()
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)

  const [salesRes, salesYesterdayRes, ordersRes, inventoryRes, lowStockRes, recentSalesRes, sessionRes] =
    await Promise.all([
      supabase
        .from('sales')
        .select('total')
        .eq('store_id', storeId)
        .gte('created_at', todayStart.toISOString()),

      supabase
        .from('sales')
        .select('total')
        .eq('store_id', storeId)
        .gte('created_at', new Date(todayStart.getTime() - 86400000).toISOString())
        .lt('created_at', todayStart.toISOString()),

      supabase
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .eq('store_id', storeId)
        .eq('status', 'pending'),

      supabase
        .from('inventory')
        .select('quantity, reserved')
        .eq('store_id', storeId),

      supabase
        .from('inventory')
        .select('quantity, reserved, min_quantity, product_variants(products(name), size, color)')
        .eq('store_id', storeId)
        .filter('quantity', 'lte', 'min_quantity'),

      supabase
        .from('sales')
        .select('id, total, payment_method, created_at, sale_items(product_name, quantity, unit_price)')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false })
        .limit(5),

      supabase
        .from('cash_sessions')
        .select('id, status')
        .eq('store_id', storeId)
        .eq('status', 'open')
        .limit(1)
        .maybeSingle(),
    ])

  const todaySales    = (salesRes.data ?? []).reduce((s, r) => s + Number(r.total), 0)
  const yesterdaySales = (salesYesterdayRes.data ?? []).reduce((s, r) => s + Number(r.total), 0)
  const deltaVendas   = yesterdaySales > 0 ? ((todaySales - yesterdaySales) / yesterdaySales) * 100 : 0

  const totalStock  = (inventoryRes.data ?? []).reduce((s, i) => s + i.quantity, 0)
  const pendingOrders = ordersRes.count ?? 0

  // Critical stock: available <= min_quantity
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const criticalItems = (lowStockRes.data ?? []).filter((i: any) =>
    (i.quantity - i.reserved) <= i.min_quantity
  )

  return {
    todaySales,
    deltaVendas,
    pendingOrders,
    totalStock,
    criticalCount: criticalItems.length,
    criticalItems: criticalItems.slice(0, 5),
    recentSales: recentSalesRes.data ?? [],
    caixaAberto: !!sessionRes.data,
  }
}

function methodLabel(m: string) {
  const map: Record<string, string> = { cash: 'Dinheiro', pix: 'Pix', debit: 'Débito', credit: 'Crédito', other: 'Outro' }
  return map[m] ?? m
}

function saleTime(iso: string) {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

export default async function DashboardPage() {
  const { storeId } = await requireStore()
  const d = await getDashboardData(storeId)

  const now = new Date()
  const hora = now.getHours()
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite'
  const dataFormatada = now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  const stats = [
    {
      label: 'Vendas hoje',
      value: formatCurrency(d.todaySales),
      delta: d.deltaVendas >= 0 ? `+${d.deltaVendas.toFixed(0)}% vs ontem` : `${d.deltaVendas.toFixed(0)}% vs ontem`,
      up: d.deltaVendas >= 0,
      icon: TrendingUp,
      bg: 'bg-emerald-50', color: 'text-emerald-600', deltaColor: d.deltaVendas >= 0 ? 'text-emerald-600' : 'text-rose-600',
    },
    {
      label: 'Pedidos online',
      value: `${d.pendingOrders} pendentes`,
      delta: 'Aguardando confirmação',
      up: d.pendingOrders === 0,
      icon: ShoppingCart,
      bg: 'bg-blue-50', color: 'text-blue-600', deltaColor: 'text-slate-500',
    },
    {
      label: 'Itens em estoque',
      value: `${d.totalStock} unidades`,
      delta: 'Total no inventário',
      up: true,
      icon: Package,
      bg: 'bg-violet-50', color: 'text-violet-600', deltaColor: 'text-slate-500',
    },
    {
      label: 'Estoque crítico',
      value: `${d.criticalCount} SKUs`,
      delta: d.criticalCount > 0 ? 'Reposição urgente' : 'Tudo ok',
      up: d.criticalCount === 0,
      icon: AlertTriangle,
      bg: 'bg-rose-50', color: 'text-rose-600', deltaColor: d.criticalCount > 0 ? 'text-rose-600' : 'text-emerald-600',
    },
  ]

  return (
    <div className="p-7 space-y-6 min-h-full bg-slate-50">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{saudacao} 👋</h1>
          <p className="text-sm text-gray-400 mt-0.5 capitalize">{dataFormatada}</p>
        </div>
        <div className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-sm font-medium ${
          d.caixaAberto
            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
            : 'border-gray-200 bg-gray-50 text-gray-500'
        }`}>
          <Zap className="w-3.5 h-3.5" />
          {d.caixaAberto ? 'Caixa aberto' : 'Caixa fechado'}
        </div>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="border-0 shadow-sm">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{s.label}</p>
                  <p className="text-2xl font-bold text-gray-900 tracking-tight">{s.value}</p>
                  <div className={`flex items-center gap-1 text-xs font-medium ${s.deltaColor}`}>
                    {s.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {s.delta}
                  </div>
                </div>
                <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center`}>
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-sm overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Vendas Recentes</CardTitle>
                <Badge variant="default">Hoje</Badge>
              </div>
            </CardHeader>
            {d.recentSales.length === 0 ? (
              <div className="py-12 text-center text-sm text-gray-400">Nenhuma venda registrada ainda</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50/60">
                      {['Produto', 'Valor', 'Pagamento', 'Hora'].map((h, i) => (
                        <th key={h} className={`py-2.5 px-5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider ${i === 0 ? 'text-left' : i === 1 ? 'text-right' : 'text-center'}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {d.recentSales.map((s: any) => (
                      <tr key={s.id} className="border-t border-gray-50 hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-5">
                          <p className="font-medium text-gray-900">{s.sale_items?.[0]?.product_name ?? '—'}</p>
                          {s.sale_items?.length > 1 && (
                            <p className="text-xs text-gray-400">+{s.sale_items.length - 1} item(s)</p>
                          )}
                        </td>
                        <td className="py-3.5 px-5 text-right font-semibold text-gray-900">{formatCurrency(Number(s.total))}</td>
                        <td className="py-3.5 px-5 text-center">
                          <Badge variant="default">{methodLabel(s.payment_method)}</Badge>
                        </td>
                        <td className="py-3.5 px-5 text-center text-gray-400 tabular-nums">{saleTime(s.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-rose-100 flex items-center justify-center">
                <AlertTriangle className="w-3 h-3 text-rose-600" />
              </div>
              <CardTitle>Estoque Crítico</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3.5">
            {d.criticalItems.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">Nenhum item crítico</p>
            ) : (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              d.criticalItems.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between">
                  <p className="text-sm text-gray-700 font-medium">
                    {(item.product_variants?.products?.name ?? item.product_variants?.products?.[0]?.name) ?? '—'}
                    {item.product_variants?.size ? ` ${item.product_variants.size}` : ''}
                  </p>
                  <Badge variant="danger">{item.quantity - item.reserved} un.</Badge>
                </div>
              ))
            )}
            <div className="pt-2 border-t border-gray-100">
              <a href="/admin/estoque" className="text-xs text-brand-600 hover:text-brand-500 font-medium transition-colors">
                Ver estoque completo →
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
