import { useCallback, useState } from 'react'
import { View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useFocusEffect } from 'expo-router'
import { Search, Minus, Plus } from 'lucide-react-native'
import { supabase } from '@/lib/supabase'
import { useSession } from '@/lib/session-store'

interface InventoryRow {
  invId: string
  variantId: string
  product: string
  size: string | null
  color: string | null
  qty: number
  reserved: number
  min: number
}

function stockColor(available: number, min: number) {
  if (available <= 0) return '#dc2626'
  if (available <= min) return '#d97706'
  return '#16a34a'
}

export default function EstoqueScreen() {
  const { storeId } = useSession()
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [items, setItems] = useState<InventoryRow[]>([])

  const load = useCallback(async () => {
    if (!storeId) return
    const { data } = await supabase
      .from('products')
      .select('name, product_variants(id, size, color, inventory(id, quantity, reserved, min_quantity))')
      .eq('store_id', storeId)
      .eq('active', true)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows: InventoryRow[] = (data ?? []).flatMap((p: any) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (p.product_variants ?? []).map((v: any) => {
        const inv = Array.isArray(v.inventory) ? v.inventory[0] : v.inventory
        return {
          invId: inv?.id,
          variantId: v.id,
          product: p.name,
          size: v.size,
          color: v.color,
          qty: inv?.quantity ?? 0,
          reserved: inv?.reserved ?? 0,
          min: inv?.min_quantity ?? 3,
        }
      }).filter((r: InventoryRow) => !!r.invId)
    )
    setItems(rows)
    setLoading(false)
  }, [storeId])

  useFocusEffect(useCallback(() => { load() }, [load]))

  const adjust = async (row: InventoryRow, delta: number) => {
    const newQty = Math.max(0, row.qty + delta)
    setItems((prev) => prev.map((r) => (r.invId === row.invId ? { ...r, qty: newQty } : r)))

    await supabase.from('inventory').update({ quantity: newQty }).eq('id', row.invId)
    await supabase.from('inventory_movements').insert({
      store_id: storeId,
      variant_id: row.variantId,
      type: 'adjustment',
      quantity: delta,
    })
  }

  const filtered = items.filter((i) =>
    `${i.product} ${i.size ?? ''} ${i.color ?? ''}`.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator color="#7c3aed" />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Estoque</Text>
        <View style={styles.searchBox}>
          <Search size={16} color="#9ca3af" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar produto, tamanho ou cor..."
            placeholderTextColor="#9ca3af"
            style={styles.searchInput}
          />
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(r) => r.invId}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>Nenhum item encontrado.</Text>}
        renderItem={({ item }) => {
          const available = item.qty - item.reserved
          return (
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.product}>{item.product}</Text>
                <Text style={styles.variant}>{[item.size, item.color].filter(Boolean).join(' · ') || 'Único'}</Text>
              </View>
              <Text style={[styles.qty, { color: stockColor(available, item.min) }]}>{available}</Text>
              <View style={styles.controls}>
                <TouchableOpacity style={styles.btn} onPress={() => adjust(item, -1)}>
                  <Minus size={14} color="#7c3aed" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.btn} onPress={() => adjust(item, 1)}>
                  <Plus size={14} color="#7c3aed" />
                </TouchableOpacity>
              </View>
            </View>
          )
        }}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#f9fafb' },
  center:      { alignItems: 'center', justifyContent: 'center' },
  header:      { padding: 16, gap: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  title:       { fontSize: 22, fontWeight: '700', color: '#111827' },
  searchBox:   { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#f3f4f6', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9 },
  searchInput: { flex: 1, fontSize: 14, color: '#111827' },
  list:        { padding: 16, gap: 8 },
  empty:       { textAlign: 'center', color: '#9ca3af', fontSize: 13, marginTop: 24 },
  row:         { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', padding: 12, gap: 10 },
  product:     { fontSize: 14, fontWeight: '600', color: '#111827' },
  variant:     { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  qty:         { fontSize: 16, fontWeight: '700', minWidth: 28, textAlign: 'center' },
  controls:    { flexDirection: 'row', gap: 6 },
  btn:         { width: 28, height: 28, borderRadius: 8, backgroundColor: '#f3e8ff', alignItems: 'center', justifyContent: 'center' },
})
