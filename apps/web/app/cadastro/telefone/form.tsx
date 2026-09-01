'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { AuthShell } from '@/components/auth/auth-shell'
import { formatPhoneBr, isValidPhoneBr } from '@/lib/auth/google'
import { ensureStore } from '@/lib/actions/store'

export function PhoneForm({ defaultPhone = '' }: { defaultPhone?: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [phone, setPhone] = useState(defaultPhone)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!isValidPhoneBr(phone)) {
      setError('Informe um telefone válido com DDD.')
      setLoading(false)
      return
    }

    const result = await ensureStore({ phone })
    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    router.push('/admin')
    router.refresh()
  }

  return (
    <AuthShell
      title="Telefone da loja"
      subtitle="Só para a equipe Melhore poder falar com você."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">Celular ou WhatsApp</label>
          <input
            name="phone"
            type="tel"
            inputMode="tel"
            placeholder="(11) 99999-0000"
            required
            value={phone}
            onChange={(e) => setPhone(formatPhoneBr(e.target.value))}
            className="w-full rounded-xl bg-surface-900 border border-white/10 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
          />
        </div>

        {error && <p className="text-sm text-red-400 text-center">{error}</p>}

        <Button variant="primary" size="lg" className="w-full" loading={loading} type="submit">
          Continuar
        </Button>
      </form>
    </AuthShell>
  )
}
