import { requirePlatformAdmin } from '@/lib/auth/platform'
import { PlatformSidebar } from '@/components/platform/sidebar'

export const dynamic = 'force-dynamic'

export default async function PlatformLayout({ children }: { children: React.ReactNode }) {
  await requirePlatformAdmin()

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-white">
      <PlatformSidebar />
      <main className="flex-1 overflow-y-auto scrollbar-dark">
        {children}
      </main>
    </div>
  )
}
