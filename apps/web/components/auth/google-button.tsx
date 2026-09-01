'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { GoogleIcon } from '@/components/auth/auth-shell'
import { signInWithGoogle } from '@/lib/auth/google'

export function GoogleButton({ next = '/cadastro/telefone' }: { next?: string }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleClick() {
    setLoading(true)
    setError('')
    const message = await signInWithGoogle(next)
    if (message) {
      setError(message)
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="dark"
        size="lg"
        className="w-full bg-white text-slate-900 hover:bg-slate-100 border-0"
        loading={loading}
        onClick={handleClick}
      >
        {!loading && <GoogleIcon />}
        Continuar com Google
      </Button>
      {error && <p className="text-sm text-red-400 text-center">{error}</p>}
    </div>
  )
}

export function AuthDivider() {
  return (
    <div className="flex items-center gap-3 my-5">
      <div className="h-px flex-1 bg-white/10" />
      <span className="text-[11px] uppercase tracking-wider text-slate-500">ou</span>
      <div className="h-px flex-1 bg-white/10" />
    </div>
  )
}
