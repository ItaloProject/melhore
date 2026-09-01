'use client'

import { useState } from 'react'
import { Plus, Search, Edit2, Trash2, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'

const mockProducts = [
  { id: '1', name: 'Camisa Preta Básica', category: 'Camisas', price: 89.90, variants: 6, stock: 42, active: true, image: null },
  { id: '2', name: 'Calça Jeans Skinny',  category: 'Calças',  price: 189.90, variants: 8, stock: 18, active: true, image: null },
  { id: '3', name: 'Blusa de Frio G',     category: 'Blusas',  price: 129.90, variants: 4, stock: 7,  active: true, image: null },
  { id: '4', name: 'Vestido Floral Midi', category: 'Vestidos',price: 229.90, variants: 3, stock: 12, active: true, image: null },
  { id: '5', name: 'Bermuda Cargo',       category: 'Calças',  price: 119.90, variants: 5, stock: 0,  active: false,image: null },
]

export default function ProdutosPage() {
  const [search, setSearch] = useState('')

  const filtered = mockProducts.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Produtos</h1>
          <p className="text-sm text-gray-500 mt-0.5">{mockProducts.length} produtos cadastrados</p>
        </div>
        <Button variant="primary">
          <Plus className="w-4 h-4" /> Novo Produto
        </Button>
      </div>

      <Card>
        <div className="p-4 border-b border-gray-100">
          <Input
            placeholder="Buscar produto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
            className="max-w-xs"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wide">Produto</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wide">Categoria</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wide">Preço</th>
                <th className="text-center py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wide">Variações</th>
                <th className="text-center py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wide">Estoque</th>
                <th className="text-center py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wide">Status</th>
                <th className="py-3 px-4" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-xs font-bold shrink-0">
                        {p.name.charAt(0)}
                      </div>
                      <span className="font-medium text-gray-900">{p.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-500">{p.category}</td>
                  <td className="py-3 px-4 text-right font-semibold">{formatCurrency(p.price)}</td>
                  <td className="py-3 px-4 text-center text-gray-600">{p.variants}</td>
                  <td className="py-3 px-4 text-center">
                    <Badge variant={p.stock === 0 ? 'danger' : p.stock <= 5 ? 'warning' : 'success'}>
                      {p.stock} un.
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Badge variant={p.active ? 'success' : 'default'}>
                      {p.active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1 justify-end">
                      <Button variant="ghost" size="icon" title="Editar">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" title={p.active ? 'Desativar' : 'Ativar'}>
                        {p.active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button variant="ghost" size="icon" title="Excluir" className="text-red-500 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
