import { ExitViewButton } from '@/components/platform/store-actions'

export function ImpersonationBanner() {
  return (
    <div className="bg-brand-700 text-white text-xs px-4 py-2 flex items-center justify-between gap-3">
      <p>Você está no painel desta loja como dono da plataforma. As edições valem de verdade.</p>
      <ExitViewButton />
    </div>
  )
}
