import { useEffect } from 'react'
import { Stack, useRouter, useSegments } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { Text, View, ActivityIndicator } from 'react-native'
import { supabase } from '@/lib/supabase'
import { useSession } from '@/lib/session-store'

function useProtectedRoute() {
  const { loading, userId, init } = useSession()
  const segments = useSegments()
  const router = useRouter()

  useEffect(() => {
    init()
    const { data: sub } = supabase.auth.onAuthStateChange(() => init())
    return () => sub.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (loading) return
    const inAuthGroup = segments[0] === 'login'
    if (!userId && !inAuthGroup) {
      router.replace('/login')
    } else if (userId && inAuthGroup) {
      router.replace('/(tabs)')
    }
  }, [userId, loading, segments])

  return loading
}

export default function RootLayout() {
  const loading = useProtectedRoute()

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator color="#c026d3" />
      </View>
    )
  }

  return (
    <>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#fff' },
          headerTintColor: '#1a1a1a',
          headerTitleStyle: { fontWeight: '700' },
        }}
      >
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <Text
        style={{
          position: 'absolute',
          right: 10,
          bottom: 8,
          zIndex: 100,
          fontSize: 9,
          fontWeight: '500',
          letterSpacing: 0.2,
          color: 'rgba(148, 163, 184, 0.45)',
        }}
      >
        Desenvolvido por: Italo Fontes
      </Text>
    </>
  )
}
