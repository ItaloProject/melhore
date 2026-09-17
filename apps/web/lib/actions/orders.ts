'use server'

import { createClient } from '@/lib/supabase/server'

export interface PlaceOrderItem {
  variantId: string
  productName: string
  variantLabel: string
  quantity: number
  unitPrice: number
}

export interface PlaceOrderInput {
  storeSlug: string
  customerName: string
  customerEmail?: string
  customerPhone: string
  notes?: string
  items: PlaceOrderItem[]
}

export async function placeOrder(input: PlaceOrderInput): Promise<{ orderId?: string; error?: string }> {
  const supabase = createClient()

  const { data, error } = await supabase.rpc('place_order', {
    p_store_slug: input.storeSlug,
    p_customer_name: input.customerName,
    p_customer_email: input.customerEmail || null,
    p_customer_phone: input.customerPhone,
    p_type: 'reservation',
    p_notes: input.notes || null,
    p_items: input.items.map((i) => ({
      variant_id: i.variantId,
      product_name: i.productName,
      variant_label: i.variantLabel,
      quantity: i.quantity,
      unit_price: i.unitPrice,
    })),
  })

  if (error) return { error: error.message }
  return { orderId: data as string }
}
