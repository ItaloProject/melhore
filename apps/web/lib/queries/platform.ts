import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/admin'

export type PlatformStoreRow = {
  id: string
  name: string
  slug: string
  phone: string | null
  email: string | null
  city: string | null
  account_status: 'active' | 'inactive'
  billing_status: 'trial' | 'paid' | 'past_due' | 'unpaid'
  plan: string
  monthly_price: number
  trial_ends_at: string | null
  current_period_end: string | null
  last_payment_at: string | null
  grace_until: string | null
  notes: string | null
  created_at: string
  owner_email: string | null
  products_count: number
  sales_count: number
}

export type PlatformStats = {
  stores_total: number
  stores_active: number
  stores_inactive: number
  billing_paid: number
  billing_trial: number
  billing_late: number
  users_total: number
  cash_open: number
  products_total: number
  sales_month: number
}

export type PlatformPayment = {
  id: string
  store_id: string
  amount: number
  paid_at: string
  period_start: string | null
  period_end: string | null
  method: string
  notes: string | null
}

function emptyStats(): PlatformStats {
  return {
    stores_total: 0,
    stores_active: 0,
    stores_inactive: 0,
    billing_paid: 0,
    billing_trial: 0,
    billing_late: 0,
    users_total: 0,
    cash_open: 0,
    products_total: 0,
    sales_month: 0,
  }
}

export async function getPlatformStats(): Promise<{ stats: PlatformStats; setupRequired: boolean }> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('platform_dashboard_stats')
  if (!error && data) {
    return { stats: { ...emptyStats(), ...(data as PlatformStats) }, setupRequired: false }
  }

  const service = createServiceClient()
  if (!service) return { stats: emptyStats(), setupRequired: true }

  try {
    const [stores, users, cash, products, sales] = await Promise.all([
      service.from('stores').select('account_status, billing_status'),
      service.from('store_users').select('id', { count: 'exact', head: true }),
      service.from('cash_sessions').select('id', { count: 'exact', head: true }).eq('status', 'open'),
      service.from('products').select('id', { count: 'exact', head: true }),
      service.from('sales').select('total').gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
    ])

    if (stores.error) return { stats: emptyStats(), setupRequired: true }

    const rows = stores.data ?? []
    return {
      setupRequired: false,
      stats: {
        stores_total: rows.length,
        stores_active: rows.filter((s) => s.account_status === 'active').length,
        stores_inactive: rows.filter((s) => s.account_status === 'inactive').length,
        billing_paid: rows.filter((s) => s.billing_status === 'paid').length,
        billing_trial: rows.filter((s) => s.billing_status === 'trial').length,
        billing_late: rows.filter((s) => s.billing_status === 'past_due' || s.billing_status === 'unpaid').length,
        users_total: users.count ?? 0,
        cash_open: cash.count ?? 0,
        products_total: products.count ?? 0,
        sales_month: (sales.data ?? []).reduce((sum, row) => sum + Number(row.total ?? 0), 0),
      },
    }
  } catch {
    return { stats: emptyStats(), setupRequired: true }
  }
}

export async function getPlatformStores(): Promise<PlatformStoreRow[]> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('platform_list_stores')
  if (!error && Array.isArray(data)) {
    return (data as PlatformStoreRow[]).map(normalizeStore)
  }

  const service = createServiceClient()
  if (!service) return []

  const { data: stores, error: storesError } = await service
    .from('stores')
    .select('id, name, slug, phone, email, city, account_status, billing_status, plan, monthly_price, trial_ends_at, current_period_end, last_payment_at, grace_until, notes, created_at')
    .order('created_at', { ascending: false })

  if (storesError || !stores) return []

  const ids = stores.map((s) => s.id)
  const { data: members } = await service
    .from('store_users')
    .select('store_id, user_id, role')
    .in('store_id', ids)
    .eq('role', 'owner')

  const ownerIds = [...new Set((members ?? []).map((m) => m.user_id))]
  const emails = new Map<string, string>()
  if (ownerIds.length) {
    const { data: users } = await service.auth.admin.listUsers({ perPage: 1000 })
    for (const user of users.users) {
      if (user.email) emails.set(user.id, user.email)
    }
  }

  return stores.map((store) => {
    const owner = (members ?? []).find((m) => m.store_id === store.id)
    return normalizeStore({
      ...store,
      owner_email: owner ? emails.get(owner.user_id) ?? null : null,
      products_count: 0,
      sales_count: 0,
    })
  })
}

export async function getPlatformStore(id: string) {
  const stores = await getPlatformStores()
  return stores.find((store) => store.id === id) ?? null
}

export async function getStorePayments(storeId: string): Promise<PlatformPayment[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('store_payments')
    .select('id, store_id, amount, paid_at, period_start, period_end, method, notes')
    .eq('store_id', storeId)
    .order('paid_at', { ascending: false })

  if (!error && data) {
    return data.map((row) => ({
      ...row,
      amount: Number(row.amount),
    }))
  }

  const service = createServiceClient()
  if (!service) return []
  const res = await service
    .from('store_payments')
    .select('id, store_id, amount, paid_at, period_start, period_end, method, notes')
    .eq('store_id', storeId)
    .order('paid_at', { ascending: false })
  return (res.data ?? []).map((row) => ({ ...row, amount: Number(row.amount) }))
}

function normalizeStore(row: Record<string, unknown>): PlatformStoreRow {
  return {
    id: String(row.id),
    name: String(row.name ?? ''),
    slug: String(row.slug ?? ''),
    phone: (row.phone as string) ?? null,
    email: (row.email as string) ?? null,
    city: (row.city as string) ?? null,
    account_status: row.account_status === 'inactive' ? 'inactive' : 'active',
    billing_status: (['trial', 'paid', 'past_due', 'unpaid'].includes(String(row.billing_status))
      ? row.billing_status
      : 'trial') as PlatformStoreRow['billing_status'],
    plan: String(row.plan ?? 'mensal'),
    monthly_price: Number(row.monthly_price ?? 97),
    trial_ends_at: (row.trial_ends_at as string) ?? null,
    current_period_end: (row.current_period_end as string) ?? null,
    last_payment_at: (row.last_payment_at as string) ?? null,
    grace_until: (row.grace_until as string) ?? null,
    notes: (row.notes as string) ?? null,
    created_at: String(row.created_at ?? ''),
    owner_email: (row.owner_email as string) ?? null,
    products_count: Number(row.products_count ?? 0),
    sales_count: Number(row.sales_count ?? 0),
  }
}
