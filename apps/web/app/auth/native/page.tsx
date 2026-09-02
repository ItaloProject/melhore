'use client'

import { useEffect, useState } from 'react'
import { AuthShell } from '@/components/auth/auth-shell'
import { GoogleButton } from '@/components/auth/google-button'

export default function NativeAuthPage() {
  const [state, setState] = useState<string | null>(null)

  useEffect(() => {
    const value = new URLSearchParams(window.location.hash.slice(1)).get('state') || ''
    window.history.replaceState(null, '', '/auth/native')
    setState(/^[a-f0-9]{48}$/.test(value) ? value : '')
  }, [])

  return (
    <AuthShell
      title="Entrar no aplicativo Melhore"
      subtitle="Escolha sua conta do Google. Depois, você voltará ao aplicativo automaticamente."
    >
      {state === null ? (
        <div className="flex justify-center py-3" aria-label="Carregando">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
        </div>
      ) : state ? (
        <GoogleButton handoffState={state} />
      ) : (
        <p className="text-sm text-red-400 text-center">
          Esta solicitação de acesso expirou ou é inválida. Volte ao aplicativo e tente novamente.
        </p>
      )}
    </AuthShell>
  )
}
