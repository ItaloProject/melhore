'use client'

import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger)

const metrics = [
  {
    pct: 76,
    to: 1200, suffix: '+', prefix: '',
    label: 'Lojas ativas',
    note: 'e crescendo',
    color: '#f59e0b',
    glow: 'rgba(245,158,11,0.5)',
  },
  {
    pct: 98,
    to: 98, suffix: '%', prefix: '',
    label: 'Satisfação',
    note: 'dos clientes',
    color: '#34d399',
    glow: 'rgba(52,211,153,0.5)',
  },
  {
    pct: 65,
    to: 4500, suffix: '', prefix: '',
    label: 'Vendas / mês',
    note: 'em toda a plataforma',
    color: '#60a5fa',
    glow: 'rgba(96,165,250,0.5)',
  },
  {
    pct: 8,
    to: 5, suffix: ' min', prefix: '<',
    label: 'Para configurar',
    note: 'do zero ao PDV',
    color: '#c4b5fd',
    glow: 'rgba(196,181,253,0.5)',
  },
]

export function StatsSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const barRefs    = useRef<(HTMLDivElement | null)[]>([])
  const numRefs    = useRef<(HTMLSpanElement | null)[]>([])

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    metrics.forEach((m, i) => {
      const bar = barRefs.current[i]
      const num = numRefs.current[i]

      // bar grows from 0 → pct%
      if (bar) {
        gsap.fromTo(
          bar,
          { width: '0%' },
          {
            width: `${m.pct}%`,
            duration: 1.4,
            ease: 'power3.out',
            delay: i * 0.1,
            scrollTrigger: { trigger: section, start: 'top 78%', once: true },
          }
        )
      }

      // number counts up
      if (num && m.to > 1) {
        const obj = { n: 0 }
        gsap.to(obj, {
          n: m.to,
          duration: 1.4,
          ease: 'power3.out',
          delay: i * 0.1,
          onUpdate() {
            const v = Math.round(obj.n)
            const formatted = v >= 1000
              ? v.toLocaleString('pt-BR')
              : String(v)
            if (num) num.textContent = m.prefix + formatted + m.suffix
          },
          scrollTrigger: { trigger: section, start: 'top 78%', once: true },
        })
      }
    })
  }, [])

  return (
    <section
      ref={sectionRef}
      className="py-14 sm:py-20 px-4 sm:px-6 border-y border-white/[0.06]"
      style={{ background: 'linear-gradient(180deg, #100D09 0%, #0C0A07 100%)' }}
    >
      <div className="mx-auto max-w-4xl">

        {/* desktop: bar layout */}
        <div className="hidden sm:block space-y-8">
          {metrics.map((m, i) => (
            <div key={m.label} className="flex items-center gap-6 group">

              {/* label col */}
              <div className="w-48 shrink-0 text-right">
                <p className="text-[11px] font-semibold text-stone-300 uppercase tracking-[0.18em]">
                  {m.label}
                </p>
                <p className="text-[10px] text-stone-600 mt-0.5">{m.note}</p>
              </div>

              {/* track */}
              <div className="relative flex-1 h-px bg-white/[0.07]">
                {/* animated fill */}
                <div
                  ref={el => { barRefs.current[i] = el }}
                  className="absolute inset-y-0 left-0 h-px"
                  style={{
                    background: `linear-gradient(90deg, ${m.color}20 0%, ${m.color} 100%)`,
                    width: '0%',
                  }}
                >
                  {/* glowing dot at bar tip */}
                  <div
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-[7px] h-[7px] rounded-full"
                    style={{
                      background: m.color,
                      boxShadow: `0 0 10px 2px ${m.glow}`,
                    }}
                  />
                </div>
              </div>

              {/* value */}
              <div className="w-24 shrink-0">
                <span
                  ref={el => { numRefs.current[i] = el }}
                  className="text-2xl font-bold tabular-nums tracking-tight"
                  style={{ color: m.color }}
                >
                  {m.prefix}0{m.suffix}
                </span>
              </div>

            </div>
          ))}
        </div>

        {/* mobile: 2×2 grid */}
        <div className="grid grid-cols-2 gap-px sm:hidden border border-white/[0.06] rounded-2xl overflow-hidden">
          {metrics.map((m, i) => (
            <div
              key={m.label}
              className="flex flex-col items-center justify-center py-8 px-4 bg-surface-800"
            >
              <span
                className="text-3xl font-bold tabular-nums"
                style={{ color: m.color }}
              >
                {m.prefix}{m.to.toLocaleString('pt-BR')}{m.suffix}
              </span>
              <p className="text-[11px] text-stone-500 uppercase tracking-widest mt-1.5 text-center">
                {m.label}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
