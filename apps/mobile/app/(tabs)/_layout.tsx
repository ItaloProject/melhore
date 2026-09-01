import { Tabs } from 'expo-router'
import { LayoutDashboard, Package, ShoppingCart, CreditCard, BarChart3 } from 'lucide-react-native'

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#c026d3', headerShown: false }}>
      <Tabs.Screen
        name="index"
        options={{ title: 'Dashboard', tabBarIcon: ({ color }) => <LayoutDashboard size={22} color={color} /> }}
      />
      <Tabs.Screen
        name="estoque"
        options={{ title: 'Estoque', tabBarIcon: ({ color }) => <Package size={22} color={color} /> }}
      />
      <Tabs.Screen
        name="pdv"
        options={{ title: 'PDV', tabBarIcon: ({ color }) => <ShoppingCart size={22} color={color} /> }}
      />
      <Tabs.Screen
        name="caixa"
        options={{ title: 'Caixa', tabBarIcon: ({ color }) => <CreditCard size={22} color={color} /> }}
      />
      <Tabs.Screen
        name="relatorios"
        options={{ title: 'Relatórios', tabBarIcon: ({ color }) => <BarChart3 size={22} color={color} /> }}
      />
    </Tabs>
  )
}
