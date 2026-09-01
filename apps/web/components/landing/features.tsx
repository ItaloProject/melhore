'use client'

import { useRef } from 'react'
import { Package, CreditCard, Globe, Zap, BarChart3, ShoppingBag } from 'lucide-react'
import { useScrollReveal, useFadeUp } from '@/hooks/use-gsap'

const features = [
  {
    icon: Package,
    title: 'Estoque por variação',
    desc: 'Controle individual por tamanho e cor. Alertas automáticos quando o nível cai abaixo do mínimo.',
    accent: 'from-violet-500/15 to-transparent',
    iconBg: 'bg-violet-500/10',
    iconColor: 'text-violet-400',
  },
  {
    icon: CreditCard,
    title: 'PDV + Caixa',
    desc: 'Venda no balcão com Pix, crédito, débito ou dinheiro. Abra e feche o caixa com conferência.',
    accent: 'from-blue-500/15 to-transparent',
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-400',
  },
  {
    icon: Globe,
    title: 'Vitrine Online',
    desc: 'Cada loja tem sua URL própria. O estoque físico alimenta o digital em tempo real — zero retrabalho.',
    accent: 'from-emerald-500/15 to-transparent',
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-400',
  },
  {
    icon: Zap,
    title: 'Sincronização total',
    desc: 'Venda no balcão → estoque cai na vitrine. Reserva online → lojista recebe e confirma.',
    accent: 'from-amber-500/15 to-transparent',
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-400',
  },
  {
    icon: BarChart3,
    title: 'Relatórios',
    desc: 'Faturamento, ticket médio, produtos mais vendidos e breakdown por forma de pagamento.',
    accent: 'from-pink-500/15 to-transparent',
    iconBg: 'bg-pink-500/10',
    iconColor: 'text-pink-400',
  },
  {
    icon: ShoppingBag,
    title: 'Multi-loja',
    desc: 'Cada loja tem identidade, estoque e gestão próprios. Uma plataforma para quantas lojas precisar.',
    accent: 'from-cyan-500/15 to-transparent',
    iconBg: 'bg-cyan-500/10',
    iconColor: 'text-cyan-400',
  },
]

export function FeaturesSection() {
  const headRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  useFadeUp(headRef, { y: 20 })
  useScrollReveal(gridRef, { y: 36, stagger: 0.07 })

  return (
    <section id="features" className="py-20 sm:py-28 px-4 sm:px-6">
      <div className="mx-auto max-w-7xl">

        <div ref={headRef} style={{ opacity: 0 }} className="text-center mb-12 sm:mb-16">
          <p className="text-xs font-semibold text-brand-400 tracking-[0.2em] uppercase mb-3">
            Plataforma completa
          </p>
          <h2 className="font-bold text-white leading-tight mb-4"
            style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)' }}>
            Tudo que sua loja precisa
          </h2>
          <p className="text-slate-400 max-w-lg mx-auto text-base sm:text-lg">
            De um único lugar, controle tudo — sem abrir planilha, sem duplicar informação.
          </p>
        </div>

        <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="relative rounded-2xl border border-white/8 bg-surface-800 p-5 sm:p-6 overflow-hidden group hover:border-brand-500/30 transition-colors cursor-default"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${f.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className="relative">
                <div className={`w-10 h-10 rounded-xl ${f.iconBg} border border-white/10 flex items-center justify-center mb-4 sm:mb-5`}>
                  <f.icon className={`w-5 h-5 ${f.iconColor}`} />
                </div>
                <h3 className="font-semibold text-white mb-2 text-[15px]">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
