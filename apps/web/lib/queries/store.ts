import { createClient } from '@/lib/supabase/server'
import { getSessionUser } from '@/lib/auth/session'
import { redirect } from 'next/navigation'

export async function requireStore() {
  const user = await getSessionUser()
  if (!user) redirect('/login')

  let storeUser: { store_id: string; role: string } | null = null
  try {
    const supabase = createClient()
    const { data } = await supabase
      .from('store_users')
      .select('store_id, role')
      .eq('user_id', user.id)
      .maybeSingle()
    storeUser = data
  } catch {
    storeUser = null
  }

  if (!storeUser) redirect('/cadastro/telefone')

  return { user, storeId: storeUser.store_id as string, role: storeUser.role as string }
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
