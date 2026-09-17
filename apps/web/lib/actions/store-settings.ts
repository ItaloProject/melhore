'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireStore } from '@/lib/queries/store'

export interface StoreSettingsInput {
  name: string
  slug: string
  phone?: string
  whatsapp?: string
  email?: string
  instagram?: string
  address?: string
  city?: string
  state?: string
  primaryColor?: string
  logoUrl?: string
}

export async function updateStoreSettings(input: StoreSettingsInput) {
  const { storeId } = await requireStore()
  const supabase = createClient()

  const slug = input.slug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '')
  if (!slug) return { error: 'Slug inválido.' }

  const { error } = await supabase
    .from('stores')
    .update({
      name: input.name.trim(),
      slug,
      phone: input.phone?.trim() || null,
      whatsapp: input.whatsapp?.trim() || null,
      email: input.email?.trim() || null,
      instagram: input.instagram?.trim().replace(/^@/, '') || null,
      address: input.address?.trim() || null,
      city: input.city?.trim() || null,
      state: input.state?.trim() || null,
      primary_color: input.primaryColor || undefined,
      logo_url: input.logoUrl || undefined,
    })
    .eq('id', storeId)

  if (error) {
    if (error.message.includes('duplicate') || error.code === '23505') {
      return { error: 'Esse endereço (slug) já está em uso por outra loja.' }
    }
    return { error: error.message }
  }

  revalidatePath('/admin/config')
  revalidatePath(`/${slug}`)
  return { ok: true, slug }
}
