'use client'

import { useState } from 'react'
import { BarChart3, TrendingUp, ShoppingBag, Package } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'

type Period = '7d' | '30d' | '90d'

const periods: { id: Period; label: string }[] = [
  { id: '7d',  label: 'Últimos 7 dias' },
  { id: '30d', label: 'Últimos 30 dias' },
  { id: '90d', label: 'Últimos 90 dias' },
]

const summaryByPeriod: Record<Period, { revenue: number; sales: number; avgTicket: number; units: number }> = {
  '7d':  { revenue: 12_430, sales: 87,  avgTicket: 142.87, units: 134 },
  '30d': { revenue: 48_920, sales: 312, avgTicket: 156.79, units: 498 },
  '90d': { revenue: 142_100,sales: 890, avgTicket: 159.66, units: 1_420 },
}

const topProducts = [
  { name: 'Camisa Preta Básica M', sold: 38, revenue: 3_416.20, channel: 'Físico' },
  { name: 'Calça Jeans Skinny 40', sold: 24, revenue: 4_557.60, channel: 'Online' },
  { name: 'Vestido Floral M',       sold: 21, revenue: 4_827.90, channel: 'Online' },
  { name: 'Blusa de Frio G',        sold: 18, revenue: 2_338.20, channel: 'Físico' },
  { name: 'Bermuda Cargo 42',       sold: 16, revenue: 1_918.40, channel: 'Físico' },
]

const paymentBreakdown = [
  { method: 'Pix',     amount: 18_340, pct: 38 },
  { method: 'Crédito', amount: 14_280, pct: 29 },
  { method: 'Débito',  amount: 9_750,  pct: 20 },
  { method: 'Dinheiro',amount: 6_550,  pct: 13 },
]

export default function RelatoriosPage() {
  const [period, setPeriod] = useState<Period>('30d')
  const summary = summaryByPeriod[period]

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {periods.map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                period === p.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Faturamento',  value: formatCurrency(summary.revenue), icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Nº de Vendas', value: summary.sales.toString(),         icon: ShoppingBag,color: 'text-blue-600',  bg: 'bg-blue-50'  },
          { label: 'Ticket Médio', value: formatCurrency(summary.avgTicket),icon: BarChart3,  color: 'text-purple-600',bg: 'bg-purple-50'},
          { label: 'Peças Vendidas',value: summary.units.toString(),         icon: Package,   color: 'text-orange-600',bg: 'bg-orange-50'},
        ].map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="pt-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">{kpi.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{kpi.value}</p>
                </div>
                <div className={`w-10 h-10 rounded-lg ${kpi.bg} ${kpi.color} flex items-center justify-center`}>
                  <kpi.icon className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Top products */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Produtos Mais Vendidos</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left py-2.5 px-5 text-xs font-medium text-gray-400 uppercase tracking-wide">Produto</th>
                    <th className="text-center py-2.5 px-5 text-xs font-medium text-gray-400 uppercase tracking-wide">Canal</th>
                    <th className="text-center py-2.5 px-5 text-xs font-medium text-gray-400 uppercase tracking-wide">Peças</th>
                    <th className="text-right py-2.5 px-5 text-xs font-medium text-gray-400 uppercase tracking-wide">Faturamento</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((p, i) => (
                    <tr key={p.name} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-5">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-500 text-xs font-bold flex items-center justify-center">
                            {i + 1}
                          </span>
                          <span className="font-medium text-gray-900">{p.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-5 text-center">
                        <Badge variant={p.channel === 'Online' ? 'info' : 'default'}>{p.channel}</Badge>
                      </td>
                      <td className="py-3 px-5 text-center font-semibold">{p.sold}</td>
                      <td className="py-3 px-5 text-right font-semibold text-green-700">{formatCurrency(p.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

        {/* Payment breakdown */}
        <Card>
          <CardHeader><CardTitle>Por Forma de Pagamento</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {paymentBreakdown.map((p) => (
              <div key={p.method}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700 font-medium">{p.method}</span>
                  <span className="text-gray-900 font-semibold">{formatCurrency(p.amount)}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-500 rounded-full transition-all"
                    style={{ width: `${p.pct}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-0.5 text-right">{p.pct}%</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button variant="outline">Exportar CSV</Button>
      </div>
    </div>
  )
}
