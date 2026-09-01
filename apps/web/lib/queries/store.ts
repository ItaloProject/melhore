import { createClient } from '@/lib/supabase/server'
import { getSessionUser } from '@/lib/auth/session'
import { getViewStoreId, isPlatformAdmin, storeAccess } from '@/lib/auth/platform'
import { redirect } from 'next/navigation'

export async function requireStore(opts?: { allowLocked?: boolean }) {
  const user = await getSessionUser()
  if (!user) redirect('/login')

  const platform = await isPlatformAdmin(user)
  const viewId = platform ? getViewStoreId() : null
  if (viewId) {
    return { user, storeId: viewId, role: 'owner', impersonating: true as const }
  }

  let storeUser: { store_id: string; role: string } | null = null
  const supabase = createClient()
  try {
    const { data } = await supabase
      .from('store_users')
      .select('store_id, role')
      .eq('user_id', user.id)
      .maybeSingle()
    storeUser = data
  } catch {
    storeUser = null
  }

  if (!storeUser) {
    if (platform) redirect('/plataforma')
    redirect('/cadastro/telefone')
  }

  if (!opts?.allowLocked) {
    const { data: store } = await supabase
      .from('stores')
      .select('account_status, billing_status, trial_ends_at, current_period_end, grace_until')
      .eq('id', storeUser.store_id)
      .maybeSingle()

    if (store && storeAccess(store) === 'locked' && !platform) {
      redirect('/admin/assinatura')
    }
  }

  return {
    user,
    storeId: storeUser.store_id as string,
    role: storeUser.role as string,
    impersonating: false as const,
  }
}

export async function getMyStoreContact() {
  const user = await getSessionUser()
  if (!user) return { user: null, store: null }

  try {
    const supabase = createClient()
    const { data: membership } = await supabase
      .from('store_users')
      .select('store_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!membership) return { user, store: null }

    const { data: store } = await supabase
      .from('stores')
      .select('id, name, phone')
      .eq('id', membership.store_id)
      .maybeSingle()

    return { user, store }
  } catch {
    return { user, store: null }
  }
}
