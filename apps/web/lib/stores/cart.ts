import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  variantId: string
  productId: string
  productName: string
  variantLabel: string
  price: number
  image: string | null
  qty: number
  maxQty: number
}

interface CartState {
  storeSlug: string | null
  items: CartItem[]
  addItem: (storeSlug: string, item: Omit<CartItem, 'qty'>, qty: number) => void
  updateQty: (variantId: string, qty: number) => void
  removeItem: (variantId: string) => void
  clear: () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      storeSlug: null,
      items: [],

      addItem: (storeSlug, item, qty) =>
        set((state) => {
          const items = state.storeSlug && state.storeSlug !== storeSlug ? [] : state.items
          const existing = items.find((i) => i.variantId === item.variantId)
          const nextItems = existing
            ? items.map((i) =>
                i.variantId === item.variantId
                  ? { ...i, qty: Math.min(i.qty + qty, i.maxQty) }
                  : i
              )
            : [...items, { ...item, qty: Math.min(qty, item.maxQty) }]
          return { storeSlug, items: nextItems }
        }),

      updateQty: (variantId, qty) =>
        set((state) => ({
          items:
            qty <= 0
              ? state.items.filter((i) => i.variantId !== variantId)
              : state.items.map((i) =>
                  i.variantId === variantId ? { ...i, qty: Math.min(qty, i.maxQty) } : i
                ),
        })),

      removeItem: (variantId) =>
        set((state) => ({ items: state.items.filter((i) => i.variantId !== variantId) })),

      clear: () => set({ items: [], storeSlug: null }),
    }),
    { name: 'melhore-cart' }
  )
)
