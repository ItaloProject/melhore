import { createBrowserClient } from '@supabase/ssr'
import { supabaseAnonKey, supabaseUrl } from '@/lib/supabase/env'

export const createClient = () => createBrowserClient(supabaseUrl, supabaseAnonKey)
