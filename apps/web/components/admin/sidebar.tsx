'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  CreditCard,
  BarChart3,
  Settings,
  LogOut,
  Store,
  ChevronDown,
  Bell,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/admin',            icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/produtos',   icon: Package,          label: 'Produtos' },
  { href: '/admin/estoque',    icon: Store,            label: 'Estoque' },
  { href: '/admin/vendas',     icon: ShoppingCart,     label: 'Vendas / PDV' },
  { href: '/admin/caixa',      icon: CreditCard,       label: 'Caixa' },
  { href: '/admin/relatorios', icon: BarChart3,        label: 'Relatórios' },
]

function Logo() {
  return (
    <span className="text-base font-bold tracking-[0.06em] text-white">
      MELHOR<span className="text-brand-400 logo-e">E</span>
    </span>
  )
}

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex flex-col w-56 shrink-0 bg-surface-900 border-r border-white/5">
      {/* Top bar */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-white/5">
        <Logo />
        <button className="relative p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-slate-200 transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-brand-500" />
        </button>
      </div>

      {/* Store selector */}
      <div className="px-3 py-3 border-b border-white/5">
        <button className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-white/5 text-left transition-colors group">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-lg shadow-brand-900/50">
            M
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">Minha Loja</p>
            <p className="text-xs text-slate-500 truncate">minha-loja</p>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0 group-hover:text-slate-400 transition-colors" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto scrollbar-dark">
        <p className="px-3 mb-2 text-[10px] font-semibold text-slate-600 uppercase tracking-widest">
          Gestão
        </p>
        {navItems.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== '/admin' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                active
                  ? 'bg-brand-600/20 text-brand-300'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
              )}
            >
              <item.icon
                className={cn(
                  'w-4 h-4 shrink-0',
                  active ? 'text-brand-400' : 'text-slate-500'
                )}
              />
              {item.label}
            </Link>
          )
        })}

        <div className="pt-3 mt-3 border-t border-white/5">
          <p className="px-3 mb-2 text-[10px] font-semibold text-slate-600 uppercase tracking-widest">
            Loja
          </p>
          <Link
            href="/admin/config"
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
              pathname.startsWith('/admin/config')
                ? 'bg-brand-600/20 text-brand-300'
                : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
            )}
          >
            <Settings className={cn('w-4 h-4 shrink-0', pathname.startsWith('/admin/config') ? 'text-brand-400' : 'text-slate-500')} />
            Configurações
          </Link>
        </div>
      </nav>

      {/* Footer / user */}
      <div className="px-3 pb-4 pt-2 border-t border-white/5 space-y-1">
        {/* user row */}
        <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl">
          <div className="w-7 h-7 rounded-full bg-slate-700 text-slate-300 text-xs font-bold flex items-center justify-center shrink-0">
            U
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-300 truncate">Usuário</p>
            <p className="text-[10px] text-slate-600 truncate">usuario@email.com</p>
          </div>
        </div>

        <button className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 w-full transition-colors">
          <LogOut className="w-4 h-4" />
          Sair
        </button>
      </div>
    </aside>
  )
}
