'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Trash2, MessageCircle, CheckCircle2, ImageOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { useCartStore } from '@/lib/stores/cart'
import { placeOrder } from '@/lib/actions/orders'

export function CartClient({
  storeSlug,
  whatsapp,
}: {
  storeSlug: string
  whatsapp: string | null
}) {
  const { items, updateQty, removeItem, clear } = useCartStore()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const [form, setForm] = useState({ name: '', phone: '', notes: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [confirmed, setConfirmed] = useState<{ id: string; waHref: string } | null>(null)

  if (!mounted) return null

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0)
  const totalQty = items.reduce((s, i) => s + i.qty, 0)

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.name.trim() || !form.phone.trim()) {
      setError('Preencha nome e telefone.')
      return
    }
    setSubmitting(true)

    const result = await placeOrder({
      storeSlug,
      customerName: form.name,
      customerPhone: form.phone,
      notes: form.notes || undefined,
      items: items.map((i) => ({
        variantId: i.variantId,
        productName: i.productName,
        variantLabel: i.variantLabel,
        quantity: i.qty,
        unitPrice: i.price,
      })),
    })

    setSubmitting(false)

    if (result.error) {
      setError(result.error)
      return
    }

    const summary = items.map((i) => `• ${i.productName} (${i.variantLabel}) x${i.qty}`).join('\n')
    const waText = encodeURIComponent(
      `Olá! Acabei de reservar um pedido (#${result.orderId?.slice(0, 8)}):\n${summary}\nTotal: ${formatCurrency(subtotal)}`
    )
    const waHref = whatsapp ? `https://wa.me/${whatsapp}?text=${waText}` : ''

    setConfirmed({ id: result.orderId ?? '', waHref })
    clear()
  }

  if (confirmed) {
    return (
      <div className="max-w-md mx-auto text-center py-16 px-4">
        <div className="w-14 h-14 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">Pedido reservado!</h2>
        <p className="text-sm text-gray-500 mb-6">
          Reservamos os itens pra você. Fale com a loja para combinar pagamento e retirada/entrega.
        </p>
        <div className="space-y-3">
          {confirmed.waHref && (
            <a
              href={confirmed.waHref}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-lg bg-green-600 hover:bg-green-500 text-white font-medium transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              Continuar no WhatsApp
            </a>
          )}
          <Link href={`/${storeSlug}`} className="block text-center text-sm text-brand-600 hover:underline">
            Voltar para a loja
          </Link>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <p className="text-gray-400 text-sm mb-4">Seu carrinho está vazio.</p>
        <Link href={`/${storeSlug}`} className="text-sm text-brand-600 hover:underline">
          Ver produtos
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      {/* Items */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {items.map((item, i) => (
          <div key={item.variantId} className={`flex gap-4 p-4 ${i < items.length - 1 ? 'border-b border-gray-100' : ''}`}>
            <div className="w-16 h-16 rounded-lg bg-gray-100 shrink-0 relative flex items-center justify-center text-gray-300 overflow-hidden">
              {item.image ? (
                <Image src={item.image} alt={item.productName} fill className="object-cover" />
              ) : (
                <ImageOff className="w-7 h-7" strokeWidth={1.5} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{item.productName}</p>
              <p className="text-xs text-gray-400 mt-0.5">{item.variantLabel}</p>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2 border border-gray-200 rounded-lg overflow-hidden text-sm">
                  <button onClick={() => updateQty(item.variantId, item.qty - 1)} className="px-2 py-1 hover:bg-gray-50">−</button>
                  <span className="px-2 font-semibold">{item.qty}</span>
                  <button
                    onClick={() => updateQty(item.variantId, Math.min(item.maxQty, item.qty + 1))}
                    className="px-2 py-1 hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
                <p className="text-sm font-bold text-gray-900">{formatCurrency(item.price * item.qty)}</p>
              </div>
            </div>
            <button onClick={() => removeItem(item.variantId)} className="text-gray-300 hover:text-red-500 transition-colors self-start mt-0.5">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Subtotal ({totalQty} {totalQty === 1 ? 'item' : 'itens'})</span>
          <span className="font-medium">{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between font-bold text-gray-900 text-base border-t border-gray-100 pt-3">
          <span>Total</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
      </div>

      {/* Checkout form */}
      <form onSubmit={handleCheckout} className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
        <p className="text-sm font-semibold text-gray-900">Seus dados</p>
        <input
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="Nome completo"
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <input
          value={form.phone}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          placeholder="Telefone / WhatsApp"
          required
          type="tel"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <textarea
          value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          placeholder="Observações (opcional)"
          rows={2}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
        />

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button variant="primary" size="lg" className="w-full" type="submit" loading={submitting}>
          Reservar Pedido
        </Button>
        <p className="text-xs text-gray-400 text-center">
          Os itens ficam reservados. Pagamento e entrega são combinados direto com a loja.
        </p>
      </form>

      <Link href={`/${storeSlug}`} className="block text-center text-sm text-brand-600 hover:underline">
        Continuar comprando
      </Link>
    </div>
  )
}
