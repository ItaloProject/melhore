'use client'

import { useRef } from 'react'
import { useScrollReveal, useCountUp } from '@/hooks/use-gsap'

const stats = [
  { value: 1200, suffix: '+',   prefix: '',  label: 'Lojas ativas'        },
  { value: 98,   suffix: '%',   prefix: '',  label: 'Satisfação'           },
  { value: 4500, suffix: 'k',   prefix: '',  label: 'Vendas registradas'   },
  { value: 5,    suffix: 'min', prefix: '<', label: 'Para configurar'      },
]

function CountStat({ value, prefix, suffix, label }: typeof stats[0]) {
  const numRef = useRef<HTMLSpanElement>(null)
  useCountUp(numRef, value, { prefix, suffix })

  return (
    <div className="text-center px-4 py-6 sm:py-8">
      <div className="font-bold text-white mb-1 tabular-nums"
        style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
        <span ref={numRef}>0</span>
      </div>
      <p className="text-sm sm:text-base text-slate-500">{label}</p>
    </div>
  )
}

export function StatsSection() {
  const wrapRef = useRef<HTMLDivElement>(null)
  useScrollReveal(wrapRef, { y: 20, stagger: 0.1 })

  return (
    <section className="border-y border-white/5 bg-surface-900 px-4 sm:px-6">
      <div
        ref={wrapRef}
        className="mx-auto max-w-7xl grid grid-cols-2 lg:grid-cols-4 divide-x divide-white/5"
      >
        {stats.map((s) => (
          <CountStat key={s.label} {...s} />
        ))}
      </div>
    </section>
  )
}
