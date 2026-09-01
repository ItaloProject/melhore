import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  let next = searchParams.get('next') ?? '/cadastro/telefone'
  if (!next.startsWith('/')) next = '/cadastro/telefone'

  if (code) {
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (!error) {
        const forwardedHost = request.headers.get('x-forwarded-host')
        const isLocalEnv = process.env.NODE_ENV === 'development'
        const base = isLocalEnv
          ? origin
          : forwardedHost
            ? `https://${forwardedHost}`
            : origin
        return NextResponse.redirect(`${base}${next}`)
      }
    } catch {
      return NextResponse.redirect(`${origin}/login?error=auth`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`)
}
