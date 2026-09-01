'use client'

import Link from 'next/link'
import { ChevronLeft, Trash2, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'

// This component uses Zustand cart store
// For now showing a static demo layout

const demoItems = [
  { id: 'v1', name: 'Camisa Preta Básica', variant: 'M / Preta', price: 89.90, qty: 2, image: null },
  { id: 'v2', name: 'Vestido Floral Midi',  variant: 'M / Floral',price: 229.90,qty: 1, image: null },
]

export default function CarrinhoPage({ params }: { params: { store: string } }) {
  const subtotal = demoItems.reduce((s, i) => s + i.price * i.qty, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center gap-3">
          <Link href={`/${params.store}`} className="p-1.5 hover:bg-gray-50 rounded-lg -ml-1.5">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="font-semibold text-gray-900">Carrinho ({demoItems.length})</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Items */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {demoItems.map((item, i) => (
            <div key={item.id} className={`flex gap-4 p-4 ${i < demoItems.length - 1 ? 'border-b border-gray-100' : ''}`}>
              <div className="w-16 h-16 rounded-lg bg-gray-100 shrink-0 flex items-center justify-center text-gray-300">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{item.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{item.variant}</p>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2 border border-gray-200 rounded-lg overflow-hidden text-sm">
                    <button className="px-2 py-1 hover:bg-gray-50">−</button>
                    <span className="px-2 font-semibold">{item.qty}</span>
                    <button className="px-2 py-1 hover:bg-gray-50">+</button>
                  </div>
                  <p className="text-sm font-bold text-gray-900">{formatCurrency(item.price * item.qty)}</p>
                </div>
              </div>
              <button className="text-gray-300 hover:text-red-500 transition-colors self-start mt-0.5">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal ({demoItems.reduce((s, i) => s + i.qty, 0)} itens)</span>
            <span className="font-medium">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between font-bold text-gray-900 text-base border-t border-gray-100 pt-3">
            <span>Total</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button variant="primary" size="lg" className="w-full">
            Finalizar Compra
          </Button>
          <a
            href={`https://wa.me/5511999990000?text=Olá! Quero fazer um pedido:%0A${demoItems.map(i => `• ${i.name} (${i.variant}) x${i.qty}`).join('%0A')}%0ATotal: ${formatCurrency(subtotal)}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-lg border border-green-500 text-green-700 hover:bg-green-50 font-medium transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            Reservar via WhatsApp
          </a>
          <Link href={`/${params.store}`} className="block text-center text-sm text-brand-600 hover:underline">
            Continuar comprando
          </Link>
        </div>
      </div>
    </div>
  )
}
