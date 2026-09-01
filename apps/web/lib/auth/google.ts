import { createClient } from '@/lib/supabase/client'

export function getAuthRedirectUrl(path = '/auth/callback') {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}${path}`
  }
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  return `${base.replace(/\/$/, '')}${path}`
}

function googleErrorMessage(message: string) {
  const lower = message.toLowerCase()
  if (
    lower.includes('provider is not enabled')
    || lower.includes('unsupported provider')
    || lower.includes('validation_failed')
  ) {
    return 'O login com Google ainda não está ativo. Use e-mail e senha.'
  }
  return message
}

export async function signInWithGoogle(next = '/cadastro/telefone') {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return 'Login com Google não está configurado. Use e-mail e senha.'
  }

  const supabase = createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${getAuthRedirectUrl()}?next=${encodeURIComponent(next)}`,
      skipBrowserRedirect: true,
      queryParams: {
        access_type: 'offline',
        prompt: 'select_account',
      },
    },
  })

  if (error) return googleErrorMessage(error.message)
  if (!data.url) return 'Não foi possível abrir o Google. Tente de novo.'

  window.location.assign(data.url)
  return null
}

export function onlyDigits(value: string) {
  return value.replace(/\D/g, '')
}

export function formatPhoneBr(value: string) {
  const d = onlyDigits(value).slice(0, 11)
  if (d.length <= 2) return d
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

export function isValidPhoneBr(value: string) {
  const d = onlyDigits(value)
  return d.length === 10 || d.length === 11
}
