import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem } from '@melhore/types'

interface CartStore {
  items: CartItem[]
  storeSlug: string | null
  add: (item: CartItem) => void
  remove: (variantId: string) => void
  update: (variantId: string, quantity: number) => void
  clear: () => void
  total: () => number
  count: () => number
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      storeSlug: null,

      add: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.variant_id === item.variant_id)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.variant_id === item.variant_id
                  ? { ...i, quantity: Math.min(i.quantity + item.quantity, i.available) }
                  : i
              ),
            }
          }
          return { items: [...state.items, item], storeSlug: item.product_id }
        }),

      remove: (variantId) =>
        set((state) => ({ items: state.items.filter((i) => i.variant_id !== variantId) })),

      update: (variantId, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.variant_id !== variantId)
              : state.items.map((i) =>
                  i.variant_id === variantId ? { ...i, quantity } : i
                ),
        })),

      clear: () => set({ items: [], storeSlug: null }),

      total: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

      count: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: 'melhore-cart' }
  )
)
