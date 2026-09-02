import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import { DeveloperCredit } from '@/components/brand/developer-credit'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: { default: 'Melhore', template: '%s — Melhore' },
  description: 'Gestão completa para lojas de roupa. Estoque, PDV, caixa e vitrine online em tempo real.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body>
        {children}
        <DeveloperCredit />
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}
