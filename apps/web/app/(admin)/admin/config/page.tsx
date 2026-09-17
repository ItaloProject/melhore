import { createClient } from '@/lib/supabase/server'
import { requireStore } from '@/lib/queries/store'
import { ConfigClient } from './client'

async function getStore(storeId: string) {
  const supabase = createClient()
  const { data } = await supabase
    .from('stores')
    .select('id, name, slug, phone, whatsapp, email, instagram, address, city, state, primary_color, logo_url')
    .eq('id', storeId)
    .maybeSingle()
  return data
}

export default async function ConfigPage() {
  const { storeId } = await requireStore()
  const store = await getStore(storeId)

  if (!store) {
    return <div className="p-6 text-sm text-gray-500">Loja não encontrada.</div>
  }

  return (
    <div className="p-6 space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">Configurações da Loja</h1>
      <ConfigClient store={store} />
    </div>
  )
}
