import { createClient } from '@/lib/supabase/client'

export function getAuthRedirectUrl(path = '/auth/callback') {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}${path}`
  }
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  return `${base.replace(/\/$/, '')}${path}`
}

export async function signInWithGoogle(next = '/cadastro/telefone') {
  const supabase = createClient()

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${getAuthRedirectUrl()}?next=${encodeURIComponent(next)}`,
      queryParams: {
        access_type: 'offline',
        prompt: 'select_account',
      },
    },
  })

  return error?.message ?? null
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
