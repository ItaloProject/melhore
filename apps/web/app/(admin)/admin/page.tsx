import { TrendingUp, Package, ShoppingCart, AlertTriangle, ArrowUpRight, ArrowDownRight, Zap } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'

const stats = [
  {
    label: 'Vendas hoje',
    value: formatCurrency(4_280),
    delta: '+12% vs ontem',
    up: true,
    icon: TrendingUp,
    bg: 'bg-emerald-50',
    color: 'text-emerald-600',
    deltaColor: 'text-emerald-600',
  },
  {
    label: 'Pedidos online',
    value: '7 pendentes',
    delta: '3 novos hoje',
    up: true,
    icon: ShoppingCart,
    bg: 'bg-blue-50',
    color: 'text-blue-600',
    deltaColor: 'text-blue-600',
  },
  {
    label: 'Itens em estoque',
    value: '342 unidades',
    delta: '-18 hoje',
    up: false,
    icon: Package,
    bg: 'bg-violet-50',
    color: 'text-violet-600',
    deltaColor: 'text-slate-500',
  },
  {
    label: 'Estoque crítico',
    value: '5 SKUs',
    delta: 'Reposição urgente',
    up: false,
    icon: AlertTriangle,
    bg: 'bg-rose-50',
    color: 'text-rose-600',
    deltaColor: 'text-rose-600',
  },
]

const recentSales = [
  { id: '1', product: 'Camisa Preta M',   price: 89.90,   method: 'Pix',      time: '14:32', channel: 'Físico' },
  { id: '2', product: 'Calça Jeans 40',   price: 189.90,  method: 'Crédito',  time: '13:55', channel: 'Online' },
  { id: '3', product: 'Blusa Branca G',   price: 159.80,  method: 'Débito',   time: '12:10', channel: 'Físico' },
  { id: '4', product: 'Vestido Floral M', price: 229.90,  method: 'Pix',      time: '11:40', channel: 'Online' },
  { id: '5', product: 'Bermuda Bege 42',  price: 129.90,  method: 'Dinheiro', time: '10:15', channel: 'Físico' },
]

const lowStock = [
  { name: 'Camisa Branca P', qty: 1 },
  { name: 'Calça Preta 38',  qty: 2 },
  { name: 'Blusa Azul M',    qty: 1 },
  { name: 'Saia Rosa G',     qty: 2 },
  { name: 'Top Cropped P',   qty: 1 },
]

export default function DashboardPage() {
  return (
    <div className="p-7 space-y-6 min-h-full bg-slate-50">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Bom dia 👋</h1>
          <p className="text-sm text-gray-400 mt-0.5">Segunda-feira, 1 de setembro de 2026</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm text-emerald-700 font-medium">
          <Zap className="w-3.5 h-3.5" />
          Caixa aberto
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="border-0 shadow-sm">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{s.label}</p>
                  <p className="text-2xl font-bold text-gray-900 tracking-tight">{s.value}</p>
                  <div className={`flex items-center gap-1 text-xs font-medium ${s.deltaColor}`}>
                    {s.up
                      ? <ArrowUpRight className="w-3 h-3" />
                      : <ArrowDownRight className="w-3 h-3" />}
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

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Recent sales */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-sm overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Vendas Recentes</CardTitle>
                <Badge variant="default">Hoje</Badge>
              </div>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50/60">
                    <th className="text-left py-2.5 px-5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Produto</th>
                    <th className="text-right py-2.5 px-5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Valor</th>
                    <th className="text-center py-2.5 px-5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Canal</th>
                    <th className="text-right py-2.5 px-5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Hora</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSales.map((s) => (
                    <tr key={s.id} className="border-t border-gray-50 hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-5">
                        <p className="font-medium text-gray-900">{s.product}</p>
                        <p className="text-xs text-gray-400">{s.method}</p>
                      </td>
                      <td className="py-3.5 px-5 text-right font-semibold text-gray-900">
                        {formatCurrency(s.price)}
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        <Badge variant={s.channel === 'Online' ? 'info' : 'default'}>{s.channel}</Badge>
                      </td>
                      <td className="py-3.5 px-5 text-right text-gray-400 tabular-nums">{s.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Low stock */}
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
            {lowStock.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <p className="text-sm text-gray-700 font-medium">{item.name}</p>
                <Badge variant="danger">{item.qty} un.</Badge>
              </div>
            ))}
            <div className="pt-2 border-t border-gray-100">
              <button className="text-xs text-brand-600 hover:text-brand-500 font-medium transition-colors">
                Ver estoque completo →
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
