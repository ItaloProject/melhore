'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { requirePlatformAdmin, VIEW_STORE_COOKIE } from '@/lib/auth/platform'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/admin'

async function rpcOrThrow(fn: string, args: Record<string, unknown>) {
  const supabase = createClient()
  const { data, error } = await supabase.rpc(fn, args)
  if (!error) return data
  throw new Error(error.message)
}

export async function setStoreStatus(storeId: string, status: 'active' | 'inactive', notes?: string) {
  await requirePlatformAdmin()
  try {
    await rpcOrThrow('platform_set_store_status', {
      p_store_id: storeId,
      p_account_status: status,
      p_notes: notes ?? null,
    })
  } catch (error) {
    const service = createServiceClient()
    if (!service) return { error: error instanceof Error ? error.message : 'Falha ao atualizar status.' }
    const { error: updateError } = await service
      .from('stores')
      .update({ account_status: status, notes: notes || undefined, updated_at: new Date().toISOString() })
      .eq('id', storeId)
    if (updateError) return { error: updateError.message }
  }
  revalidatePath('/plataforma')
  revalidatePath(`/plataforma/lojas/${storeId}`)
  return { ok: true }
}

export async function recordStorePayment(formData: FormData) {
  await requirePlatformAdmin()
  const storeId = String(formData.get('storeId') ?? '')
  const amount = Number(formData.get('amount') ?? 0)
  const method = String(formData.get('method') ?? 'pix')
  const months = Number(formData.get('months') ?? 1)
  const notes = String(formData.get('notes') ?? '')
  if (!storeId || amount <= 0) throw new Error('Informe o valor pago.')

  try {
    await rpcOrThrow('platform_record_payment', {
      p_store_id: storeId,
      p_amount: amount,
      p_method: method,
      p_notes: notes || null,
      p_months: months,
    })
  } catch (error) {
    const service = createServiceClient()
    if (!service) throw error instanceof Error ? error : new Error('Falha ao registrar pagamento.')
    const periodEnd = new Date()
    periodEnd.setMonth(periodEnd.getMonth() + Math.max(months, 1))
    const grace = new Date(periodEnd)
    grace.setMonth(grace.getMonth() + 1)
    const { error: payError } = await service.from('store_payments').insert({
      store_id: storeId,
      amount,
      method,
      notes: notes || null,
      period_start: new Date().toISOString().slice(0, 10),
      period_end: periodEnd.toISOString().slice(0, 10),
    })
    if (payError) throw new Error(payError.message)
    await service.from('stores').update({
      billing_status: 'paid',
      account_status: 'active',
      last_payment_at: new Date().toISOString(),
      current_period_end: periodEnd.toISOString(),
      grace_until: grace.toISOString(),
    }).eq('id', storeId)
  }
  revalidatePath('/plataforma')
  revalidatePath('/plataforma/mensalidades')
  revalidatePath(`/plataforma/lojas/${storeId}`)
  redirect(`/plataforma/lojas/${storeId}`)
}

export async function updatePlatformStore(formData: FormData) {
  await requirePlatformAdmin()
  const storeId = String(formData.get('storeId') ?? '')
  const payload = {
    p_store_id: storeId,
    p_name: String(formData.get('name') ?? ''),
    p_phone: String(formData.get('phone') ?? ''),
    p_email: String(formData.get('email') ?? ''),
    p_city: String(formData.get('city') ?? ''),
    p_monthly_price: Number(formData.get('monthly_price') ?? 0),
    p_notes: String(formData.get('notes') ?? ''),
  }
  try {
    await rpcOrThrow('platform_update_store', payload)
  } catch (error) {
    const service = createServiceClient()
    if (!service) throw error instanceof Error ? error : new Error('Falha ao salvar.')
    const { error: updateError } = await service.from('stores').update({
      name: payload.p_name,
      phone: payload.p_phone,
      email: payload.p_email,
      city: payload.p_city,
      monthly_price: payload.p_monthly_price,
      notes: payload.p_notes,
      updated_at: new Date().toISOString(),
    }).eq('id', storeId)
    if (updateError) throw new Error(updateError.message)
  }
  revalidatePath(`/plataforma/lojas/${storeId}`)
  revalidatePath('/plataforma/lojas')
  redirect(`/plataforma/lojas/${storeId}`)
}

export async function markStoreUnpaid(formData: FormData) {
  await requirePlatformAdmin()
  const storeId = String(formData.get('storeId') ?? '')
  try {
    await rpcOrThrow('platform_mark_unpaid', { p_store_id: storeId })
  } catch (error) {
    const service = createServiceClient()
    if (!service) throw error instanceof Error ? error : new Error('Falha ao marcar atraso.')
    const grace = new Date()
    grace.setMonth(grace.getMonth() + 1)
    await service.from('stores').update({
      billing_status: 'past_due',
      grace_until: grace.toISOString(),
    }).eq('id', storeId)
  }
  revalidatePath('/plataforma')
  revalidatePath(`/plataforma/lojas/${storeId}`)
  redirect(`/plataforma/lojas/${storeId}`)
}

export async function openStorePanel(formData: FormData) {
  await requirePlatformAdmin()
  const storeId = String(formData.get('storeId') ?? '')
  if (!storeId) redirect('/plataforma/lojas')
  cookies().set(VIEW_STORE_COOKIE, storeId, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8,
  })
  redirect('/admin')
}

export async function clearStoreView() {
  cookies().delete(VIEW_STORE_COOKIE)
  redirect('/plataforma/lojas')
}

export async function downloadStoreBackup(storeId: string) {
  await requirePlatformAdmin()
  const supabase = createClient()
  const { data, error } = await supabase.rpc('platform_store_backup', { p_store_id: storeId })
  if (!error && data) return { ok: true as const, payload: data }

  const service = createServiceClient()
  if (!service) return { error: error?.message ?? 'Rode o SQL da plataforma para gerar backup.' }

  const [store, products, categories, inventory, sales, sessions, payments] = await Promise.all([
    service.from('stores').select('*').eq('id', storeId).maybeSingle(),
    service.from('products').select('*').eq('store_id', storeId),
    service.from('categories').select('*').eq('store_id', storeId),
    service.from('inventory').select('*').eq('store_id', storeId),
    service.from('sales').select('*').eq('store_id', storeId),
    service.from('cash_sessions').select('*').eq('store_id', storeId),
    service.from('store_payments').select('*').eq('store_id', storeId),
  ])

  return {
    ok: true as const,
    payload: {
      exported_at: new Date().toISOString(),
      store: store.data,
      products: products.data ?? [],
      categories: categories.data ?? [],
      inventory: inventory.data ?? [],
      sales: sales.data ?? [],
      cash_sessions: sessions.data ?? [],
      payments: payments.data ?? [],
    },
  }
}
