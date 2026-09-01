import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { supabaseAnonKey, supabaseUrl } from '@/lib/supabase/env'

export function createServiceClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) return null
  return createSupabaseClient(supabaseUrl, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

export function createAnonServerClient() {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
