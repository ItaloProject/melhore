import type { User } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'

export const VIEW_STORE_COOKIE = 'melhore_view_store'

export function platformAdminEmails() {
  return (process.env.PLATFORM_ADMIN_EMAILS ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
}

export function emailIsPlatformAdmin(email?: string | null) {
  if (!email) return false
  return platformAdminEmails().includes(email.toLowerCase())
}

export async function isPlatformAdmin(user?: User | null) {
  const sessionUser = user ?? await getSessionUser()
  if (!sessionUser) return false
  if (emailIsPlatformAdmin(sessionUser.email)) return true

  try {
    const supabase = createClient()
    const { data, error } = await supabase.rpc('is_platform_admin')
    if (!error && data === true) return true
  } catch {
    /* RPC still not applied */
  }

  return false
}

export async function requirePlatformAdmin() {
  const user = await getSessionUser()
  if (!user) redirect('/login?next=/plataforma')
  if (!(await isPlatformAdmin(user))) redirect('/admin')
  return user
}

export function getViewStoreId() {
  return cookies().get(VIEW_STORE_COOKIE)?.value ?? null
}

export type StoreAccess = 'ok' | 'grace' | 'locked'

export function storeAccess(store: {
  account_status?: string | null
  billing_status?: string | null
  trial_ends_at?: string | null
  current_period_end?: string | null
  grace_until?: string | null
}): StoreAccess {
  if (store.account_status === 'inactive') return 'locked'

  const now = Date.now()
  const trialEnd = store.trial_ends_at ? new Date(store.trial_ends_at).getTime() : 0
  const periodEnd = store.current_period_end ? new Date(store.current_period_end).getTime() : 0
  const graceEnd = store.grace_until ? new Date(store.grace_until).getTime() : 0

  if (store.billing_status === 'paid' && (!periodEnd || periodEnd >= now)) return 'ok'
  if (store.billing_status === 'trial' && (!trialEnd || trialEnd >= now)) return 'ok'
  if (graceEnd && graceEnd >= now) return 'grace'
  if (store.billing_status === 'trial' && trialEnd && trialEnd < now && (!graceEnd || graceEnd >= now)) {
    return 'grace'
  }
  return 'locked'
}
