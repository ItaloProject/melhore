import { cookies } from 'next/headers'

const PIN_COOKIE = 'platform_pin_ok'
const PIN_COOKIE_MAX_AGE = 60 * 60 * 8 // 8 hours

export function verifyPin(entered: string): boolean {
  const pin = process.env.PLATFORM_ADMIN_PIN
  if (!pin) return false
  return entered === pin
}

export function setPinVerified(): void {
  cookies().set(PIN_COOKIE, '1', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: PIN_COOKIE_MAX_AGE,
    path: '/',
  })
}

export function isPinVerified(): boolean {
  return cookies().get(PIN_COOKIE)?.value === '1'
}
