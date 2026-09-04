import { redirect } from 'next/navigation'
import { Shield, KeyRound, AlertCircle } from 'lucide-react'
import { getSessionUser } from '@/lib/auth/session'
import { emailIsPlatformAdmin } from '@/lib/auth/platform'
import { isPinVerified } from '@/lib/auth/admin-pin'
import { submitPin } from './actions'

export const dynamic = 'force-dynamic'

export default async function AdminPinPage({
  searchParams,
}: {
  searchParams: { wrong?: string }
}) {
  const user = await getSessionUser()
  if (!user || !emailIsPlatformAdmin(user.email)) redirect('/login')
  if (isPinVerified()) redirect('/plataforma')

  const wrong = searchParams.wrong === '1'

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-600/20 border border-brand-500/30 mb-4">
            <Shield className="w-7 h-7 text-brand-400" />
          </div>
          <h1 className="text-xl font-bold text-white mb-1">Verificação de segurança</h1>
          <p className="text-sm text-slate-400">
            Digite o PIN de 8 dígitos para acessar o console da plataforma.
          </p>
        </div>

        <form action={submitPin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">
              PIN do administrador
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              <input
                name="pin"
                type="password"
                inputMode="numeric"
                maxLength={8}
                pattern="\d{8}"
                placeholder="••••••••"
                required
                autoFocus
                autoComplete="off"
                className="w-full rounded-xl bg-surface-900 border border-white/10 pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-600 tracking-[0.25em] focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {wrong && (
            <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-3.5 py-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <p className="text-sm text-red-300">PIN incorreto. Tente novamente.</p>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold transition-colors shadow-lg shadow-brand-900/40"
          >
            Verificar e entrar
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-600">
          Acesso restrito ao proprietário da plataforma.
        </p>
      </div>
    </div>
  )
}
