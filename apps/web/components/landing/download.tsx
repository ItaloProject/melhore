import { Monitor, Smartphone, Apple, Download, ExternalLink } from 'lucide-react'
import { VersionHistory } from './version-history'

interface GithubAsset {
  name: string
  browser_download_url: string
  size: number
}

interface GithubRelease {
  tag_name: string
  name: string
  published_at: string
  assets: GithubAsset[]
}

async function getLatestRelease(): Promise<GithubRelease | null> {
  try {
    const res = await fetch(
      'https://api.github.com/repos/ItaloProject/melhore/releases/latest',
      {
        headers: { Accept: 'application/vnd.github+json' },
        next: { revalidate: 3600 },
      }
    )
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })
}

export async function DownloadSection() {
  const release = await getLatestRelease()

  const exeAsset = release?.assets.find((a) =>
    a.name.endsWith('.exe') && !a.name.includes('blockmap')
  )
  const apkAsset = release?.assets.find((a) => a.name.endsWith('.apk'))
  const version = release?.tag_name ?? null

  const platforms = [
    {
      id: 'windows',
      icon: Monitor,
      label: 'Windows',
      sublabel: 'Windows 10 / 11 — 64-bit',
      description: 'PDV completo, modo offline, impressão de cupom.',
      available: !!exeAsset,
      url: exeAsset?.browser_download_url,
      size: exeAsset ? formatBytes(exeAsset.size) : null,
      badge: 'Recomendado',
      badgeColor: 'bg-brand-500/20 text-brand-300 border-brand-500/30',
      btnClass: 'bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-900/40',
      btnText: 'Baixar .exe',
      soonText: 'Publicando em breve',
    },
    {
      id: 'android',
      icon: Smartphone,
      label: 'Android',
      sublabel: 'Android 9+ (Pie)',
      description: 'Gerencie estoque e pedidos na palma da mão.',
      available: !!apkAsset,
      url: apkAsset?.browser_download_url ?? '#',
      size: apkAsset ? formatBytes(apkAsset.size) : null,
      badge: null,
      badgeColor: '',
      btnClass: 'bg-white/8 hover:bg-white/12 text-white border border-white/10',
      btnText: 'Baixar APK',
      soonText: 'Em breve na Play Store',
    },
    {
      id: 'ios',
      icon: Apple,
      label: 'iOS / iPadOS',
      sublabel: 'iPhone & iPad — iOS 16+',
      description: 'App nativo para iPhone e iPad com suporte offline.',
      available: false,
      url: null,
      size: null,
      badge: null,
      badgeColor: '',
      btnClass: 'bg-white/8 text-slate-500 border border-white/10 cursor-not-allowed',
      btnText: 'Em breve',
      soonText: 'Em breve na App Store',
    },
  ]

  return (
    <section id="download" className="py-20 sm:py-28 px-4 sm:px-6 relative overflow-hidden">
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-brand-700/15 rounded-full blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl relative">

        {/* header */}
        <div className="text-center mb-12 sm:mb-16">
          <p className="text-xs font-semibold text-brand-400 tracking-[0.2em] uppercase mb-3">
            Multi-plataforma
          </p>
          <h2 className="font-bold text-white leading-tight mb-4"
            style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)' }}>
            Disponível em todas as plataformas
          </h2>
          <p className="text-slate-400 max-w-lg mx-auto text-base sm:text-lg">
            Um único sistema para PDV no balcão, gestão pelo celular e vitrine online sincronizados em tempo real.
          </p>

          {version && (
            <div className="inline-flex items-center gap-2 mt-5 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
              Versão atual: <span className="text-white font-semibold">{version}</span>
              {release?.published_at && (
                <span className="text-slate-600">— {formatDate(release.published_at)}</span>
              )}
            </div>
          )}
        </div>

        {/* platform cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {platforms.map((p) => (
            <div
              key={p.id}
              className={`relative flex flex-col rounded-2xl border bg-surface-900 p-6 sm:p-7 transition-all ${
                p.id === 'windows'
                  ? 'border-brand-500/30 ring-1 ring-brand-500/20'
                  : 'border-white/8'
              }`}
            >
              {p.badge && (
                <span className={`absolute top-4 right-4 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${p.badgeColor}`}>
                  {p.badge}
                </span>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  p.id === 'windows' ? 'bg-brand-600/20' : 'bg-white/8'
                }`}>
                  <p.icon className={`w-5 h-5 ${p.id === 'windows' ? 'text-brand-400' : 'text-slate-400'}`} />
                </div>
                <div>
                  <p className="text-base font-semibold text-white">{p.label}</p>
                  <p className="text-[11px] text-slate-500">{p.sublabel}</p>
                </div>
              </div>

              <p className="text-sm text-slate-400 leading-relaxed flex-1 mb-6">
                {p.description}
              </p>

              {p.available && p.size && (
                <div className="flex items-center gap-3 mb-3 text-[11px] text-slate-600">
                  <span>{p.size}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-700" />
                  <span>{p.id === 'windows' ? 'Instalador NSIS' : 'APK universal'}</span>
                </div>
              )}

              {p.available && p.url ? (
                <a
                  href={p.url}
                  className={`inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-sm font-semibold transition-all ${p.btnClass}`}
                >
                  <Download className="w-4 h-4" />
                  {p.btnText}
                </a>
              ) : p.id === 'ios' ? (
                <div className={`inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-sm font-semibold ${p.btnClass}`}>
                  {p.btnText}
                </div>
              ) : (
                <div className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-sm font-semibold bg-white/5 text-slate-500 border border-white/8">
                  {p.soonText}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* version history accordion */}
        <VersionHistory />

        {/* github link */}
        <div className="flex items-center justify-center mt-5 gap-2 text-xs text-slate-600">
          <span>Changelogs completos no</span>
          <a
            href="https://github.com/ItaloProject/melhore/releases"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
          >
            GitHub Releases
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </section>
  )
}
