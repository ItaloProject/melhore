import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/auth/session'
import { isPlatformAdmin } from '@/lib/auth/platform'
import { isPinVerified } from '@/lib/auth/admin-pin'

export const dynamic = 'force-dynamic'

export default async function AuthContinuePage() {
  const user = await getSessionUser()
  if (!user) redirect('/login')

  if (await isPlatformAdmin(user)) {
    if (!isPinVerified()) redirect('/admin/pin')
    redirect('/plataforma')
  }

  redirect('/admin')
}
