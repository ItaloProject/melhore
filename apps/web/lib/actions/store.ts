'use server'

import { createClient } from '@/lib/supabase/server'
import { getSessionUser } from '@/lib/auth/session'

export async function ensureStore(input?: { phone?: string; name?: string }) {
  const user = await getSessionUser()
  if (!user) return { error: 'Faça login para continuar.' }

  const supabase = createClient()

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
