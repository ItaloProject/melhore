'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AuthShell } from '@/components/auth/auth-shell'
import { NATIVE_AUTH_STATE } from '@/components/auth/google-button'
import { decryptNativeCredential, nativeRequestId } from '@/lib/auth/native-crypto'
import { createClient } from '@/lib/supabase/client'

export default function NativeAuthCallbackPage() {
  const [error, setError] = useState('')

  useEffect(() => {
    async function finishLogin() {
      const params = new URLSearchParams(window.location.hash.slice(1))
      const request = params.get('request')
      const payload = params.get('payload')
      const expectedState = sessionStorage.getItem(NATIVE_AUTH_STATE)

      window.history.replaceState(null, '', '/auth/native/callback')

      if (
        !request
        || !payload
        || !expectedState
        || request !== await nativeRequestId(expectedState)
      ) {
        setError('Não foi possível validar este acesso. Volte à tela de login e tente novamente.')
        return
      }

      const credential = await decryptNativeCredential(expectedState, payload)
      sessionStorage.removeItem(NATIVE_AUTH_STATE)
      const supabase = createClient()
      const { error: sessionError } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: credential.idToken,
        nonce: credential.nonce,
      })

      if (sessionError) {
        setError('A sessão do Google não pôde ser iniciada. Tente novamente.')
        return
      }

      window.location.replace('/auth/continue')
    }

    finishLogin().catch(() => {
      setError('Ocorreu um erro ao concluir o acesso.')
    })
  }, [])

  return (
    <AuthShell
      title={error ? 'Acesso não concluído' : 'Concluindo seu acesso'}
      subtitle={error ? 'Sua conta permanece protegida.' : 'Aguarde um instante…'}
    >
      {error ? (
        <div className="space-y-4 text-center">
          <p className="text-sm text-red-400">{error}</p>
          <Link href="/login" className="text-sm font-medium text-brand-400 hover:text-brand-300">
            Voltar para o login
          </Link>
        </div>
      ) : (
        <div className="flex justify-center py-3" aria-label="Carregando">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
        </div>
      )}
    </AuthShell>
  )
}
