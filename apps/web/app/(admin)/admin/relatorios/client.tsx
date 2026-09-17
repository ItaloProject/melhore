'use client'

import { useMemo, useState } from 'react'
import { BarChart3, TrendingUp, ShoppingBag, Package } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'

type Period = '7d' | '30d' | '90d'

const periods: { id: Period; label: string; days: number }[] = [
  { id: '7d', label: 'Últimos 7 dias', days: 7 },
  { id: '30d', label: 'Últimos 30 dias', days: 30 },
  { id: '90d', label: 'Últimos 90 dias', days: 90 },
]

const methodLabel: Record<string, string> = {
  cash: 'Dinheiro', credit: 'Crédito', debit: 'Débito', pix: 'Pix', other: 'Outro',
}

interface SaleItem {
  productName: string
  quantity: number
  total: number
}

interface Sale {
  id: string
  total: number
  paymentMethod: string
  createdAt: string
  items: SaleItem[]
}

export function RelatoriosClient({ sales }: { sales: Sale[] }) {
  const [period, setPeriod] = useState<Period>('30d')

  const filtered = useMemo(() => {
    const days = periods.find((p) => p.id === period)!.days
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000
    return sales.filter((s) => new Date(s.createdAt).getTime() >= cutoff)
  }, [sales, period])

  const revenue = filtered.reduce((s, r) => s + r.total, 0)
  const salesCount = filtered.length
  const avgTicket = salesCount > 0 ? revenue / salesCount : 0
  const units = filtered.reduce((s, r) => s + r.items.reduce((a, i) => a + i.quantity, 0), 0)

  const topProducts = useMemo(() => {
    const map = new Map<string, { sold: number; revenue: number }>()
    filtered.forEach((s) =>
      s.items.forEach((i) => {
        const cur = map.get(i.productName) ?? { sold: 0, revenue: 0 }
        map.set(i.productName, { sold: cur.sold + i.quantity, revenue: cur.revenue + i.total })
      })
    )
    return Array.from(map.entries())
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
  }, [filtered])

  const paymentBreakdown = useMemo(() => {
    const map = new Map<string, number>()
    filtered.forEach((s) => map.set(s.paymentMethod, (map.get(s.paymentMethod) ?? 0) + s.total))
    const total = Array.from(map.values()).reduce((a, b) => a + b, 0)
    return Array.from(map.entries())
      .map(([method, amount]) => ({ method, amount, pct: total > 0 ? Math.round((amount / total) * 100) : 0 }))
      .sort((a, b) => b.amount - a.amount)
  }, [filtered])

  const exportCsv = () => {
    const header = 'data,total,forma_pagamento\n'
    const rows = filtered
      .map((s) => `${new Date(s.createdAt).toLocaleString('pt-BR')},${s.total.toFixed(2)},${methodLabel[s.paymentMethod] ?? s.paymentMethod}`)
      .join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `relatorio-vendas-${period}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
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

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Faturamento', value: formatCurrency(revenue), icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Nº de Vendas', value: salesCount.toString(), icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Ticket Médio', value: formatCurrency(avgTicket), icon: BarChart3, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Peças Vendidas', value: units.toString(), icon: Package, color: 'text-orange-600', bg: 'bg-orange-50' },
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
        <div className="lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>Produtos Mais Vendidos</CardTitle></CardHeader>
            <CardContent className="p-0">
              {topProducts.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">Nenhuma venda no período.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left py-2.5 px-5 text-xs font-medium text-gray-400 uppercase tracking-wide">Produto</th>
                      <th className="text-center py-2.5 px-5 text-xs font-medium text-gray-400 uppercase tracking-wide">Peças</th>
                      <th className="text-right py-2.5 px-5 text-xs font-medium text-gray-400 uppercase tracking-wide">Faturamento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts.map((p, i) => (
                      <tr key={p.name} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-3 px-5">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-500 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                            <span className="font-medium text-gray-900">{p.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-5 text-center font-semibold">{p.sold}</td>
                        <td className="py-3 px-5 text-right font-semibold text-green-700">{formatCurrency(p.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Por Forma de Pagamento</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {paymentBreakdown.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">Sem dados no período.</p>
            ) : (
              paymentBreakdown.map((p) => (
                <div key={p.method}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 font-medium">{methodLabel[p.method] ?? p.method}</span>
                    <span className="text-gray-900 font-semibold">{formatCurrency(p.amount)}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-500 rounded-full transition-all" style={{ width: `${p.pct}%` }} />
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5 text-right">{p.pct}%</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button variant="outline" onClick={exportCsv} disabled={filtered.length === 0}>Exportar CSV</Button>
      </div>
    </>
  )
}
