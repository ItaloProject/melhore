'use client'

import { useState } from 'react'
import { DollarSign, TrendingUp, TrendingDown, Clock, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDateTime } from '@/lib/utils'

const mockSession = {
  status: 'open' as const,
  openedAt: '2026-09-01T08:00:00',
  openingBalance: 200,
  salesTotal: 1_450.70,
  returnsTotal: 89.90,
  withdrawals: 100,
}

const mockTransactions = [
  { id: '1', type: 'sale',       method: 'Pix',      amount: 229.90, note: 'Vestido Floral M',    time: '14:32' },
  { id: '2', type: 'sale',       method: 'Crédito',  amount: 189.90, note: 'Calça Jeans 40',      time: '13:55' },
  { id: '3', type: 'withdrawal', method: '—',        amount: 100.00, note: 'Troco retirado',       time: '12:30' },
  { id: '4', type: 'sale',       method: 'Débito',   amount: 159.80, note: 'Blusa Branca G x2',   time: '12:10' },
  { id: '5', type: 'return',     method: 'Pix',      amount: 89.90,  note: 'Devolução — defeito', time: '11:20' },
  { id: '6', type: 'sale',       method: 'Dinheiro', amount: 89.90,  note: 'Camisa Preta M',      time: '10:40' },
  { id: '7', type: 'sale',       method: 'Pix',      amount: 129.90, note: 'Bermuda Cargo 42',    time: '09:15' },
]

const typeConfig = {
  sale:       { label: 'Venda',    variant: 'success' as const, sign: '+' },
  return:     { label: 'Devolução',variant: 'danger'  as const, sign: '-' },
  withdrawal: { label: 'Retirada', variant: 'warning' as const, sign: '-' },
}

export default function CaixaPage() {
  const [closing, setClosing] = useState(false)
  const expectedBalance = mockSession.openingBalance + mockSession.salesTotal - mockSession.returnsTotal - mockSession.withdrawals

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Caixa</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="success">Aberto</Badge>
            <span className="text-sm text-gray-400">desde {formatDateTime(mockSession.openedAt)}</span>
          </div>
        </div>
        <Button variant="danger" onClick={() => setClosing(true)}>Fechar Caixa</Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
              <DollarSign className="w-4 h-4" /> Saldo inicial
            </div>
            <p className="text-2xl font-bold">{formatCurrency(mockSession.openingBalance)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 text-green-600 text-sm mb-1">
              <TrendingUp className="w-4 h-4" /> Vendas
            </div>
            <p className="text-2xl font-bold text-green-700">{formatCurrency(mockSession.salesTotal)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 text-red-500 text-sm mb-1">
              <TrendingDown className="w-4 h-4" /> Saídas
            </div>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(mockSession.returnsTotal + mockSession.withdrawals)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 text-gray-700 text-sm mb-1">
              <CheckCircle className="w-4 h-4" /> Saldo esperado
            </div>
            <p className="text-2xl font-bold">{formatCurrency(expectedBalance)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" /> Movimentações
            </CardTitle>
            <span className="text-sm text-gray-400">{mockTransactions.length} registros</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left py-2.5 px-5 text-xs font-medium text-gray-400 uppercase tracking-wide">Hora</th>
                <th className="text-left py-2.5 px-5 text-xs font-medium text-gray-400 uppercase tracking-wide">Tipo</th>
                <th className="text-left py-2.5 px-5 text-xs font-medium text-gray-400 uppercase tracking-wide">Descrição</th>
                <th className="text-center py-2.5 px-5 text-xs font-medium text-gray-400 uppercase tracking-wide">Forma</th>
                <th className="text-right py-2.5 px-5 text-xs font-medium text-gray-400 uppercase tracking-wide">Valor</th>
              </tr>
            </thead>
            <tbody>
              {mockTransactions.map((t) => {
                const cfg = typeConfig[t.type as keyof typeof typeConfig]
                return (
                  <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-5 text-gray-400">{t.time}</td>
                    <td className="py-3 px-5">
                      <Badge variant={cfg.variant}>{cfg.label}</Badge>
                    </td>
                    <td className="py-3 px-5 text-gray-700">{t.note}</td>
                    <td className="py-3 px-5 text-center text-gray-500">{t.method}</td>
                    <td className={`py-3 px-5 text-right font-semibold ${t.type === 'sale' ? 'text-green-700' : 'text-red-600'}`}>
                      {cfg.sign}{formatCurrency(t.amount)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Close modal */}
      {closing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Fechar Caixa</h2>
            <p className="text-sm text-gray-500 mb-4">Confirme o valor em dinheiro no caixa.</p>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Saldo esperado</span>
                <span className="font-semibold">{formatCurrency(expectedBalance)}</span>
              </div>
              <input
                type="number"
                placeholder="Valor contado (R$)"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div className="flex gap-3 mt-5">
              <Button variant="outline" className="flex-1" onClick={() => setClosing(false)}>Cancelar</Button>
              <Button variant="primary" className="flex-1">Confirmar Fechamento</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
