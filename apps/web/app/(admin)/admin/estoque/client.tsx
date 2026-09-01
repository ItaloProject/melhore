'use client'

import { useState } from 'react'
import { Search, ArrowUp, ArrowDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface InventoryItem {
  id: string
  variantId: string
  product: string
  size: string
  color: string
  qty: number
  reserved: number
  min: number
}

function stockStatus(qty: number, reserved: number, min: number) {
  const available = qty - reserved
  if (available <= 0) return { label: 'Sem estoque', variant: 'danger' as const }
  if (available <= min) return { label: 'Crítico',    variant: 'warning' as const }
  return { label: 'Normal',      variant: 'success' as const }
}

export function EstoqueClient({ inventory, storeId }: { inventory: InventoryItem[]; storeId: string }) {
  const router = useRouter()
  const [search, setSearch] = useState('')

  const filtered = inventory.filter((i) =>
    `${i.product} ${i.size} ${i.color}`.toLowerCase().includes(search.toLowerCase())
  )

  const adjust = async (id: string, variantId: string, currentQty: number, delta: number) => {
    const newQty = Math.max(0, currentQty + delta)
    const supabase = createClient()
    await supabase
      .from('inventory')
      .update({ quantity: newQty })
      .eq('id', id)

    await supabase.from('inventory_movements').insert({
      store_id:   storeId,
      variant_id: variantId,
      type:       'adjustment',
      quantity:   delta,
    })

    router.refresh()
  }

  return (
    <Card>
      <div className="p-4 border-b border-gray-100">
        <Input
          placeholder="Buscar produto, tamanho ou cor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
          className="max-w-sm"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {['Produto', 'Tamanho', 'Cor', 'Total', 'Reservado', 'Disponível', 'Status', ''].map((h) => (
                <th key={h} className={`py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wide ${h === 'Produto' || h === '' ? 'text-left' : 'text-center'}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="py-12 text-center text-sm text-gray-400">Nenhum item encontrado</td></tr>
            )}
            {filtered.map((item) => {
              const available = item.qty - item.reserved
              const { label, variant } = stockStatus(item.qty, item.reserved, item.min)
              return (
                <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 font-medium text-gray-900">{item.product}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-gray-100 text-gray-700 text-xs font-bold">{item.size}</span>
                  </td>
                  <td className="py-3 px-4 text-center text-gray-600">{item.color}</td>
                  <td className="py-3 px-4 text-center font-semibold">{item.qty}</td>
                  <td className="py-3 px-4 text-center text-gray-400">{item.reserved}</td>
                  <td className="py-3 px-4 text-center font-bold text-gray-900">{available}</td>
                  <td className="py-3 px-4 text-center"><Badge variant={variant}>{label}</Badge></td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1 justify-end">
                      <Button variant="ghost" size="icon" title="Adicionar" onClick={() => adjust(item.id, item.variantId, item.qty, 1)}>
                        <ArrowUp className="w-4 h-4 text-green-600" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Remover" onClick={() => adjust(item.id, item.variantId, item.qty, -1)}>
                        <ArrowDown className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
