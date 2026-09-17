'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireStore } from '@/lib/queries/store'

export interface ProductVariantInput {
  id?: string
  size?: string
  color?: string
  colorHex?: string
  priceOverride?: number
  quantity: number
  minQuantity: number
}

export interface SaveProductInput {
  productId?: string
  name: string
  description?: string
  categoryName?: string
  price: number
  comparePrice?: number
  images: string[]
  active: boolean
  variants: ProductVariantInput[]
}

export async function saveProduct(input: SaveProductInput) {
  const { storeId } = await requireStore()
  const supabase = createClient()

  const variants = input.variants.length > 0 ? input.variants : [{ quantity: 0, minQuantity: 3 }]

  const { data, error } = await supabase.rpc('upsert_product', {
    p_store_id: storeId,
    p_product_id: input.productId ?? null,
    p_name: input.name,
    p_description: input.description ?? null,
    p_category_name: input.categoryName ?? null,
    p_price: input.price,
    p_compare_price: input.comparePrice ?? null,
    p_images: input.images,
    p_active: input.active,
    p_variants: variants.map((v) => ({
      id: v.id ?? null,
      size: v.size ?? null,
      color: v.color ?? null,
      color_hex: v.colorHex ?? null,
      price_override: v.priceOverride ?? null,
      quantity: v.quantity,
      min_quantity: v.minQuantity,
    })),
  })

  if (error) return { error: error.message }

  revalidatePath('/admin/produtos')
  return { ok: true, productId: data as string }
}
