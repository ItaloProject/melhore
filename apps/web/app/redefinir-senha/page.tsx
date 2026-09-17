'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { AuthShell } from '@/components/auth/auth-shell'
import { createClient } from '@/lib/supabase/client'

export default function RedefinirSenhaPage() {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        setError('Link inválido ou expirado. Solicite um novo link de redefinição.')
      }
      setReady(true)
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('A senha precisa ter pelo menos 6 caracteres.')
      return
    }
    if (password !== confirm) {
      setError('As senhas não coincidem.')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (updateError) {
      setError(updateError.message)
      return
    }

    setDone(true)
    setTimeout(() => {
      router.push('/auth/continue')
      router.refresh()
    }, 1500)
  }

  if (!ready) return null

  if (done) {
    return (
      <AuthShell title="Senha redefinida!" subtitle="Você já pode continuar.">
        <p className="text-sm text-slate-400 text-center">Redirecionando para sua conta...</p>
      </AuthShell>
    )
  }

  return (
    <AuthShell title="Crie uma nova senha" subtitle="Escolha uma senha forte para sua conta.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">Nova senha</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 6 caracteres"
            required
            minLength={6}
            autoComplete="new-password"
            className="w-full rounded-xl bg-surface-900 border border-white/10 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">Confirme a senha</label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Repita a senha"
            required
            minLength={6}
            autoComplete="new-password"
            className="w-full rounded-xl bg-surface-900 border border-white/10 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
          />
        </div>

        {error && <p className="text-sm text-red-400 text-center">{error}</p>}

        <Button variant="primary" size="lg" className="w-full mt-2" loading={loading} type="submit">
          Salvar nova senha
        </Button>
      </form>
    </AuthShell>
  )
}
