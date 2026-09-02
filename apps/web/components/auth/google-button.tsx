'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Script from 'next/script'
import { Button, buttonVariants } from '@/components/ui/button'
import { GoogleIcon } from '@/components/auth/auth-shell'
import { createClient } from '@/lib/supabase/client'
import { encryptNativeCredential } from '@/lib/auth/native-crypto'

const NATIVE_AUTH_STATE = 'melhore_native_auth_state'

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

function isInstalledApp() {
  return /Electron|MelhoreAndroid/i.test(navigator.userAgent)
}

function randomState() {
  const bytes = crypto.getRandomValues(new Uint8Array(24))
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

export function GoogleButton({
  next = '/cadastro/telefone',
  handoffState,
}: {
  next?: string
  handoffState?: string
}) {
  const router = useRouter()
  const buttonRef = useRef<HTMLDivElement>(null)
  const [nativeApp, setNativeApp] = useState(false)
  const [scriptReady, setScriptReady] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [returnUrl, setReturnUrl] = useState('')

  useEffect(() => {
    setNativeApp(isInstalledApp())
  }, [])

  useEffect(() => {
    if (nativeApp || !scriptReady || !buttonRef.current || !window.google) return

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

          if (handoffState) {
            const encrypted = await encryptNativeCredential(handoffState, {
              idToken: credential,
              nonce: nonce.raw,
            })
            const fragment = new URLSearchParams(encrypted)
            const callbackUrl = `melhore://auth/callback#${fragment.toString()}`
            setReturnUrl(callbackUrl)
            setLoading(false)
            window.location.assign(callbackUrl)
            return
          }

          const supabase = createClient()
          const { data, error: authError } = await supabase.auth.signInWithIdToken({
            provider: 'google',
            token: credential,
            nonce: nonce.raw,
          })

          if (authError || !data.session) {
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
  }, [handoffState, nativeApp, next, router, scriptReady])

  function openInSystemBrowser() {
    const state = randomState()
    sessionStorage.setItem(NATIVE_AUTH_STATE, state)
    const url = new URL('/auth/native', window.location.origin)
    url.hash = new URLSearchParams({ state }).toString()
    if (/MelhoreAndroid/i.test(navigator.userAgent)) {
      window.location.assign(url.toString())
    } else {
      window.open(url.toString(), '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div className="space-y-2">
      {!nativeApp && (
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
          onLoad={() => setScriptReady(true)}
          onError={() => setError('Não foi possível carregar o login do Google.')}
        />
      )}

      {returnUrl ? (
        <div className="space-y-3 text-center">
          <p className="text-sm text-slate-300">Login aprovado. Volte ao aplicativo para continuar.</p>
          <a
            href={returnUrl}
            className={buttonVariants({ variant: 'primary', size: 'lg', className: 'w-full' })}
          >
            Abrir o aplicativo Melhore
          </a>
        </div>
      ) : nativeApp ? (
        <Button
          type="button"
          variant="dark"
          size="lg"
          className="w-full bg-white text-slate-900 hover:bg-slate-100 border-0"
          onClick={openInSystemBrowser}
        >
          <GoogleIcon />
          Continuar com Google no navegador
        </Button>
      ) : (
        <div
          ref={buttonRef}
          className={
            loading
              ? 'pointer-events-none flex min-h-11 justify-center opacity-60'
              : 'flex min-h-11 justify-center'
          }
          aria-busy={loading}
        />
      )}

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

export { NATIVE_AUTH_STATE }
