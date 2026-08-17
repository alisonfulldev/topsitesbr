'use client'

import { useTransition } from 'react'
import { stopImpersonationAction } from '@/app/admin/clientes/[id]/actions'

export function ImpersonationBanner({ clientName }: { clientName: string }) {
  const [isPending, startTransition] = useTransition()

  function handleStop() {
    startTransition(async () => {
      await stopImpersonationAction()
    })
  }

  return (
    <div className="fixed top-0 inset-x-0 z-[100] bg-amber-500 text-black flex items-center justify-between px-4 py-2 text-sm font-medium shadow-md">
      <span>
        Modo visualização — você está vendo o painel de{' '}
        <strong>{clientName}</strong>
      </span>
      <button
        onClick={handleStop}
        disabled={isPending}
        className="ml-4 px-3 py-1 bg-black/10 hover:bg-black/20 rounded-md text-xs font-semibold transition-colors disabled:opacity-60"
      >
        {isPending ? 'Saindo…' : 'Voltar ao painel admin'}
      </button>
    </div>
  )
}
