'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, MailCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AuthShell } from '@/components/auth/auth-shell'
import { createClient } from '@/lib/supabase/client'
import { getAuthRedirectUrl } from '@/lib/auth/google'

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: getAuthRedirectUrl('/auth/callback?next=/redefinir-senha'),
    })

    setLoading(false)
    if (resetError) {
      setError('Não foi possível enviar o e-mail. Verifique o endereço e tente de novo.')
      return
    }
    setSent(true)
  }

  if (sent) {
    return (
      <AuthShell title="Verifique seu e-mail" subtitle="Enviamos um link para redefinir sua senha.">
        <div className="text-center py-4">
          <MailCheck className="w-10 h-10 text-brand-400 mx-auto mb-4" />
          <p className="text-sm text-slate-400">
            Se <span className="text-white font-medium">{email}</span> tiver uma conta, você vai receber um
            e-mail com um link para criar uma nova senha.
          </p>
        </div>
        <Link href="/login" className="flex items-center justify-center gap-1.5 text-sm text-brand-400 hover:text-brand-300 font-medium transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Voltar para o login
        </Link>
      </AuthShell>
    )
  }

  return (
    <AuthShell title="Esqueceu sua senha?" subtitle="Digite seu e-mail para receber o link de redefinição.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">E-mail</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            required
            autoComplete="email"
            className="w-full rounded-xl bg-surface-900 border border-white/10 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
          />
        </div>

        {error && <p className="text-sm text-red-400 text-center">{error}</p>}

        <Button variant="primary" size="lg" className="w-full mt-2" loading={loading} type="submit">
          Enviar link de redefinição
        </Button>
      </form>

      <div className="mt-5 text-center">
        <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-white transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Voltar para o login
        </Link>
      </div>
    </AuthShell>
  )
}
