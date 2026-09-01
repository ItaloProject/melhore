'use client'

import { useState, useCallback } from 'react'
import { Search, Trash2, CreditCard, Banknote, Smartphone, QrCode, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { makeSale } from '@/lib/actions/sales'
import type { PaymentMethod } from '@melhore/types'

interface SearchResult {
  variantId: string
  name: string
  variant: string
  price: number
  stock: number
}

interface CartLine {
  id: string
  name: string
  variant: string
  price: number
  qty: number
}

const paymentMethods: { id: PaymentMethod; label: string; icon: React.ElementType }[] = [
  { id: 'cash',   label: 'Dinheiro', icon: Banknote },
  { id: 'pix',    label: 'Pix',      icon: QrCode },
  { id: 'debit',  label: 'Débito',   icon: CreditCard },
  { id: 'credit', label: 'Crédito',  icon: Smartphone },
]

export function VendasClient({ storeId, sessionId }: { storeId: string; sessionId: string | null }) {
  const [search, setSearch]   = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [cart, setCart]   = useState<CartLine[]>([])
  const [payment, setPayment] = useState<PaymentMethod>('pix')
  const [discount, setDiscount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0)
  const total    = Math.max(0, subtotal - discount)

  const searchProducts = useCallback(async (q: string) => {
    setSearch(q)
    if (q.length < 2) { setResults([]); return }
    setSearching(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('product_variants')
      .select(`
        id, size, color, price_override,
        products!inner(name, price, store_id, active),
        inventory(quantity, reserved)
      `)
      .eq('products.store_id', storeId)
      .eq('products.active', true)
      .or(`products.name.ilike.%${q}%,size.ilike.%${q}%,color.ilike.%${q}%`)
      .limit(8)

    setResults(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (data ?? []).map((v: any) => {
        const inv = v.inventory?.[0]
        const stock = (inv?.quantity ?? 0) - (inv?.reserved ?? 0)
        const prod = Array.isArray(v.products) ? v.products[0] : v.products
        const price = v.price_override ?? prod?.price ?? 0
        const variantLabel = [v.size, v.color].filter(Boolean).join(' / ')
        return { variantId: v.id, name: prod?.name ?? '—', variant: variantLabel, price: Number(price), stock }
      })
    )
    setSearching(false)
  }, [storeId])

  const addToCart = (item: SearchResult) => {
    setCart((prev) => {
      const ex = prev.find((c) => c.id === item.variantId)
      if (ex) return prev.map((c) => c.id === item.variantId ? { ...c, qty: c.qty + 1 } : c)
      return [...prev, { id: item.variantId, name: item.name, variant: item.variant, price: item.price, qty: 1 }]
    })
    setSearch('')
    setResults([])
  }

  const removeFromCart = (id: string) => setCart((prev) => prev.filter((c) => c.id !== id))

  const finalize = async () => {
    if (!sessionId) { setErrorMsg('Abra o caixa antes de registrar uma venda.'); return }
    if (cart.length === 0) return
    setLoading(true)
    setErrorMsg('')

    const result = await makeSale(
      sessionId,
      payment,
      discount,
      cart.map((c) => ({
        variant_id:    c.id,
        qty:           c.qty,
        unit_price:    c.price,
        product_name:  c.name,
        variant_label: c.variant,
      }))
    )

    setLoading(false)
    if ('error' in result) {
      setErrorMsg(result.error)
    } else {
      setSuccess(true)
      setCart([])
      setDiscount(0)
      setTimeout(() => setSuccess(false), 3000)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
      {/* Left — product search */}
      <div className="lg:col-span-3 space-y-4">
        <Card>
          <CardHeader><CardTitle>Buscar Produto</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="relative">
              <Input
                placeholder="Nome, tamanho ou cor..."
                value={search}
                onChange={(e) => searchProducts(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
                disabled={!sessionId}
              />
              {results.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                  {results.map((r) => (
                    <button
                      key={r.variantId}
                      onClick={() => addToCart(r)}
                      disabled={r.stock <= 0}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 disabled:opacity-40"
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

            {cart.length === 0 ? (
              <div className="py-10 text-center text-gray-400 text-sm">
                {sessionId ? 'Adicione produtos para iniciar a venda' : 'Abra o caixa para registrar vendas'}
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

            {errorMsg && (
              <p className="text-sm text-red-600 text-center">{errorMsg}</p>
            )}

            {success && (
              <div className="flex items-center justify-center gap-2 text-emerald-600 font-semibold text-sm">
                <CheckCircle className="w-4 h-4" /> Venda registrada com sucesso!
              </div>
            )}

            <Button
              variant="primary"
              size="lg"
              className="w-full"
              disabled={cart.length === 0 || !sessionId || loading}
              onClick={finalize}
              loading={loading}
            >
              Finalizar Venda
            </Button>

            <Button variant="outline" size="md" className="w-full" onClick={() => { setCart([]); setDiscount(0); setErrorMsg('') }}>
              Cancelar
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
