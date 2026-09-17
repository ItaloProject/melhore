import { create } from 'zustand'
import { supabase } from './supabase'

interface SessionState {
  loading: boolean
  userId: string | null
  storeId: string | null
  storeName: string | null
  init: () => Promise<void>
  signOut: () => Promise<void>
}

export const useSession = create<SessionState>((set) => ({
  loading: true,
  userId: null,
  storeId: null,
  storeName: null,

  init: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      set({ loading: false, userId: null, storeId: null, storeName: null })
      return
    }

    const { data: membership } = await supabase
      .from('store_users')
      .select('store_id, stores(name)')
      .eq('user_id', session.user.id)
      .maybeSingle()

    set({
      loading: false,
      userId: session.user.id,
      storeId: membership?.store_id ?? null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      storeName: (membership as any)?.stores?.name ?? (membership as any)?.stores?.[0]?.name ?? null,
    })
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ userId: null, storeId: null, storeName: null })
  },
}))
