'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

function Logo() {
  return (
    <span className="text-2xl font-bold tracking-tight text-white">
      melhor<span className="text-brand-400">e</span>
    </span>
  )
}

export default function LoginPage() {
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      window.location.href = '/admin'
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 relative overflow-hidden">
      {/* background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <Logo />
          </Link>
          <p className="text-slate-400 text-sm mt-3">Entre na sua conta</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-surface-800 p-7 shadow-2xl shadow-black/40">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">E-mail</label>
              <input
                type="email"
                placeholder="seu@email.com"
                required
                className="w-full rounded-xl bg-surface-900 border border-white/10 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-300">Senha</label>
                <Link href="/esqueci-senha" className="text-xs text-brand-400 hover:text-brand-300 transition-colors">
                  Esqueceu?
                </Link>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                required
                className="w-full rounded-xl bg-surface-900 border border-white/10 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
              />
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full mt-2"
              loading={loading}
              type="submit"
            >
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
