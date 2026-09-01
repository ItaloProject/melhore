import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/auth/session'
import { getViewStoreId, isPlatformAdmin, storeAccess } from '@/lib/auth/platform'
import { createClient } from '@/lib/supabase/server'
import { AdminSidebar } from '@/components/admin/sidebar'
import { ImpersonationBanner } from '@/components/admin/impersonation-banner'
import { LockedStoreNotice } from '@/components/admin/locked-store'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser()
  if (!user) redirect('/login')

  const platform = await isPlatformAdmin(user)
  const viewing = platform ? getViewStoreId() : null

  let locked = false
  if (!viewing && !platform) {
    const supabase = createClient()
    const { data: membership } = await supabase
      .from('store_users')
      .select('store_id')
      .eq('user_id', user.id)
      .maybeSingle()
    if (membership) {
      const { data: store } = await supabase
        .from('stores')
        .select('account_status, billing_status, trial_ends_at, current_period_end, grace_until')
        .eq('id', membership.store_id)
        .maybeSingle()
      locked = !!store && storeAccess(store) === 'locked'
    }
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50">
      {viewing && <ImpersonationBanner />}
      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar showPlatform={platform} />
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          {locked ? <LockedStoreNotice /> : children}
        </main>
      </div>
    </div>
  )
}
