'use client'

import { useState } from 'react'
import { ChevronDown, Download, Clock } from 'lucide-react'

interface Asset {
  name: string
  browser_download_url: string
  size: number
}

interface Release {
  tag_name: string
  published_at: string
  assets: Asset[]
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function VersionHistory() {
  const [open, setOpen] = useState(false)
  const [releases, setReleases] = useState<Release[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  async function toggle() {
    setOpen((v) => !v)
    if (!open && releases === null && !loading) {
      setLoading(true)
      try {
        const res = await fetch(
          'https://api.github.com/repos/ItaloProject/melhore/releases',
          { headers: { Accept: 'application/vnd.github+json' } }
        )
        if (!res.ok) throw new Error()
        setReleases(await res.json())
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <div className="mt-8 rounded-2xl border border-white/8 overflow-hidden">
      <button
        onClick={toggle}
        className="flex w-full items-center justify-center gap-2 py-3.5 px-5 text-sm text-slate-400 hover:text-white hover:bg-white/[0.03] transition-colors"
        aria-expanded={open}
      >
        <Clock className="w-3.5 h-3.5" />
        Histórico de versões
        <ChevronDown
          className="w-3.5 h-3.5 transition-transform duration-200"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </button>

      {open && (
        <div className="border-t border-white/8">
          {loading && (
            <p className="text-center text-sm text-slate-500 py-6 animate-pulse">
              Carregando versões...
            </p>
          )}

          {error && (
            <p className="text-center text-sm text-slate-500 py-6">
              Não foi possível carregar o histórico.
            </p>
          )}

          {releases && releases.length === 0 && (
            <p className="text-center text-sm text-slate-500 py-6">
              Nenhuma versão publicada ainda.
            </p>
          )}

          {releases && releases.length > 0 && (
            <div>
              {releases.map((rel, i) => {
                const exe = rel.assets?.find(
                  (a) => a.name.endsWith('.exe') && !a.name.includes('blockmap')
                )
                const apk = rel.assets?.find((a) => a.name.endsWith('.apk'))

                return (
                  <div
                    key={rel.tag_name}
                    className="flex items-center justify-between gap-4 px-5 py-3.5 border-b border-white/5 last:border-b-0 flex-wrap"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-sm text-white">
                        {rel.tag_name}
                      </span>
                      {i === 0 && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-lime-400/10 text-lime-300 border-lime-400/20">
                          Atual
                        </span>
                      )}
                      {rel.published_at && (
                        <span className="text-xs text-slate-500">
                          {formatDate(rel.published_at)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {exe ? (
                        <a
                          href={exe.browser_download_url}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-brand-500/15 text-brand-300 border border-brand-500/20 hover:bg-brand-500/25 transition-colors"
                        >
                          <Download className="w-3 h-3" />
                          Windows .exe
                          <span className="text-slate-500 font-normal">· {formatBytes(exe.size)}</span>
                        </a>
                      ) : (
                        <span className="text-xs text-slate-600">Windows —</span>
                      )}

                      {apk ? (
                        <a
                          href={apk.browser_download_url}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/15 hover:bg-emerald-500/20 transition-colors"
                        >
                          <Download className="w-3 h-3" />
                          Android APK
                          <span className="text-slate-500 font-normal">· {formatBytes(apk.size)}</span>
                        </a>
                      ) : (
                        <span className="text-xs text-slate-600">Android —</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
