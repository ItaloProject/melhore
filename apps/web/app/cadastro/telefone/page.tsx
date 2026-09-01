import { redirect } from 'next/navigation'
import { getMyStoreContact } from '@/lib/actions/store'
import { PhoneForm } from './form'

export default async function TelefonePage() {
  const { user, store } = await getMyStoreContact()
  if (!user) redirect('/login')
  if (store?.phone) redirect('/admin')

  const metaPhone =
    typeof user.user_metadata?.phone === 'string' ? user.user_metadata.phone : ''

  return <PhoneForm defaultPhone={store?.phone || metaPhone} />
}
