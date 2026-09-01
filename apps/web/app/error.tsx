'use client'

import Link from 'next/link'

export default function AppError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center rounded-3xl border border-white/10 bg-surface-900/80 p-8 shadow-2xl shadow-black/40">
        <h1 className="text-2xl font-bold tracking-tight mb-3">Algo deu errado</h1>
        <p className="text-slate-400 text-sm leading-relaxed mb-8">
          Não foi possível abrir esta página. Entre de novo ou volte ao início.
        </p>
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={reset}
            className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold bg-brand-600 hover:bg-brand-500 text-white transition-all"
          >
            Tentar de novo
          </button>
          <Link
            href="/login"
            className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold bg-white/8 hover:bg-white/12 text-white border border-white/10 transition-all"
          >
            Ir para o login
          </Link>
        </div>
      </div>
    </div>
  )
}
