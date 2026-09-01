'use server'

import { createClient } from '@/lib/supabase/server'

export async function ensureStore(input?: { phone?: string; name?: string }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Faça login para continuar.' }

  const name =
    input?.name?.trim() ||
    (typeof user.user_metadata?.full_name === 'string' ? user.user_metadata.full_name : '') ||
    user.email?.split('@')[0] ||
    'Minha Loja'

  const { data, error } = await supabase.rpc('create_store_for_current_user', {
    p_name: name,
    p_phone: input?.phone?.trim() ?? '',
    p_email: user.email ?? null,
  })

  if (error) {
    return { error: error.message }
  }

  return { storeId: data as string }
}

export async function getMyStoreContact() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { user: null, store: null }

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
}
