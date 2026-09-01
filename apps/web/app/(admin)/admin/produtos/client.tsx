'use client'

import { useState } from 'react'
import { Search, Edit2, Trash2, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Product {
  id: string
  name: string
  category: string
  price: number
  variants: number
  stock: number
  active: boolean
}

export function ProdutosClient({ products, storeId }: { products: Product[]; storeId: string }) {
  const router = useRouter()
  const [search, setSearch] = useState('')

  const filtered = products.filter((p) =>
    `${p.name} ${p.category}`.toLowerCase().includes(search.toLowerCase())
  )

  const toggleActive = async (id: string, current: boolean) => {
    const supabase = createClient()
    await supabase.from('products').update({ active: !current }).eq('id', id)
    router.refresh()
  }

  const deleteProduct = async (id: string) => {
    if (!confirm('Excluir este produto? Esta ação não pode ser desfeita.')) return
    const supabase = createClient()
    await supabase.from('products').delete().eq('id', id)
    router.refresh()
  }

  return (
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
              {['Produto', 'Categoria', 'Preço', 'Variações', 'Estoque', 'Status', ''].map((h) => (
                <th key={h} className={`py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wide ${h === '' || h === 'Preço' ? 'text-right' : h === 'Variações' || h === 'Estoque' || h === 'Status' ? 'text-center' : 'text-left'}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="py-12 text-center text-sm text-gray-400">Nenhum produto encontrado</td></tr>
            )}
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
                  <Badge variant={p.active ? 'success' : 'default'}>{p.active ? 'Ativo' : 'Inativo'}</Badge>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-1 justify-end">
                    <Button variant="ghost" size="icon" title="Editar">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title={p.active ? 'Desativar' : 'Ativar'} onClick={() => toggleActive(p.id, p.active)}>
                      {p.active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" title="Excluir" className="text-red-500 hover:bg-red-50" onClick={() => deleteProduct(p.id)}>
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
  )
}
