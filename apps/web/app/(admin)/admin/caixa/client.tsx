'use client'

import { useState } from 'react'
import { DollarSign, TrendingUp, CheckCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { openCashSession, closeCashSession } from '@/lib/actions/cash'

const methodLabel: Record<string, string> = {
  cash: 'Dinheiro', credit: 'Crédito', debit: 'Débito', pix: 'Pix', other: 'Outro',
}

interface Sale {
  id: string
  total: number
  paymentMethod: string
  createdAt: string
  label: string
}

interface Session {
  id: string
  opening_balance: number
  opened_at: string
}

export function CaixaClient({ session, sales }: { session: Session | null; sales: Sale[] }) {
  const [opening, setOpening] = useState('')
  const [closing, setClosing] = useState(false)
  const [closingValue, setClosingValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const salesTotal = sales.reduce((s, r) => s + r.total, 0)
  const expected = session ? Number(session.opening_balance) + salesTotal : 0

  const handleOpen = async () => {
    setError('')
    const value = Number(opening.replace(',', '.')) || 0
    setLoading(true)
    const result = await openCashSession(value)
    setLoading(false)
    if (result.error) setError(result.error)
    else setOpening('')
  }

  const handleClose = async () => {
    if (!session) return
    const value = Number(closingValue.replace(',', '.'))
    if (isNaN(value)) {
      setError('Informe o valor contado no caixa.')
      return
    }
    setError('')
    setLoading(true)
    const result = await closeCashSession(session.id, value)
    setLoading(false)
    if (result.error) setError(result.error)
  }

  if (!session) {
    return (
      <Card>
        <CardContent className="pt-6 max-w-sm">
          <p className="text-sm text-gray-500 mb-3">Nenhum caixa aberto no momento.</p>
          <label className="block text-sm font-medium text-gray-700 mb-1">Saldo inicial (R$)</label>
          <input
            type="text"
            inputMode="decimal"
            value={opening}
            onChange={(e) => setOpening(e.target.value)}
            placeholder="0,00"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 mb-3"
          />
          {error && <p className="text-sm text-red-500 mb-3">{error}</p>}
          <Button variant="primary" onClick={handleOpen} loading={loading}>Abrir Caixa</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="success">Aberto</Badge>
          <span className="text-sm text-gray-400">desde {formatDateTime(session.opened_at)}</span>
        </div>
        <Button variant="danger" onClick={() => setClosing(true)}>Fechar Caixa</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
              <DollarSign className="w-4 h-4" /> Saldo inicial
            </div>
            <p className="text-2xl font-bold">{formatCurrency(Number(session.opening_balance))}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 text-green-600 text-sm mb-1">
              <TrendingUp className="w-4 h-4" /> Vendas na sessão
            </div>
            <p className="text-2xl font-bold text-green-700">{formatCurrency(salesTotal)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 text-gray-700 text-sm mb-1">
              <CheckCircle className="w-4 h-4" /> Saldo esperado
            </div>
            <p className="text-2xl font-bold">{formatCurrency(expected)}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" /> Vendas da sessão
            </CardTitle>
            <span className="text-sm text-gray-400">{sales.length} registro{sales.length !== 1 ? 's' : ''}</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {sales.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">Nenhuma venda registrada nesta sessão.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left py-2.5 px-5 text-xs font-medium text-gray-400 uppercase tracking-wide">Hora</th>
                  <th className="text-left py-2.5 px-5 text-xs font-medium text-gray-400 uppercase tracking-wide">Descrição</th>
                  <th className="text-center py-2.5 px-5 text-xs font-medium text-gray-400 uppercase tracking-wide">Forma</th>
                  <th className="text-right py-2.5 px-5 text-xs font-medium text-gray-400 uppercase tracking-wide">Valor</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((s) => (
                  <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-5 text-gray-400">
                      {new Date(s.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-5 text-gray-700">{s.label}</td>
                    <td className="py-3 px-5 text-center text-gray-500">{methodLabel[s.paymentMethod] ?? s.paymentMethod}</td>
                    <td className="py-3 px-5 text-right font-semibold text-green-700">+{formatCurrency(s.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {closing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Fechar Caixa</h2>
            <p className="text-sm text-gray-500 mb-4">Confirme o valor em dinheiro no caixa.</p>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Saldo esperado</span>
                <span className="font-semibold">{formatCurrency(expected)}</span>
              </div>
              <input
                type="text"
                inputMode="decimal"
                value={closingValue}
                onChange={(e) => setClosingValue(e.target.value)}
                placeholder="Valor contado (R$)"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
            <div className="flex gap-3 mt-5">
              <Button variant="outline" className="flex-1" onClick={() => setClosing(false)}>Cancelar</Button>
              <Button variant="primary" className="flex-1" onClick={handleClose} loading={loading}>Confirmar Fechamento</Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
