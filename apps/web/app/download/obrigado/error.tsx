'use client'

import Link from 'next/link'

export default function DownloadError() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center rounded-3xl border border-white/10 bg-surface-900/80 p-8">
        <h1 className="text-2xl font-bold tracking-tight mb-3">Download iniciado</h1>
        <p className="text-slate-400 text-sm leading-relaxed mb-8">
          Se o arquivo não começou a baixar, volte e escolha o Windows ou o Android outra vez.
        </p>
        <Link
          href="/#download"
          className="inline-flex items-center justify-center w-full py-2.5 px-4 rounded-xl text-sm font-semibold bg-brand-600 hover:bg-brand-500 text-white transition-all"
        >
          Voltar ao download
        </Link>
      </div>
    </div>
  )
}
