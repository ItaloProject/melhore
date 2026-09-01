'use server'

import { createClient } from '@/lib/supabase/server'
import { requireStore } from '@/lib/queries/store'

interface SaleItem {
  variant_id: string
  qty: number
  unit_price: number
  product_name: string
  variant_label: string
}

export async function makeSale(
  sessionId: string,
  paymentMethod: string,
  discount: number,
  items: SaleItem[]
): Promise<{ saleId: string } | { error: string }> {
  try {
    const { user, storeId } = await requireStore()
    const supabase = createClient()

    const { data, error } = await supabase.rpc('make_sale', {
      p_store_id:   storeId,
      p_session_id: sessionId,
      p_seller_id:  user.id,
      p_payment:    paymentMethod,
      p_discount:   discount,
      p_items:      items,
    })

    if (error) return { error: error.message }
    return { saleId: data as string }
  } catch {
    return { error: 'Erro ao finalizar venda' }
  }
}

export async function getOpenSession(): Promise<string | null> {
  try {
    const { storeId } = await requireStore()
    const supabase = createClient()

    const { data } = await supabase
      .from('cash_sessions')
      .select('id')
      .eq('store_id', storeId)
      .eq('status', 'open')
      .order('opened_at', { ascending: false })
      .limit(1)
      .single()

    return data?.id ?? null
  } catch {
    return null
  }
}
