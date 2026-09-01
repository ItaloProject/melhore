'use client'

import { useState } from 'react'
import { Search, ArrowUp, ArrowDown, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'

const mockInventory = [
  { id: '1', product: 'Camisa Preta Básica', size: 'P',  color: 'Preta', qty: 12, reserved: 1, min: 3 },
  { id: '2', product: 'Camisa Preta Básica', size: 'M',  color: 'Preta', qty: 8,  reserved: 0, min: 3 },
  { id: '3', product: 'Camisa Preta Básica', size: 'G',  color: 'Preta', qty: 5,  reserved: 2, min: 3 },
  { id: '4', product: 'Calça Jeans Skinny',  size: '38', color: 'Azul',  qty: 2,  reserved: 0, min: 2 },
  { id: '5', product: 'Calça Jeans Skinny',  size: '40', color: 'Azul',  qty: 6,  reserved: 1, min: 2 },
  { id: '6', product: 'Blusa de Frio G',     size: 'G',  color: 'Cinza', qty: 1,  reserved: 0, min: 3 },
  { id: '7', product: 'Vestido Floral Midi',  size: 'M',  color: 'Floral',qty: 4,  reserved: 1, min: 2 },
  { id: '8', product: 'Bermuda Cargo',        size: '42', color: 'Bege', qty: 0,  reserved: 0, min: 2 },
]

function stockStatus(qty: number, reserved: number, min: number) {
  const available = qty - reserved
  if (available === 0) return { label: 'Sem estoque', variant: 'danger' as const }
  if (available <= min) return { label: 'Crítico',    variant: 'warning' as const }
  return { label: 'Normal',      variant: 'success' as const }
}

export default function EstoquePage() {
  const [search, setSearch] = useState('')

  const filtered = mockInventory.filter((i) =>
    `${i.product} ${i.size} ${i.color}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Estoque</h1>
          <p className="text-sm text-gray-500 mt-0.5">Controle por variação (tamanho + cor)</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="w-4 h-4" /> Filtros
          </Button>
          <Button variant="primary">Ajustar Estoque</Button>
        </div>
      </div>

      {/* Summary pills */}
      <div className="flex gap-3 flex-wrap">
        <span className="inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-1.5 text-sm font-medium text-green-700">
          {mockInventory.filter(i => (i.qty - i.reserved) > i.min).length} variações normais
        </span>
        <span className="inline-flex items-center gap-2 rounded-full bg-yellow-50 px-4 py-1.5 text-sm font-medium text-yellow-700">
          {mockInventory.filter(i => (i.qty - i.reserved) > 0 && (i.qty - i.reserved) <= i.min).length} variações críticas
        </span>
        <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-1.5 text-sm font-medium text-red-700">
          {mockInventory.filter(i => (i.qty - i.reserved) === 0).length} sem estoque
        </span>
      </div>

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
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wide">Produto</th>
                <th className="text-center py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wide">Tamanho</th>
                <th className="text-center py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wide">Cor</th>
                <th className="text-center py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wide">Total</th>
                <th className="text-center py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wide">Reservado</th>
                <th className="text-center py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wide">Disponível</th>
                <th className="text-center py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wide">Status</th>
                <th className="py-3 px-4" />
              </tr>
            </thead>
            <tbody>
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
                    <td className="py-3 px-4 text-center">
                      <Badge variant={variant}>{label}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 justify-end">
                        <Button variant="ghost" size="icon" title="Adicionar">
                          <ArrowUp className="w-4 h-4 text-green-600" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Remover">
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
    </div>
  )
}
