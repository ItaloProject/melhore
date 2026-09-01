import { createClient } from '@/lib/supabase/server'

function withTimeout<T>(promise: Promise<T>, ms: number) {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('auth timeout')), ms)
    promise.then(
      (value) => {
        clearTimeout(timer)
        resolve(value)
      },
      (error) => {
        clearTimeout(timer)
        reject(error)
      },
    )
  })
}

export async function getSessionUser() {
  try {
    const supabase = createClient()
    const { data: { user } } = await withTimeout(supabase.auth.getUser(), 8000)
    return user ?? null
  } catch {
    return null
  }
}
