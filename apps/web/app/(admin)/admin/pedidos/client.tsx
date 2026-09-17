'use client'

import { useMemo, useState } from 'react'
import { Phone, Mail, CheckCircle, XCircle, PackageCheck } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { updateOrderStatus, type OrderStatus } from '@/lib/actions/orders'

interface OrderItem {
  productName: string
  variantLabel: string
  quantity: number
  unitPrice: number
  total: number
}

interface Order {
  id: string
  customerName: string
  customerEmail: string | null
  customerPhone: string | null
  status: OrderStatus
  type: string
  total: number
  notes: string | null
  createdAt: string
  items: OrderItem[]
}

const statusConfig: Record<OrderStatus, { label: string; variant: 'default' | 'success' | 'warning' | 'danger' | 'info' }> = {
  pending: { label: 'Pendente', variant: 'warning' },
  confirmed: { label: 'Confirmado', variant: 'info' },
  reserved: { label: 'Reservado', variant: 'info' },
  shipped: { label: 'Enviado', variant: 'info' },
  delivered: { label: 'Entregue', variant: 'success' },
  cancelled: { label: 'Cancelado', variant: 'danger' },
}

const tabs: { id: 'pending' | 'active' | 'all'; label: string }[] = [
  { id: 'pending', label: 'Pendentes' },
  { id: 'active', label: 'Em andamento' },
  { id: 'all', label: 'Todos' },
]

export function PedidosClient({ orders: initial }: { orders: Order[] }) {
  const [orders, setOrders] = useState(initial)
  const [tab, setTab] = useState<'pending' | 'active' | 'all'>('pending')
  const [busy, setBusy] = useState<string | null>(null)

  const filtered = useMemo(() => {
    if (tab === 'pending') return orders.filter((o) => o.status === 'pending')
    if (tab === 'active') return orders.filter((o) => !['delivered', 'cancelled'].includes(o.status))
    return orders
  }, [orders, tab])

  const setStatus = async (orderId: string, status: OrderStatus) => {
    setBusy(orderId)
    const result = await updateOrderStatus(orderId, status)
    setBusy(null)
    if (!result.error) {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)))
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              tab === t.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-sm text-gray-400">Nenhum pedido aqui.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((o) => {
            const cfg = statusConfig[o.status]
            return (
              <Card key={o.id}>
                <CardContent className="pt-5">
                  <div className="flex items-start justify-between flex-wrap gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">{o.customerName}</span>
                        <Badge variant={cfg.variant}>{cfg.label}</Badge>
                        {o.type === 'reservation' && <Badge variant="default">Reserva</Badge>}
                      </div>
                      <div className="flex items-center gap-4 mt-1.5 text-xs text-gray-500">
                        {o.customerPhone && (
                          <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {o.customerPhone}</span>
                        )}
                        {o.customerEmail && (
                          <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {o.customerEmail}</span>
                        )}
                        <span>{formatDateTime(o.createdAt)}</span>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-gray-900">{formatCurrency(o.total)}</span>
                  </div>

                  <div className="mt-3 border-t border-gray-100 pt-3 space-y-1">
                    {o.items.map((it, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          {it.quantity}x {it.productName} <span className="text-gray-400">({it.variantLabel})</span>
                        </span>
                        <span className="text-gray-700 font-medium">{formatCurrency(it.total)}</span>
                      </div>
                    ))}
                  </div>

                  {o.notes && <p className="text-xs text-gray-400 mt-2 italic">&ldquo;{o.notes}&rdquo;</p>}

                  {!['delivered', 'cancelled'].includes(o.status) && (
                    <div className="flex gap-2 mt-4">
                      {o.status === 'pending' && (
                        <Button size="sm" variant="primary" loading={busy === o.id} onClick={() => setStatus(o.id, 'confirmed')}>
                          <CheckCircle className="w-3.5 h-3.5" /> Confirmar
                        </Button>
                      )}
                      {o.status === 'confirmed' && (
                        <Button size="sm" variant="primary" loading={busy === o.id} onClick={() => setStatus(o.id, 'delivered')}>
                          <PackageCheck className="w-3.5 h-3.5" /> Marcar como entregue
                        </Button>
                      )}
                      <Button size="sm" variant="outline" loading={busy === o.id} onClick={() => setStatus(o.id, 'cancelled')}>
                        <XCircle className="w-3.5 h-3.5" /> Cancelar
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
