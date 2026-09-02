import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { Text } from 'react-native'

export default function RootLayout() {
  return (
    <>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#fff' },
          headerTintColor: '#1a1a1a',
          headerTitleStyle: { fontWeight: '700' },
        }}
      />
      <Text
        pointerEvents="none"
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
