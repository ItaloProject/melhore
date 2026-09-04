'use server'

import { redirect } from 'next/navigation'
import { verifyPin, setPinVerified } from '@/lib/auth/admin-pin'
import { getSessionUser } from '@/lib/auth/session'
import { emailIsPlatformAdmin } from '@/lib/auth/platform'

export async function submitPin(formData: FormData) {
  const user = await getSessionUser()
  if (!user || !emailIsPlatformAdmin(user.email)) redirect('/login')

  const pin = formData.get('pin')?.toString() ?? ''

  if (!verifyPin(pin)) {
    redirect('/admin/pin?wrong=1')
  }

  setPinVerified()
  redirect('/plataforma')
}
