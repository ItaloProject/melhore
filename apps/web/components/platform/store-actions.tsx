'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  clearStoreView,
  downloadStoreBackup,
  markStoreUnpaid,
  openStorePanel,
  setStoreStatus,
} from '@/lib/actions/platform'

export function StatusButtons({
  storeId,
  active,
}: {
  storeId: string
  active: boolean
}) {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function toggle() {
    setLoading(true)
    setError('')
    const result = await setStoreStatus(storeId, active ? 'inactive' : 'active')
    setLoading(false)
    if (result.error) setError(result.error)
    else window.location.reload()
  }

  return (
    <div className="space-y-2">
      <Button type="button" variant={active ? 'danger' : 'primary'} loading={loading} onClick={toggle}>
        {active ? 'Inativar loja' : 'Reativar loja'}
      </Button>
      {error && <p className="text-xs text-rose-400">{error}</p>}
    </div>
  )
}

export function OpenStoreButton({ storeId }: { storeId: string }) {
  return (
    <form action={openStorePanel}>
      <input type="hidden" name="storeId" value={storeId} />
      <Button type="submit" variant="primary">Abrir painel da loja</Button>
    </form>
  )
}

export function ExitViewButton() {
  return (
    <form action={clearStoreView}>
      <button type="submit" className="text-xs font-medium text-brand-200 hover:text-white">
        Sair da loja e voltar à plataforma
      </button>
    </form>
  )
}

export function UnpaidButton({ storeId }: { storeId: string }) {
  return (
    <form action={markStoreUnpaid}>
      <input type="hidden" name="storeId" value={storeId} />
      <Button type="submit" variant="outline">Marcar mensalidade atrasada</Button>
    </form>
  )
}

export function BackupButton({ storeId, slug }: { storeId: string; slug: string }) {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handle() {
    setLoading(true)
    setError('')
    const result = await downloadStoreBackup(storeId)
    setLoading(false)
    if ('error' in result && result.error) {
      setError(result.error)
      return
    }
    if (!('payload' in result)) return
    const blob = new Blob([JSON.stringify(result.payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `melhore-${slug}-backup.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-2">
      <Button type="button" variant="dark" loading={loading} onClick={handle}>
        Baixar backup JSON
      </Button>
      {error && <p className="text-xs text-rose-400">{error}</p>}
    </div>
  )
}
