'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function logout() {
  const supabase = createClient()
  await supabase.auth.signOut()
  cookies().delete('platform_pin_ok')
  redirect('/login')
}
