'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

function Logo() {
  return (
    <span className="text-2xl font-bold tracking-[0.06em] text-white">
      MELHOR<span className="text-brand-400 logo-e">E</span>
    </span>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const form = e.currentTarget
    const email    = (form.elements.namedItem('email')    as HTMLInputElement).value
    const password = (form.elements.namedItem('password') as HTMLInputElement).value

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError('E-mail ou senha inválidos.')
      setLoading(false)
      return
    }

    router.push('/admin')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/"><Logo /></Link>
          <p className="text-slate-400 text-sm mt-3">Entre na sua conta</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-surface-800 p-7 shadow-2xl shadow-black/40">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">E-mail</label>
              <input
                name="email"
                type="email"
                placeholder="seu@email.com"
                required
                className="w-full rounded-xl bg-surface-900 border border-white/10 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-300">Senha</label>
              </div>
              <input
                name="password"
                type="password"
                placeholder="••••••••"
                required
                className="w-full rounded-xl bg-surface-900 border border-white/10 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
              />
            </div>

            {error && (
              <p className="text-sm text-red-400 text-center">{error}</p>
            )}

            <Button variant="primary" size="lg" className="w-full mt-2" loading={loading} type="submit">
              Entrar
            </Button>
          </form>

          <div className="mt-5 text-center">
            <p className="text-sm text-slate-500">
              Não tem conta?{' '}
              <Link href="/cadastro" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
                Cadastre-se grátis
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
