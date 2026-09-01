'use client'

import { useState } from 'react'
import { Plus, Search, Trash2, CreditCard, Banknote, Smartphone, QrCode } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import type { PaymentMethod } from '@melhore/types'

interface CartLine {
  id: string
  name: string
  variant: string
  price: number
  qty: number
}

const mockSearchResults = [
  { variantId: 'v1', name: 'Camisa Preta Básica', variant: 'M / Preta', price: 89.90, stock: 8 },
  { variantId: 'v2', name: 'Camisa Preta Básica', variant: 'G / Preta', price: 89.90, stock: 5 },
  { variantId: 'v3', name: 'Calça Jeans Skinny',  variant: '40 / Azul', price: 189.90, stock: 6 },
]

const paymentMethods: { id: PaymentMethod; label: string; icon: React.ElementType }[] = [
  { id: 'cash',   label: 'Dinheiro', icon: Banknote },
  { id: 'pix',    label: 'Pix',      icon: QrCode },
  { id: 'debit',  label: 'Débito',   icon: CreditCard },
  { id: 'credit', label: 'Crédito',  icon: Smartphone },
]

export default function VendasPage() {
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState<CartLine[]>([])
  const [payment, setPayment] = useState<PaymentMethod>('pix')
  const [discount, setDiscount] = useState(0)

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0)
  const total = Math.max(0, subtotal - discount)

  const addToCart = (item: typeof mockSearchResults[0]) => {
    setCart((prev) => {
      const ex = prev.find((c) => c.id === item.variantId)
      if (ex) return prev.map((c) => c.id === item.variantId ? { ...c, qty: c.qty + 1 } : c)
      return [...prev, { id: item.variantId, name: item.name, variant: item.variant, price: item.price, qty: 1 }]
    })
    setSearch('')
  }

  const removeFromCart = (id: string) => setCart((prev) => prev.filter((c) => c.id !== id))

  const results = search.length > 1
    ? mockSearchResults.filter((r) =>
        `${r.name} ${r.variant}`.toLowerCase().includes(search.toLowerCase())
      )
    : []

  return (
    <div className="p-6 space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">PDV — Venda Balcão</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Left — product search */}
        <div className="lg:col-span-3 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Buscar Produto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="relative">
                <Input
                  placeholder="Nome, SKU ou variação..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  leftIcon={<Search className="w-4 h-4" />}
                />
                {results.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                    {results.map((r) => (
                      <button
                        key={r.variantId}
                        onClick={() => addToCart(r)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{r.name}</p>
                            <p className="text-xs text-gray-400">{r.variant} • {r.stock} em estoque</p>
                          </div>
                          <p className="text-sm font-bold text-gray-900">{formatCurrency(r.price)}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Cart items */}
              {cart.length === 0 ? (
                <div className="py-10 text-center text-gray-400 text-sm">
                  Adicione produtos para iniciar a venda
                </div>
              ) : (
                <div className="space-y-2">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                        <p className="text-xs text-gray-400">{item.variant}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setCart(c => c.map(i => i.id === item.id && i.qty > 1 ? { ...i, qty: i.qty - 1 } : i))}
                          className="w-6 h-6 rounded-md bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 flex items-center justify-center text-sm font-bold"
                        >−</button>
                        <span className="w-5 text-center text-sm font-semibold">{item.qty}</span>
                        <button
                          onClick={() => setCart(c => c.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i))}
                          className="w-6 h-6 rounded-md bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 flex items-center justify-center text-sm font-bold"
                        >+</button>
                      </div>
                      <p className="text-sm font-bold w-20 text-right">{formatCurrency(item.price * item.qty)}</p>
                      <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)} className="text-red-400 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right — payment */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader><CardTitle>Pagamento</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {/* Payment method */}
              <div className="grid grid-cols-2 gap-2">
                {paymentMethods.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setPayment(m.id)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                      payment === m.id
                        ? 'border-brand-500 bg-brand-50 text-brand-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <m.icon className="w-5 h-5" />
                    {m.label}
                  </button>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-2 border-t border-gray-100 pt-4">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 items-center">
                  <span>Desconto</span>
                  <input
                    type="number"
                    min={0}
                    max={subtotal}
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    className="w-24 text-right border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div className="flex justify-between font-bold text-lg text-gray-900 border-t border-gray-200 pt-2">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                className="w-full"
                disabled={cart.length === 0}
              >
                Finalizar Venda
              </Button>

              <Button variant="outline" size="md" className="w-full" onClick={() => setCart([])}>
                Cancelar
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
