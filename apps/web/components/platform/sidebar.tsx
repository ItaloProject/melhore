'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Store,
  CreditCard,
  ArrowLeft,
  Shield,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const items = [
  { href: '/plataforma', label: 'Visão geral', icon: LayoutDashboard },
  { href: '/plataforma/lojas', label: 'Lojas', icon: Store },
  { href: '/plataforma/mensalidades', label: 'Mensalidades', icon: CreditCard },
]

export function PlatformSidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex flex-col w-56 shrink-0 bg-slate-950 border-r border-white/5">
      <div className="h-14 flex items-center gap-2 px-4 border-b border-white/5">
        <Shield className="w-4 h-4 text-brand-400" />
        <div>
          <p className="text-sm font-bold tracking-[0.06em] text-white">MELHORE</p>
          <p className="text-[10px] uppercase tracking-widest text-brand-300/80">Plataforma</p>
        </div>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-0.5">
        {items.map((item) => {
          const active =
            pathname === item.href || (item.href !== '/plataforma' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                active ? 'bg-brand-600/20 text-brand-200' : 'text-slate-400 hover:bg-white/5 hover:text-white'
              )}
            >
              <item.icon className={cn('w-4 h-4', active ? 'text-brand-400' : 'text-slate-500')} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-white/5">
        <Link
          href="/admin"
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-500 hover:text-white hover:bg-white/5"
        >
          <ArrowLeft className="w-4 h-4" />
          Painel da loja
        </Link>
      </div>
    </aside>
  )
}
