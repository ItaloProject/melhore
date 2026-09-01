// ─── Store / Tenant ──────────────────────────────────────────────────────────

export interface Store {
  id: string
  slug: string
  name: string
  logo_url: string | null
  banner_url: string | null
  primary_color: string
  phone: string | null
  whatsapp: string | null
  email: string | null
  address: string | null
  city: string | null
  state: string | null
  instagram: string | null
  created_at: string
}

// ─── Users ────────────────────────────────────────────────────────────────────

export type StoreRole = 'owner' | 'manager' | 'cashier' | 'viewer'

export interface StoreUser {
  id: string
  store_id: string
  user_id: string
  role: StoreRole
  name: string
  email: string
  created_at: string
}

// ─── Products ─────────────────────────────────────────────────────────────────

export interface Category {
  id: string
  store_id: string
  name: string
  slug: string
  position: number
}

export interface Product {
  id: string
  store_id: string
  category_id: string | null
  name: string
  description: string | null
  sku: string | null
  price: number
  compare_price: number | null
  images: string[]
  active: boolean
  featured: boolean
  created_at: string
  category?: Category
  variants?: ProductVariant[]
}

export interface ProductVariant {
  id: string
  product_id: string
  size: string | null
  color: string | null
  color_hex: string | null
  sku: string | null
  price_override: number | null
  inventory?: Inventory
}

// ─── Inventory ────────────────────────────────────────────────────────────────

export interface Inventory {
  id: string
  store_id: string
  variant_id: string
  quantity: number
  reserved: number
  min_quantity: number
  updated_at: string
}

export interface InventoryMovement {
  id: string
  store_id: string
  variant_id: string
  type: 'sale' | 'return' | 'adjustment' | 'reservation' | 'release'
  quantity: number
  note: string | null
  reference_id: string | null
  created_at: string
  created_by: string | null
}

// ─── Orders (online) ─────────────────────────────────────────────────────────

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'reserved'
  | 'shipped'
  | 'delivered'
  | 'cancelled'

export interface Order {
  id: string
  store_id: string
  customer_name: string
  customer_email: string | null
  customer_phone: string | null
  status: OrderStatus
  type: 'purchase' | 'reservation'
  subtotal: number
  total: number
  notes: string | null
  created_at: string
  items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  variant_id: string
  product_name: string
  variant_label: string
  quantity: number
  unit_price: number
  total: number
  variant?: ProductVariant & { product?: Product }
}

// ─── PDV / Caixa ─────────────────────────────────────────────────────────────

export type PaymentMethod = 'cash' | 'credit' | 'debit' | 'pix' | 'other'

export interface CashSession {
  id: string
  store_id: string
  opened_by: string
  closed_by: string | null
  opening_balance: number
  closing_balance: number | null
  opened_at: string
  closed_at: string | null
  status: 'open' | 'closed'
}

export interface Sale {
  id: string
  store_id: string
  session_id: string
  seller_id: string | null
  payment_method: PaymentMethod
  subtotal: number
  discount: number
  total: number
  created_at: string
  items?: SaleItem[]
}

export interface SaleItem {
  id: string
  sale_id: string
  variant_id: string
  product_name: string
  variant_label: string
  quantity: number
  unit_price: number
  total: number
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface DashboardStats {
  sales_today: number
  revenue_today: number
  orders_pending: number
  low_stock_count: number
  revenue_week: number
  top_products: { name: string; sold: number; revenue: number }[]
}

// ─── Cart (client-side) ───────────────────────────────────────────────────────

export interface CartItem {
  variant_id: string
  product_id: string
  product_name: string
  variant_label: string
  image: string | null
  price: number
  quantity: number
  available: number
}
