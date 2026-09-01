'use client'

import { useRef, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger)

export function CtaSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sectionRef.current || !contentRef.current) return

    gsap.to('.cta-glow', {
      y: -40, ease: 'none',
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top bottom', end: 'bottom top',
        scrub: 1.5,
      },
    })

    gsap.fromTo(
      contentRef.current.children,
      { opacity: 0, y: 30 },
      {
        opacity: 1, y: 0,
        duration: 0.7, stagger: 0.12, ease: 'power2.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 78%', once: true },
      }
    )
  }, [])

  return (
    <section ref={sectionRef} className="py-24 sm:py-32 px-4 sm:px-6 relative overflow-hidden">
      <div className="cta-glow absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(500px,80vw)] h-[min(500px,80vw)] bg-brand-700/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-mesh-brand opacity-50 pointer-events-none" />

      <div ref={contentRef} className="relative mx-auto max-w-3xl text-center space-y-5 sm:space-y-6">
        <p style={{ opacity: 0 }} className="text-xs font-semibold text-brand-400 tracking-[0.2em] uppercase">
          Comece agora
        </p>

        <h2
          style={{ opacity: 0, fontSize: 'clamp(2rem, 5vw, 4rem)' }}
          className="font-bold text-white leading-tight"
          dangerouslySetInnerHTML={{ __html: 'Comece a&nbsp;<span class="text-gradient">melhorar</span><br/>sua loja hoje' }}
        />

        <p style={{ opacity: 0 }} className="text-slate-400 text-base sm:text-lg">
          Configure em minutos. Sem cartão de crédito.
        </p>

        <div style={{ opacity: 0 }} className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/cadastro"
            className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-brand-600 hover:bg-brand-500 text-white rounded-2xl font-semibold text-lg transition-all shadow-2xl shadow-brand-900/60 hover:shadow-brand-800/50 hover:-translate-y-0.5 w-full sm:w-auto"
          >
            Criar minha loja agora
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  )
}
