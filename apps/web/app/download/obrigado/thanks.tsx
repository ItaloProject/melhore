'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Check, Download, ArrowLeft } from 'lucide-react'
import { startSilentDownload } from '@/lib/download'

function Logo() {
  return (
    <span className="text-2xl font-bold tracking-[0.06em] text-white">
      MELHOR<span className="text-brand-400 logo-e">E</span>
    </span>
  )
}

export function DownloadThanks({
  url,
  platform,
  safe,
}: {
  url: string
  platform: 'windows' | 'android'
  safe: boolean
}) {
  const [started, setStarted] = useState(false)

  useEffect(() => {
    if (!safe) return
    startSilentDownload(url)
    setStarted(true)
  }, [safe, url])

  const fileLabel = platform === 'android' ? 'o APK do Android' : 'o instalador do Windows'
  const tip = platform === 'android'
    ? 'No Android, permita a instalação a partir deste arquivo se o sistema pedir.'
    : 'No Windows, se aparecer o SmartScreen, clique em Mais informações e depois em Executar assim mesmo.'

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[520px] h-[320px] bg-brand-700/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md text-center">
        <Link href="/" className="inline-block mb-10">
          <Logo />
        </Link>

        <div className="rounded-3xl border border-white/10 bg-surface-900/80 p-8 sm:p-10 shadow-2xl shadow-black/40">
          <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-brand-600/20 border border-brand-500/30 flex items-center justify-center">
            <Check className="w-8 h-8 text-brand-300" strokeWidth={2.5} />
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
            {safe ? 'Download iniciado' : 'Link inválido'}
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed mb-2">
            {safe
              ? `Obrigado por escolher o Melhore. ${started ? `Estamos baixando ${fileLabel}.` : `Preparando ${fileLabel}…`}`
              : 'Não foi possível iniciar o download. Volte e escolha o Windows ou o Android.'}
          </p>
          {safe && (
            <p className="text-slate-500 text-xs leading-relaxed mb-8">
              {tip}
            </p>
          )}

          <div className="flex flex-col gap-3">
            {safe && (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-sm font-semibold bg-brand-600 hover:bg-brand-500 text-white transition-all"
              >
                <Download className="w-4 h-4" />
                Se não começou, clique aqui
              </a>
            )}
            <Link
              href="/#download"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-sm font-semibold bg-white/8 hover:bg-white/12 text-white border border-white/10 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar ao site
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
