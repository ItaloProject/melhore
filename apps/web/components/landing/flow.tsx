'use client'

import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useFadeUp } from '@/hooks/use-gsap'

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger)

const physicalFlow = [
  'Vendeu camisa preta M no balcão',
  'PDV registra a saída automaticamente',
  'Estoque atualizado: 3 → 2 unidades',
  'Vitrine online mostra "2 disponíveis"',
]

const onlineFlow = [
  'Cliente encontra camisa na vitrine Melhore',
  'Realiza compra ou reserva online',
  'Estoque é baixado/reservado na hora',
  'Lojista recebe e consolida com vendas físicas',
]

function AnimatedSteps({ steps, accent, dotBg }: { steps: string[]; accent: string; dotBg: string }) {
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!listRef.current) return
    const items = listRef.current.querySelectorAll('[data-step]')
    gsap.fromTo(
      items,
      { opacity: 0, x: -16 },
      {
        opacity: 1, x: 0,
        duration: 0.5, stagger: 0.13, ease: 'power2.out',
        scrollTrigger: { trigger: listRef.current, start: 'top 82%', once: true },
      }
    )
  }, [])

  return (
    <div ref={listRef} className="space-y-3 sm:space-y-4">
      {steps.map((step, i) => (
        <div key={step} data-step className="flex items-start gap-3" style={{ opacity: 0 }}>
          <span className={`flex-none w-6 h-6 rounded-full text-white text-[11px] font-bold flex items-center justify-center ${accent} shrink-0 mt-0.5`}>
            {i + 1}
          </span>
          <span className="text-sm text-slate-300 leading-relaxed">{step}</span>
        </div>
      ))}
    </div>
  )
}

export function FlowSection() {
  const headRef = useRef<HTMLDivElement>(null)
  useFadeUp(headRef, { y: 20 })

  return (
    <section id="flow" className="py-20 sm:py-28 px-4 sm:px-6 bg-surface-900 border-y border-white/5">
      <div className="mx-auto max-w-7xl">

        <div ref={headRef} style={{ opacity: 0 }} className="text-center mb-12 sm:mb-16">
          <p className="text-xs font-semibold text-brand-400 tracking-[0.2em] uppercase mb-3">
            Sincronização automática
          </p>
          <h2 className="font-bold text-white leading-tight mb-4"
            style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)' }}>
            Um estoque. Dois canais.
          </h2>
          <p className="text-slate-400 max-w-lg mx-auto text-base sm:text-lg">
            A mesma operação alimenta o físico e o digital simultaneamente — sem duplicar trabalho.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {/* Physical → Online */}
          <div className="rounded-2xl border border-white/8 bg-surface-800 p-5 sm:p-7">
            <div className="flex items-center gap-2 mb-5 sm:mb-7">
              <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-500/50 shrink-0" />
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.15em]">
                Loja Física → Online
              </span>
            </div>
            <AnimatedSteps steps={physicalFlow} accent="bg-emerald-600" dotBg="emerald" />
          </div>

          {/* Online → Physical */}
          <div className="rounded-2xl border border-white/8 bg-surface-800 p-5 sm:p-7">
            <div className="flex items-center gap-2 mb-5 sm:mb-7">
              <div className="w-2 h-2 rounded-full bg-brand-400 shadow-lg shadow-brand-500/50 shrink-0" />
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.15em]">
                Online → Loja Física
              </span>
            </div>
            <AnimatedSteps steps={onlineFlow} accent="bg-brand-600" dotBg="brand" />
          </div>
        </div>

        {/* connector */}
        <div className="flex items-center justify-center gap-3 mt-6 sm:mt-8 text-xs text-slate-600">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" />
          <span className="px-3 border border-white/8 rounded-full py-1 bg-surface-700 whitespace-nowrap text-center">
            sincronização bidirecional em tempo real
          </span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10" />
        </div>
      </div>
    </section>
  )
}
