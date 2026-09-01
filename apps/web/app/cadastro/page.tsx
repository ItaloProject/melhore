'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AuthShell } from '@/components/auth/auth-shell'
import { AuthDivider, GoogleButton } from '@/components/auth/google-button'
import { createClient } from '@/lib/supabase/client'
import { formatPhoneBr, isValidPhoneBr, getAuthRedirectUrl } from '@/lib/auth/google'
import { ensureStore } from '@/lib/actions/store'

export default function CadastroPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [phone, setPhone] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setInfo('')

    if (!isValidPhoneBr(phone)) {
      setError('Informe um telefone válido com DDD.')
      setLoading(false)
      return
    }

    const form = e.currentTarget
    const email = (form.elements.namedItem('email') as HTMLInputElement).value
    const password = (form.elements.namedItem('password') as HTMLInputElement).value

    const supabase = createClient()
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${getAuthRedirectUrl()}?next=${encodeURIComponent('/cadastro/telefone')}`,
        data: { phone },
      },
    })

    if (signUpError) {
      setError(signUpError.message === 'User already registered'
        ? 'Este e-mail já tem conta. Entre para continuar.'
        : signUpError.message)
      setLoading(false)
      return
    }

    if (data.session) {
      const result = await ensureStore({ phone })
      if (result.error) {
        setError(result.error)
        setLoading(false)
        return
      }
      router.push('/admin')
      router.refresh()
      return
    }

    setInfo('Enviamos um e-mail de confirmação. Abra o link para entrar na sua loja.')
    setLoading(false)
  }

  return (
    <AuthShell title="Crie sua loja grátis" subtitle="E-mail, senha e um telefone para contato.">
      <GoogleButton />
      <AuthDivider />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">E-mail</label>
          <input
            name="email"
            type="email"
            placeholder="seu@email.com"
            required
            autoComplete="email"
            className="w-full rounded-xl bg-surface-900 border border-white/10 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">Senha</label>
          <input
            name="password"
            type="password"
            placeholder="Mínimo 6 caracteres"
            required
            minLength={6}
            autoComplete="new-password"
            className="w-full rounded-xl bg-surface-900 border border-white/10 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">Telefone da loja</label>
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
          <p className="text-[11px] text-slate-500 mt-1.5">Usamos só para contato da equipe Melhore com a loja.</p>
        </div>

        {error && <p className="text-sm text-red-400 text-center">{error}</p>}
        {info && <p className="text-sm text-emerald-400 text-center">{info}</p>}

        <Button variant="primary" size="lg" className="w-full mt-2" loading={loading} type="submit">
          Criar conta
        </Button>
      </form>

      <div className="mt-5 text-center">
        <p className="text-sm text-slate-500">
          Já tem conta?{' '}
          <Link href="/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
            Entrar
          </Link>
        </p>
      </div>
    </AuthShell>
  )
}
