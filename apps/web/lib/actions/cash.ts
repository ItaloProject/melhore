'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireStore } from '@/lib/queries/store'

export async function openCashSession(openingBalance: number) {
  const { user, storeId } = await requireStore()
  const supabase = createClient()

  const { error } = await supabase.from('cash_sessions').insert({
    store_id: storeId,
    opened_by: user.id,
    opening_balance: openingBalance,
    status: 'open',
  })

  if (error) return { error: error.message }
  revalidatePath('/admin/caixa')
  return { ok: true }
}

export async function closeCashSession(sessionId: string, closingBalance: number) {
  const { user, storeId } = await requireStore()
  const supabase = createClient()

  const { error } = await supabase
    .from('cash_sessions')
    .update({
      status: 'closed',
      closed_by: user.id,
      closed_at: new Date().toISOString(),
      closing_balance: closingBalance,
    })
    .eq('id', sessionId)
    .eq('store_id', storeId)

  if (error) return { error: error.message }
  revalidatePath('/admin/caixa')
  return { ok: true }
}
