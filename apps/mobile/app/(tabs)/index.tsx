import { useCallback, useState } from 'react'
import { View, Text, ScrollView, StyleSheet, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useFocusEffect } from 'expo-router'
import { LogOut } from 'lucide-react-native'
import { supabase } from '@/lib/supabase'
import { useSession } from '@/lib/session-store'

interface RecentSale {
  id: string
  total: number
  payment_method: string
  created_at: string
  label: string
}

const methodLabel: Record<string, string> = {
  cash: 'Dinheiro', credit: 'Crédito', debit: 'Débito', pix: 'Pix', other: 'Outro',
}

function formatCurrency(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function DashboardScreen() {
  const { storeId, storeName, signOut } = useSession()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [salesToday, setSalesToday] = useState(0)
  const [salesCount, setSalesCount] = useState(0)
  const [cashOpen, setCashOpen] = useState<{ balance: number } | null>(null)
  const [lowStock, setLowStock] = useState(0)
  const [recent, setRecent] = useState<RecentSale[]>([])

  const load = useCallback(async () => {
    if (!storeId) return
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const [salesRes, sessionRes, invRes, recentRes] = await Promise.all([
      supabase.from('sales').select('total').eq('store_id', storeId).gte('created_at', todayStart.toISOString()),
      supabase.from('cash_sessions').select('opening_balance').eq('store_id', storeId).eq('status', 'open').maybeSingle(),
      supabase.from('inventory').select('quantity, reserved, min_quantity').eq('store_id', storeId),
      supabase
        .from('sales')
        .select('id, total, payment_method, created_at, sale_items(product_name, variant_label)')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false })
        .limit(5),
    ])

    const sales = salesRes.data ?? []
    setSalesToday(sales.reduce((s, r) => s + Number(r.total), 0))
    setSalesCount(sales.length)

    setCashOpen(sessionRes.data ? { balance: Number(sessionRes.data.opening_balance) } : null)

    const inv = invRes.data ?? []
    setLowStock(inv.filter((i) => i.quantity - i.reserved <= i.min_quantity).length)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recentSales: RecentSale[] = (recentRes.data ?? []).map((s: any) => {
      const items = s.sale_items ?? []
      const label = items[0]
        ? items[0].product_name + (items.length > 1 ? ` +${items.length - 1}` : '')
        : 'Venda'
      return { id: s.id, total: Number(s.total), payment_method: s.payment_method, created_at: s.created_at, label }
    })
    setRecent(recentSales)
    setLoading(false)
    setRefreshing(false)
  }, [storeId])

  useFocusEffect(
    useCallback(() => {
      load()
    }, [load])
  )

  const onRefresh = () => {
    setRefreshing(true)
    load()
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator color="#7c3aed" />
      </SafeAreaView>
    )
  }

  const stats = [
    { label: 'Vendas hoje', value: formatCurrency(salesToday), color: '#16a34a' },
    { label: `${salesCount} venda${salesCount === 1 ? '' : 's'}`, value: 'hoje', color: '#2563eb' },
    { label: 'Caixa', value: cashOpen ? formatCurrency(cashOpen.balance) : 'Fechado', color: cashOpen ? '#7c3aed' : '#9ca3af' },
    { label: 'Estoque crítico', value: `${lowStock} SKU${lowStock === 1 ? '' : 's'}`, color: lowStock > 0 ? '#dc2626' : '#16a34a' },
  ]

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7c3aed" />}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Dashboard</Text>
            <Text style={styles.subtitle}>{storeName ?? 'Sua loja'}</Text>
          </View>
          <TouchableOpacity onPress={signOut} style={styles.logoutBtn}>
            <LogOut size={18} color="#6b7280" />
          </TouchableOpacity>
        </View>

        <View style={styles.grid}>
          {stats.map((s) => (
            <View key={s.label} style={styles.statCard}>
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Vendas Recentes</Text>
        <View style={styles.card}>
          {recent.length === 0 ? (
            <Text style={styles.empty}>Nenhuma venda ainda.</Text>
          ) : (
            recent.map((sale, i) => (
              <View key={sale.id} style={[styles.saleRow, i < recent.length - 1 && styles.border]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.saleName}>{sale.label}</Text>
                  <Text style={styles.saleMethod}>
                    {methodLabel[sale.payment_method] ?? sale.payment_method} ·{' '}
                    {new Date(sale.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
                <Text style={styles.salePrice}>{formatCurrency(sale.total)}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#f9fafb' },
  center:       { alignItems: 'center', justifyContent: 'center' },
  scroll:       { padding: 16, gap: 16 },
  headerRow:    { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  title:        { fontSize: 24, fontWeight: '700', color: '#111827' },
  subtitle:     { fontSize: 13, color: '#9ca3af', marginTop: 2 },
  logoutBtn:    { width: 34, height: 34, borderRadius: 17, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center' },
  grid:         { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard:     { flex: 1, minWidth: '45%', backgroundColor: '#fff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#e5e7eb' },
  statValue:    { fontSize: 20, fontWeight: '700' },
  statLabel:    { fontSize: 12, color: '#6b7280', marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#111827' },
  card:         { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', overflow: 'hidden' },
  empty:        { padding: 16, fontSize: 13, color: '#9ca3af', textAlign: 'center' },
  saleRow:      { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 8 },
  border:       { borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  saleName:     { fontSize: 14, fontWeight: '500', color: '#111827' },
  saleMethod:   { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  salePrice:    { fontSize: 14, fontWeight: '700', color: '#111827' },
})
