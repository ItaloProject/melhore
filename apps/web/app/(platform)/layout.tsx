import { requirePlatformAdmin } from '@/lib/auth/platform'
import { isPinVerified } from '@/lib/auth/admin-pin'
import { redirect } from 'next/navigation'
import { PlatformSidebar } from '@/components/platform/sidebar'

export const dynamic = 'force-dynamic'

export default async function PlatformLayout({ children }: { children: React.ReactNode }) {
  await requirePlatformAdmin()
  if (!isPinVerified()) redirect('/admin/pin')

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-white">
      <PlatformSidebar />
      <main className="flex-1 overflow-y-auto scrollbar-dark">
        {children}
      </main>
    </div>
  )
}
