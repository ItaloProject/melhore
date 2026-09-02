'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Script from 'next/script'
import { createClient } from '@/lib/supabase/client'

type GoogleCredentialResponse = {
  credential?: string
}

type GoogleIdentity = {
  accounts: {
    id: {
      initialize: (options: {
        client_id: string
        callback: (response: GoogleCredentialResponse) => void
        nonce: string
        auto_select: boolean
        cancel_on_tap_outside: boolean
      }) => void
      renderButton: (
        element: HTMLElement,
        options: {
          type: 'standard'
          theme: 'outline'
          size: 'large'
          text: 'continue_with'
          shape: 'rectangular'
          logo_alignment: 'left'
          width: number
          locale: string
        },
      ) => void
    }
  }
}

declare global {
  interface Window {
    google?: GoogleIdentity
  }
}

async function createNonce() {
  const bytes = crypto.getRandomValues(new Uint8Array(32))
  const raw = btoa(String.fromCharCode(...bytes))
  const encoded = new TextEncoder().encode(raw)
  const digest = await crypto.subtle.digest('SHA-256', encoded)
  const hashed = Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
  return { raw, hashed }
}

export function GoogleButton({ next = '/cadastro/telefone' }: { next?: string }) {
  const router = useRouter()
  const buttonRef = useRef<HTMLDivElement>(null)
  const [scriptReady, setScriptReady] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!scriptReady || !buttonRef.current || !window.google) return

    let active = true

    async function setupGoogleButton() {
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
      if (!clientId || !window.google || !buttonRef.current) {
        setError('Login com Google não está configurado.')
        return
      }

      const nonce = await createNonce()
      if (!active || !window.google || !buttonRef.current) return

      window.google.accounts.id.initialize({
        client_id: clientId,
        nonce: nonce.hashed,
        auto_select: false,
        cancel_on_tap_outside: false,
        callback: async ({ credential }) => {
          if (!credential) {
            setError('O Google não retornou uma credencial válida.')
            return
          }

          setLoading(true)
          setError('')
          const supabase = createClient()
          const { error: authError } = await supabase.auth.signInWithIdToken({
            provider: 'google',
            token: credential,
            nonce: nonce.raw,
          })

          if (authError) {
            setError('Não foi possível entrar com o Google. Tente novamente.')
            setLoading(false)
            return
          }

          router.push(next)
          router.refresh()
        },
      })

      buttonRef.current.replaceChildren()
      window.google.accounts.id.renderButton(buttonRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        shape: 'rectangular',
        logo_alignment: 'left',
        width: Math.min(buttonRef.current.clientWidth || 300, 340),
        locale: 'pt-BR',
      })
    }

    setupGoogleButton().catch(() => {
      setError('Não foi possível carregar o login do Google.')
    })

    return () => {
      active = false
    }
  }, [next, router, scriptReady])

  return (
    <div className="space-y-2">
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
        onError={() => setError('Não foi possível carregar o login do Google.')}
      />
      <div
        ref={buttonRef}
        className={
          loading
            ? 'pointer-events-none flex min-h-11 justify-center opacity-60'
            : 'flex min-h-11 justify-center'
        }
        aria-busy={loading}
      />
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
