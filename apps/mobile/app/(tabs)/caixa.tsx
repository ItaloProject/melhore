import { useCallback, useState } from 'react'
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useFocusEffect } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { useSession } from '@/lib/session-store'

interface OpenSession {
  id: string
  opening_balance: number
  opened_at: string
}

function formatCurrency(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function CaixaScreen() {
  const { storeId, userId } = useSession()
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<OpenSession | null>(null)
  const [salesTotal, setSalesTotal] = useState(0)
  const [openingInput, setOpeningInput] = useState('')
  const [closingInput, setClosingInput] = useState('')
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    if (!storeId) return
    const { data } = await supabase
      .from('cash_sessions')
      .select('id, opening_balance, opened_at')
      .eq('store_id', storeId)
      .eq('status', 'open')
      .maybeSingle()

    setSession(data)

    if (data) {
      const { data: sales } = await supabase.from('sales').select('total').eq('session_id', data.id)
      setSalesTotal((sales ?? []).reduce((s, r) => s + Number(r.total), 0))
    }
    setLoading(false)
  }, [storeId])

  useFocusEffect(useCallback(() => { load() }, [load]))

  const handleOpen = async () => {
    const balance = Number(openingInput.replace(',', '.')) || 0
    setBusy(true)
    const { error } = await supabase.from('cash_sessions').insert({
      store_id: storeId,
      opened_by: userId,
      opening_balance: balance,
      status: 'open',
    })
    setBusy(false)
    if (error) {
      Alert.alert('Erro', error.message)
      return
    }
    setOpeningInput('')
    load()
  }

  const handleClose = async () => {
    if (!session) return
    const counted = Number(closingInput.replace(',', '.'))
    if (isNaN(counted)) {
      Alert.alert('Informe o valor contado em caixa.')
      return
    }
    setBusy(true)
    const { error } = await supabase
      .from('cash_sessions')
      .update({ status: 'closed', closed_by: userId, closed_at: new Date().toISOString(), closing_balance: counted })
      .eq('id', session.id)
    setBusy(false)
    if (error) {
      Alert.alert('Erro', error.message)
      return
    }
    setClosingInput('')
    load()
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator color="#7c3aed" />
      </SafeAreaView>
    )
  }

  const expected = session ? Number(session.opening_balance) + salesTotal : 0

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Caixa</Text>

        {!session ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Abrir caixa</Text>
            <Text style={styles.label}>Saldo inicial (R$)</Text>
            <TextInput
              value={openingInput}
              onChangeText={setOpeningInput}
              placeholder="0,00"
              keyboardType="decimal-pad"
              style={styles.input}
            />
            <TouchableOpacity style={styles.button} onPress={handleOpen} disabled={busy}>
              {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Abrir Caixa</Text>}
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.card}>
              <View style={styles.badgeRow}>
                <View style={styles.badgeOpen}><Text style={styles.badgeOpenText}>Aberto</Text></View>
                <Text style={styles.since}>
                  desde {new Date(session.opened_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Saldo inicial</Text>
                <Text style={styles.summaryValue}>{formatCurrency(Number(session.opening_balance))}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Vendas na sessão</Text>
                <Text style={[styles.summaryValue, { color: '#16a34a' }]}>{formatCurrency(salesTotal)}</Text>
              </View>
              <View style={[styles.summaryRow, styles.border]}>
                <Text style={styles.summaryLabelBold}>Saldo esperado</Text>
                <Text style={styles.summaryValueBold}>{formatCurrency(expected)}</Text>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Fechar caixa</Text>
              <Text style={styles.label}>Valor contado (R$)</Text>
              <TextInput
                value={closingInput}
                onChangeText={setClosingInput}
                placeholder="0,00"
                keyboardType="decimal-pad"
                style={styles.input}
              />
              <TouchableOpacity style={[styles.button, styles.buttonDanger]} onPress={handleClose} disabled={busy}>
                {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Confirmar Fechamento</Text>}
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#f9fafb' },
  center:            { alignItems: 'center', justifyContent: 'center' },
  scroll:            { padding: 16, gap: 16 },
  title:             { fontSize: 24, fontWeight: '700', color: '#111827' },
  card:              { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', padding: 16, gap: 6 },
  cardTitle:         { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 6 },
  label:             { fontSize: 13, color: '#6b7280', marginTop: 8, marginBottom: 4 },
  input:             { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: '#111827' },
  button:            { backgroundColor: '#7c3aed', borderRadius: 10, paddingVertical: 13, alignItems: 'center', marginTop: 14 },
  buttonDanger:      { backgroundColor: '#dc2626' },
  buttonText:        { color: '#fff', fontWeight: '700', fontSize: 14 },
  badgeRow:          { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  badgeOpen:         { backgroundColor: '#dcfce7', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999 },
  badgeOpenText:     { color: '#15803d', fontSize: 12, fontWeight: '700' },
  since:             { fontSize: 12, color: '#9ca3af' },
  summaryRow:        { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  summaryLabel:      { fontSize: 13, color: '#6b7280' },
  summaryValue:      { fontSize: 13, fontWeight: '600', color: '#111827' },
  summaryLabelBold:  { fontSize: 14, fontWeight: '700', color: '#111827' },
  summaryValueBold:  { fontSize: 14, fontWeight: '700', color: '#111827' },
  border:            { borderTopWidth: 1, borderTopColor: '#f3f4f6', marginTop: 4, paddingTop: 10 },
})
