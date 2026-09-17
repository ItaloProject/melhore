import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { HeroSection } from '@/components/landing/hero'
import { FeaturesSection } from '@/components/landing/features'
import { FlowSection } from '@/components/landing/flow'
import { StatsSection } from '@/components/landing/stats'
import { CtaSection } from '@/components/landing/cta'
import { DownloadSection } from '@/components/landing/download'
import { BrandLogo } from '@/components/brand/logo'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-warm-950 text-white overflow-x-hidden">

      {/* ── Nav ── */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/[0.06] bg-warm-950/85 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between">
          <BrandLogo size={36} className="text-lg" />

          <div className="hidden md:flex items-center gap-1 text-sm text-stone-400">
            <Link href="#features" className="px-3 py-2 hover:text-white transition-colors rounded-lg hover:bg-white/5">Funcionalidades</Link>
            <Link href="#flow"     className="px-3 py-2 hover:text-white transition-colors rounded-lg hover:bg-white/5">Como funciona</Link>
            <Link href="#download" className="px-3 py-2 hover:text-white transition-colors rounded-lg hover:bg-white/5">Download</Link>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden sm:block px-3 py-2 text-sm text-stone-400 hover:text-white transition-colors"
            >
              Entrar
            </Link>
            <Link
              href="/cadastro"
              className="group inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-amber-900/30"
            >
              Começar grátis
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </nav>

      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <FlowSection />
      <DownloadSection />
      <CtaSection />

      {/* ── Footer ── */}
      <footer className="border-t border-white/[0.06] py-8 px-4 sm:px-6 bg-warm-950">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <BrandLogo size={36} className="text-lg" />
          <p className="text-sm text-stone-600 order-last sm:order-none">
            © {new Date().getFullYear()} Melhore. Todos os direitos reservados.
          </p>
          <div className="flex gap-5 text-sm text-stone-500">
            <Link href="/privacidade" className="hover:text-stone-300 transition-colors">Privacidade</Link>
            <Link href="/termos"      className="hover:text-stone-300 transition-colors">Termos</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
