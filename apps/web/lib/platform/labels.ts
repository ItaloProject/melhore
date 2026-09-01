import type { PlatformStoreRow } from '@/lib/queries/platform'
import { storeAccess } from '@/lib/auth/platform'

export function accountLabel(status: string) {
  return status === 'inactive' ? 'Inativa' : 'Ativa'
}

export function billingLabel(status: string) {
  if (status === 'paid') return 'Em dia'
  if (status === 'trial') return 'Trial'
  if (status === 'past_due') return 'Atrasada'
  return 'Sem pagamento'
}

export function accessLabel(store: PlatformStoreRow) {
  const access = storeAccess(store)
  if (access === 'ok') return 'Liberada'
  if (access === 'grace') return 'Carência (1 mês)'
  return 'Bloqueada — pode voltar pagando'
}
