import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function requireStore() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: storeUser } = await supabase
    .from('store_users')
    .select('store_id, role')
    .eq('user_id', user.id)
    .single()

  if (!storeUser) redirect('/login')

  return { user, storeId: storeUser.store_id as string, role: storeUser.role as string }
}
