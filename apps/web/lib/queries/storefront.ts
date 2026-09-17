import { createClient } from '@/lib/supabase/server'

export interface StorefrontStore {
  id: string
  slug: string
  name: string
  logo_url: string | null
  banner_url: string | null
  primary_color: string
  phone: string | null
  whatsapp: string | null
  address: string | null
  city: string | null
  state: string | null
  instagram: string | null
}

export async function getStoreBySlug(slug: string): Promise<StorefrontStore | null> {
  const supabase = createClient()
  const { data } = await supabase
    .from('stores')
    .select('id, slug, name, logo_url, banner_url, primary_color, phone, whatsapp, address, city, state, instagram')
    .eq('slug', slug)
    .maybeSingle()
  return data
}

export interface StorefrontProduct {
  id: string
  name: string
  price: number
  comparePrice: number | null
  images: string[]
  category: string | null
  stock: number
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function availableQty(inv: any): number {
  const row = Array.isArray(inv) ? inv[0] : inv
  return Math.max(0, (row?.quantity ?? 0) - (row?.reserved ?? 0))
}

export async function getStorefrontProducts(storeId: string): Promise<StorefrontProduct[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('products')
    .select(`
      id, name, price, compare_price, images,
      categories(name),
      product_variants(id, inventory(quantity, reserved))
    `)
    .eq('store_id', storeId)
    .eq('active', true)
    .order('created_at', { ascending: false })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((p: any) => {
    const variants = p.product_variants ?? []
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stock = variants.reduce((s: number, v: any) => s + availableQty(v.inventory), 0)
    return {
      id: p.id,
      name: p.name,
      price: Number(p.price),
      comparePrice: p.compare_price != null ? Number(p.compare_price) : null,
      images: p.images ?? [],
      category: p.categories?.name ?? p.categories?.[0]?.name ?? null,
      stock,
    }
  })
}

export interface StorefrontVariant {
  id: string
  size: string | null
  color: string | null
  colorHex: string | null
  price: number
  available: number
}

export interface StorefrontProductDetail {
  id: string
  name: string
  description: string | null
  images: string[]
  category: string | null
  variants: StorefrontVariant[]
}

export async function getStorefrontProduct(storeId: string, productId: string): Promise<StorefrontProductDetail | null> {
  const supabase = createClient()
  const { data } = await supabase
    .from('products')
    .select(`
      id, name, description, price, images,
      categories(name),
      product_variants(id, size, color, color_hex, price_override, inventory(quantity, reserved))
    `)
    .eq('store_id', storeId)
    .eq('id', productId)
    .eq('active', true)
    .maybeSingle()

  if (!data) return null

  const basePrice = Number(data.price)
  const variants: StorefrontVariant[] = (data.product_variants ?? []).map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (v: any) => ({
      id: v.id,
      size: v.size,
      color: v.color,
      colorHex: v.color_hex,
      price: v.price_override != null ? Number(v.price_override) : basePrice,
      available: availableQty(v.inventory),
    })
  )

  return {
    id: data.id,
    name: data.name,
    description: data.description,
    images: data.images ?? [],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    category: (data.categories as any)?.name ?? (data.categories as any)?.[0]?.name ?? null,
    variants,
  }
}
