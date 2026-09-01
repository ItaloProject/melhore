'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { ArrowRight, CheckCircle, Zap } from 'lucide-react'
import { useFadeUp } from '@/hooks/use-gsap'

const badges = ['Sem cartão de crédito', '5 min para configurar', 'Cancele quando quiser']

const kpis = [
  { l: 'Vendas hoje',    v: 'R$ 4.280', c: 'text-emerald-400' },
  { l: 'Pedidos online', v: '7 novos',  c: 'text-blue-400'   },
  { l: 'Em estoque',     v: '342 itens',c: 'text-violet-400' },
  { l: 'Crítico',        v: '5 SKUs',   c: 'text-rose-400'   },
]

const sales = [
  ['Camisa Preta M',   'R$ 89,90',  'Pix · 14:32'],
  ['Calça Jeans 40',   'R$ 189,90', 'Crédito · 13:55'],
  ['Vestido Floral M', 'R$ 229,90', 'Online · 11:40'],
]

export function HeroSection() {
  const leftRef    = useRef<HTMLDivElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)

  useFadeUp(leftRef,    { delay: 0.1, y: 24 })
  useFadeUp(previewRef, { delay: 0.4, y: 32 })

  return (
    <section className="relative min-h-[calc(100svh-64px)] flex items-center py-12 px-4 sm:px-6 overflow-hidden">
      {/* bg */}
      <div className="absolute inset-0 bg-mesh-brand opacity-70 pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[min(700px,90vw)] h-80 bg-brand-700/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-7xl w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.05fr] gap-10 xl:gap-16 items-center">

          {/* ── Left: headline + CTA ── */}
          <div ref={leftRef} style={{ opacity: 0 }} className="text-center lg:text-left">

            <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-sm text-brand-300 mb-6">
              <Zap className="w-3.5 h-3.5 shrink-0" />
              Físico e digital em tempo real
            </span>

            <h1
              className="font-bold leading-[1.05] tracking-tight mb-5"
              style={{ fontSize: 'clamp(2.5rem, 5.5vw, 4.5rem)' }}
            >
              Gestão que
              <br />
              <span className="text-gradient">melhora</span> sua loja
            </h1>

            <p className="text-slate-400 max-w-lg mx-auto lg:mx-0 mb-8 leading-relaxed"
              style={{ fontSize: 'clamp(1rem, 1.8vw, 1.125rem)' }}>
              PDV, estoque, caixa e vitrine online integrados.
              Venda no balcão ou pelo celular do cliente — o mesmo estoque, um único sistema.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 mb-8">
              <Link
                href="/cadastro"
                className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-semibold text-base transition-all shadow-xl shadow-brand-900/40 w-full sm:w-auto"
              >
                Criar minha loja
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="/demo"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 border border-white/10 hover:border-white/25 text-slate-300 hover:text-white rounded-xl font-medium text-base transition-all w-full sm:w-auto"
              >
                Ver demo
              </Link>
            </div>

            {/* trust */}
            <div className="flex items-center justify-center lg:justify-start gap-4 sm:gap-6 text-sm text-slate-500 flex-wrap">
              {badges.map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-brand-500 shrink-0" /> {t}
                </span>
              ))}
            </div>
          </div>

          {/* ── Right: Admin UI preview — hidden on mobile ── */}
          <div ref={previewRef} style={{ opacity: 0 }} className="hidden sm:block">
            <div className="rounded-2xl border border-white/8 overflow-hidden shadow-[0_24px_64px_rgba(0,0,0,0.55)] bg-surface-800">

              {/* browser bar */}
              <div className="h-9 flex items-center gap-2 px-3 bg-surface-900 border-b border-white/5 shrink-0">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
                <div className="mx-auto px-3 py-0.5 rounded bg-white/5 text-[11px] text-slate-600 truncate max-w-[220px]">
                  app.melhore.com.br/admin
                </div>
              </div>

              {/* dashboard */}
              <div className="flex" style={{ height: 'clamp(220px, 28vw, 320px)' }}>

                {/* sidebar — desktop only */}
                <div className="hidden lg:flex w-40 xl:w-44 bg-surface-900 border-r border-white/5 p-2.5 flex-col gap-0.5 shrink-0">
                  <div className="px-2 py-1.5 mb-1">
                    <span className="text-xs font-bold tracking-[0.06em] text-white">
                      MELHOR<span className="text-brand-400" style={{ textShadow: '0 0 8px rgba(167,139,250,0.5)' }}>E</span>
                    </span>
                  </div>
                  {['Dashboard', 'Produtos', 'Estoque', 'Vendas / PDV', 'Caixa', 'Relatórios'].map((item, i) => (
                    <div
                      key={item}
                      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] ${
                        i === 0 ? 'bg-brand-600/20 text-brand-300' : 'text-slate-500'
                      }`}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${i === 0 ? 'bg-brand-400' : 'bg-white/10'}`} />
                      {item}
                    </div>
                  ))}
                </div>

                {/* content */}
                <div className="flex-1 p-3 sm:p-4 flex flex-col gap-3 bg-slate-50/[0.02] overflow-hidden">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                    {kpis.map((s) => (
                      <div key={s.l} className="rounded-xl bg-white/[0.04] border border-white/5 p-2.5 sm:p-3">
                        <p className="text-[9px] sm:text-[10px] text-slate-500 mb-1 uppercase tracking-wider leading-tight">{s.l}</p>
                        <p className={`text-sm font-bold ${s.c}`}>{s.v}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex-1 rounded-xl bg-white/[0.04] border border-white/5 p-2.5 sm:p-3 overflow-hidden">
                    <p className="text-[9px] sm:text-[10px] text-slate-500 uppercase tracking-wider mb-2">Vendas Recentes</p>
                    <div className="space-y-1.5 sm:space-y-2">
                      {sales.map(([name, price, meta]) => (
                        <div key={name} className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-300 truncate mr-2">{name}</span>
                          <div className="flex gap-2 sm:gap-4 shrink-0">
                            <span className="text-slate-500 hidden md:block">{meta}</span>
                            <span className="text-white font-semibold">{price}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
