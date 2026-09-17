import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { supabase } from '@/lib/supabase'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Preencha e-mail e senha.')
      return
    }
    setError('')
    setLoading(true)
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (authError) {
      setError('E-mail ou senha inválidos.')
    }
    // navigation to (tabs) happens automatically via the auth guard in _layout.tsx
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <View style={styles.content}>
          <Text style={styles.logo}>MELHORE</Text>
          <Text style={styles.subtitle}>Entre na sua loja</Text>

          <View style={styles.form}>
            <Text style={styles.label}>E-mail</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="seu@email.com"
              placeholderTextColor="#9ca3af"
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
            />

            <Text style={styles.label}>Senha</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor="#9ca3af"
              secureTextEntry
              style={styles.input}
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Entrar</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: '#fff' },
  flex:       { flex: 1 },
  content:    { flex: 1, justifyContent: 'center', paddingHorizontal: 28 },
  logo:       { fontSize: 24, fontWeight: '800', color: '#111827', letterSpacing: 1, textAlign: 'center' },
  subtitle:   { fontSize: 14, color: '#6b7280', textAlign: 'center', marginTop: 6, marginBottom: 32 },
  form:       { gap: 6 },
  label:      { fontSize: 13, fontWeight: '600', color: '#374151', marginTop: 12, marginBottom: 4 },
  input:      { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#111827' },
  error:      { color: '#dc2626', fontSize: 13, marginTop: 10, textAlign: 'center' },
  button:     { backgroundColor: '#7c3aed', borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 20 },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
})
