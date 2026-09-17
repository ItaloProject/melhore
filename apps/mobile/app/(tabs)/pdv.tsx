import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useFocusEffect } from 'expo-router'
import { useCallback } from 'react'
import { Search, Trash2, CheckCircle } from 'lucide-react-native'
import { supabase } from '@/lib/supabase'
import { useSession } from '@/lib/session-store'

interface SearchResult {
  variantId: string
  name: string
  variant: string
  price: number
  stock: number
}

interface CartLine {
  id: string
  name: string
  variant: string
  price: number
  qty: number
}

const paymentMethods: { id: string; label: string }[] = [
  { id: 'pix', label: 'Pix' },
  { id: 'cash', label: 'Dinheiro' },
  { id: 'debit', label: 'Débito' },
  { id: 'credit', label: 'Crédito' },
]

function formatCurrency(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function PdvScreen() {
  const { storeId, userId } = useSession()
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [cart, setCart] = useState<CartLine[]>([])
  const [payment, setPayment] = useState('pix')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useFocusEffect(
    useCallback(() => {
      if (!storeId) return
      supabase
        .from('cash_sessions')
        .select('id')
        .eq('store_id', storeId)
        .eq('status', 'open')
        .maybeSingle()
        .then(({ data }) => setSessionId(data?.id ?? null))
    }, [storeId])
  )

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0)

  const searchProducts = async (q: string) => {
    setSearch(q)
    if (q.length < 2) { setResults([]); return }
    setSearching(true)
    const { data } = await supabase
      .from('product_variants')
      .select(`
        id, size, color, price_override,
        products!inner(name, price, store_id, active),
        inventory(quantity, reserved)
      `)
      .eq('products.store_id', storeId)
      .eq('products.active', true)
      .or(`products.name.ilike.%${q}%,size.ilike.%${q}%,color.ilike.%${q}%`)
      .limit(8)

    setResults(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (data ?? []).map((v: any) => {
        const inv = Array.isArray(v.inventory) ? v.inventory[0] : v.inventory
        const stock = (inv?.quantity ?? 0) - (inv?.reserved ?? 0)
        const prod = Array.isArray(v.products) ? v.products[0] : v.products
        const price = v.price_override ?? prod?.price ?? 0
        const variantLabel = [v.size, v.color].filter(Boolean).join(' / ')
        return { variantId: v.id, name: prod?.name ?? '—', variant: variantLabel, price: Number(price), stock }
      })
    )
    setSearching(false)
  }

  const addToCart = (item: SearchResult) => {
    setCart((prev) => {
      const ex = prev.find((c) => c.id === item.variantId)
      if (ex) return prev.map((c) => (c.id === item.variantId ? { ...c, qty: c.qty + 1 } : c))
      return [...prev, { id: item.variantId, name: item.name, variant: item.variant, price: item.price, qty: 1 }]
    })
    setSearch('')
    setResults([])
  }

  const removeFromCart = (id: string) => setCart((prev) => prev.filter((c) => c.id !== id))

  const finalize = async () => {
    if (!sessionId) { Alert.alert('Abra o caixa antes de registrar uma venda.'); return }
    if (cart.length === 0) return
    setLoading(true)

    const { error } = await supabase.rpc('make_sale', {
      p_store_id: storeId,
      p_session_id: sessionId,
      p_seller_id: userId,
      p_payment: payment,
      p_discount: 0,
      p_items: cart.map((c) => ({
        variant_id: c.id,
        qty: c.qty,
        unit_price: c.price,
        product_name: c.name,
        variant_label: c.variant,
      })),
    })

    setLoading(false)
    if (error) {
      Alert.alert('Erro', error.message)
      return
    }
    setSuccess(true)
    setCart([])
    setTimeout(() => setSuccess(false), 2500)
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Nova Venda</Text>
        <View style={[styles.badge, sessionId ? styles.badgeOpen : styles.badgeClosed]}>
          <Text style={sessionId ? styles.badgeOpenText : styles.badgeClosedText}>
            {sessionId ? 'Caixa aberto' : 'Caixa fechado'}
          </Text>
        </View>
      </View>

      <View style={styles.searchWrap}>
        <View style={styles.searchBox}>
          <Search size={16} color="#9ca3af" />
          <TextInput
            value={search}
            onChangeText={searchProducts}
            placeholder="Buscar produto, tamanho ou cor..."
            placeholderTextColor="#9ca3af"
            style={styles.searchInput}
          />
          {searching && <ActivityIndicator size="small" color="#7c3aed" />}
        </View>

        {results.length > 0 && (
          <View style={styles.resultsBox}>
            {results.map((r) => (
              <TouchableOpacity key={r.variantId} style={styles.resultRow} onPress={() => addToCart(r)} disabled={r.stock <= 0}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.resultName}>{r.name}</Text>
                  <Text style={styles.resultVariant}>{r.variant || 'Único'} · {r.stock <= 0 ? 'sem estoque' : `${r.stock} disp.`}</Text>
                </View>
                <Text style={styles.resultPrice}>{formatCurrency(r.price)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <FlatList
        data={cart}
        keyExtractor={(c) => c.id}
        contentContainerStyle={styles.cartList}
        ListEmptyComponent={<Text style={styles.empty}>Carrinho vazio. Busque um produto acima.</Text>}
        renderItem={({ item }) => (
          <View style={styles.cartRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cartName}>{item.name}</Text>
              <Text style={styles.cartVariant}>{item.variant || 'Único'} · x{item.qty}</Text>
            </View>
            <Text style={styles.cartPrice}>{formatCurrency(item.price * item.qty)}</Text>
            <TouchableOpacity onPress={() => removeFromCart(item.id)} style={{ marginLeft: 10 }}>
              <Trash2 size={16} color="#d1d5db" />
            </TouchableOpacity>
          </View>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.paymentRow}>
          {paymentMethods.map((m) => (
            <TouchableOpacity
              key={m.id}
              onPress={() => setPayment(m.id)}
              style={[styles.paymentChip, payment === m.id && styles.paymentChipActive]}
            >
              <Text style={[styles.paymentChipText, payment === m.id && styles.paymentChipTextActive]}>{m.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{formatCurrency(subtotal)}</Text>
        </View>

        <TouchableOpacity
          style={[styles.finalizeBtn, (cart.length === 0 || loading) && styles.finalizeBtnDisabled]}
          onPress={finalize}
          disabled={cart.length === 0 || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : success ? (
            <><CheckCircle size={16} color="#fff" /><Text style={styles.finalizeText}>  Venda registrada!</Text></>
          ) : (
            <Text style={styles.finalizeText}>Finalizar Venda</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container:          { flex: 1, backgroundColor: '#f9fafb' },
  header:             { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingBottom: 8 },
  title:              { fontSize: 22, fontWeight: '700', color: '#111827' },
  badge:              { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  badgeOpen:          { backgroundColor: '#dcfce7' },
  badgeClosed:        { backgroundColor: '#fee2e2' },
  badgeOpenText:      { color: '#15803d', fontSize: 11, fontWeight: '700' },
  badgeClosedText:    { color: '#b91c1c', fontSize: 11, fontWeight: '700' },
  searchWrap:         { paddingHorizontal: 16, zIndex: 10 },
  searchBox:          { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#e5e7eb', paddingHorizontal: 12, paddingVertical: 10 },
  searchInput:        { flex: 1, fontSize: 14, color: '#111827' },
  resultsBox:         { backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#e5e7eb', marginTop: 4, overflow: 'hidden' },
  resultRow:          { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  resultName:         { fontSize: 13, fontWeight: '600', color: '#111827' },
  resultVariant:      { fontSize: 11, color: '#9ca3af', marginTop: 2 },
  resultPrice:        { fontSize: 13, fontWeight: '700', color: '#111827' },
  cartList:           { padding: 16, gap: 8, flexGrow: 1 },
  empty:              { textAlign: 'center', color: '#9ca3af', fontSize: 13, marginTop: 24 },
  cartRow:            { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#e5e7eb', padding: 12 },
  cartName:           { fontSize: 13, fontWeight: '600', color: '#111827' },
  cartVariant:        { fontSize: 11, color: '#9ca3af', marginTop: 2 },
  cartPrice:          { fontSize: 13, fontWeight: '700', color: '#111827' },
  footer:             { padding: 16, borderTopWidth: 1, borderTopColor: '#e5e7eb', backgroundColor: '#fff', gap: 10 },
  paymentRow:         { flexDirection: 'row', gap: 8 },
  paymentChip:        { flex: 1, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb', alignItems: 'center' },
  paymentChipActive:  { backgroundColor: '#f3e8ff', borderColor: '#7c3aed' },
  paymentChipText:    { fontSize: 12, color: '#6b7280', fontWeight: '600' },
  paymentChipTextActive: { color: '#7c3aed' },
  totalRow:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel:         { fontSize: 13, color: '#6b7280' },
  totalValue:         { fontSize: 20, fontWeight: '800', color: '#111827' },
  finalizeBtn:        { backgroundColor: '#16a34a', borderRadius: 10, paddingVertical: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  finalizeBtnDisabled:{ opacity: 0.5 },
  finalizeText:       { color: '#fff', fontWeight: '700', fontSize: 14 },
})
