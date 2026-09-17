import { useCallback, useState } from 'react'
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useFocusEffect } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { useSession } from '@/lib/session-store'

const methodLabel: Record<string, string> = {
  cash: 'Dinheiro', credit: 'Crédito', debit: 'Débito', pix: 'Pix', other: 'Outro',
}

function formatCurrency(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function RelatoriosScreen() {
  const { storeId } = useSession()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [revenue, setRevenue] = useState(0)
  const [count, setCount] = useState(0)
  const [byMethod, setByMethod] = useState<{ method: string; total: number }[]>([])

  const load = useCallback(async () => {
    if (!storeId) return
    const since = new Date()
    since.setDate(since.getDate() - 30)

    const { data } = await supabase
      .from('sales')
      .select('total, payment_method')
      .eq('store_id', storeId)
      .gte('created_at', since.toISOString())

    const sales = data ?? []
    setRevenue(sales.reduce((s, r) => s + Number(r.total), 0))
    setCount(sales.length)

    const grouped = new Map<string, number>()
    sales.forEach((s) => grouped.set(s.payment_method, (grouped.get(s.payment_method) ?? 0) + Number(s.total)))
    setByMethod(
      Array.from(grouped.entries())
        .map(([method, total]) => ({ method, total }))
        .sort((a, b) => b.total - a.total)
    )

    setLoading(false)
    setRefreshing(false)
  }, [storeId])

  useFocusEffect(useCallback(() => { load() }, [load]))

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator color="#7c3aed" />
      </SafeAreaView>
    )
  }

  const avgTicket = count > 0 ? revenue / count : 0
  const maxTotal = byMethod[0]?.total ?? 1

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load() }} tintColor="#7c3aed" />}
      >
        <Text style={styles.title}>Relatórios</Text>
        <Text style={styles.subtitle}>Últimos 30 dias</Text>

        <View style={styles.grid}>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#16a34a' }]}>{formatCurrency(revenue)}</Text>
            <Text style={styles.statLabel}>Faturamento</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#2563eb' }]}>{count}</Text>
            <Text style={styles.statLabel}>Vendas</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#7c3aed' }]}>{formatCurrency(avgTicket)}</Text>
            <Text style={styles.statLabel}>Ticket médio</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Por forma de pagamento</Text>
        <View style={styles.card}>
          {byMethod.length === 0 ? (
            <Text style={styles.empty}>Nenhuma venda no período.</Text>
          ) : (
            byMethod.map((m) => (
              <View key={m.method} style={styles.methodRow}>
                <View style={styles.methodHeader}>
                  <Text style={styles.methodLabel}>{methodLabel[m.method] ?? m.method}</Text>
                  <Text style={styles.methodValue}>{formatCurrency(m.total)}</Text>
                </View>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { width: `${Math.round((m.total / maxTotal) * 100)}%` }]} />
                </View>
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
  title:        { fontSize: 24, fontWeight: '700', color: '#111827' },
  subtitle:     { fontSize: 13, color: '#9ca3af', marginTop: 2 },
  grid:         { flexDirection: 'row', gap: 10 },
  statCard:     { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#e5e7eb' },
  statValue:    { fontSize: 16, fontWeight: '700' },
  statLabel:    { fontSize: 11, color: '#6b7280', marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#111827' },
  card:         { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', padding: 14, gap: 14 },
  empty:        { fontSize: 13, color: '#9ca3af', textAlign: 'center', paddingVertical: 8 },
  methodRow:    { gap: 6 },
  methodHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  methodLabel:  { fontSize: 13, fontWeight: '600', color: '#111827' },
  methodValue:  { fontSize: 13, fontWeight: '700', color: '#111827' },
  barTrack:     { height: 6, backgroundColor: '#f3f4f6', borderRadius: 999, overflow: 'hidden' },
  barFill:      { height: '100%', backgroundColor: '#7c3aed', borderRadius: 999 },
})
