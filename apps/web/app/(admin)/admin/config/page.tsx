'use client'

import { useState } from 'react'
import { Save, Store, Phone, MapPin, Palette, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export default function ConfigPage() {
  const [saving, setSaving] = useState(false)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await new Promise((r) => setTimeout(r, 800))
    setSaving(false)
    toast.success('Configurações salvas!')
  }

  return (
    <div className="p-6 space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">Configurações da Loja</h1>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Identity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="w-4 h-4 text-gray-400" /> Identidade
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Nome da loja" defaultValue="Minha Loja" required />
            <Input label="Slug (URL)" defaultValue="minha-loja" required
              leftIcon={<span className="text-gray-400 text-xs">melhore.com.br/</span>} />
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Logo</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center text-sm text-gray-400 hover:border-brand-400 cursor-pointer transition-colors">
                Clique para fazer upload do logo (PNG, SVG)
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-400" /> Contato
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Telefone" type="tel" placeholder="(11) 99999-0000" />
            <Input label="WhatsApp" type="tel" placeholder="5511999990000" />
            <Input label="E-mail" type="email" placeholder="loja@email.com" />
            <Input label="Instagram" placeholder="@minha_loja" />
          </CardContent>
        </Card>

        {/* Address */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-400" /> Endereço
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Input label="Endereço" placeholder="Rua das Flores, 123" />
            </div>
            <Input label="Cidade" placeholder="São Paulo" />
            <Input label="Estado" placeholder="SP" />
          </CardContent>
        </Card>

        {/* Theme */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-gray-400" /> Aparência da Vitrine
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cor principal</label>
              <div className="flex items-center gap-3">
                <input type="color" defaultValue="#c026d3" className="w-12 h-10 rounded-lg border border-gray-300 cursor-pointer" />
                <span className="text-sm text-gray-500">Usada em botões e destaques da vitrine</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Storefront link */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-gray-400" /> Vitrine Online
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <span className="text-sm text-gray-500 flex-1 truncate">melhore.com.br/<span className="font-semibold text-gray-900">minha-loja</span></span>
              <Button variant="outline" size="sm" type="button" onClick={() => window.open('/minha-loja', '_blank')}>
                Abrir vitrine
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button variant="primary" size="lg" type="submit" loading={saving}>
            <Save className="w-4 h-4" /> Salvar Configurações
          </Button>
        </div>
      </form>
    </div>
  )
}
