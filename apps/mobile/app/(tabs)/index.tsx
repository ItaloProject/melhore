import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const stats = [
  { label: 'Vendas hoje',    value: 'R$ 4.280',  color: '#16a34a' },
  { label: 'Pedidos online', value: '7 novos',   color: '#2563eb' },
  { label: 'Caixa aberto',  value: 'R$ 1.450',  color: '#7c3aed' },
  { label: 'Estoque crítico',value: '5 SKUs',    color: '#dc2626' },
]

const recentSales = [
  { name: 'Camisa Preta M', price: 'R$ 89,90', method: 'Pix',     time: '14:32' },
  { name: 'Calça Jeans 40', price: 'R$ 189,90',method: 'Crédito', time: '13:55' },
  { name: 'Blusa Branca G', price: 'R$ 79,90', method: 'Débito',  time: '12:10' },
]

export default function DashboardScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.subtitle}>Segunda, 1 de setembro</Text>

        {/* Stats grid */}
        <View style={styles.grid}>
          {stats.map((s) => (
            <View key={s.label} style={styles.statCard}>
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Recent */}
        <Text style={styles.sectionTitle}>Vendas Recentes</Text>
        <View style={styles.card}>
          {recentSales.map((sale, i) => (
            <View key={sale.name} style={[styles.saleRow, i < recentSales.length - 1 && styles.border]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.saleName}>{sale.name}</Text>
                <Text style={styles.saleMethod}>{sale.method} · {sale.time}</Text>
              </View>
              <Text style={styles.salePrice}>{sale.price}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#f9fafb' },
  scroll:       { padding: 16, gap: 16 },
  title:        { fontSize: 24, fontWeight: '700', color: '#111827' },
  subtitle:     { fontSize: 13, color: '#9ca3af', marginTop: 2 },
  grid:         { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard:     { flex: 1, minWidth: '45%', backgroundColor: '#fff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#e5e7eb' },
  statValue:    { fontSize: 20, fontWeight: '700' },
  statLabel:    { fontSize: 12, color: '#6b7280', marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#111827' },
  card:         { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', overflow: 'hidden' },
  saleRow:      { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 8 },
  border:       { borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  saleName:     { fontSize: 14, fontWeight: '500', color: '#111827' },
  saleMethod:   { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  salePrice:    { fontSize: 14, fontWeight: '700', color: '#111827' },
})
