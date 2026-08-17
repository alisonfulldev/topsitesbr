'use client'

import { useTransition } from 'react'
import { startImpersonationAction } from '../actions'

export function ImpersonateButton({
  clientId,
  clientName,
}: {
  clientId: string
  clientName: string
}) {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    startTransition(async () => {
      await startImpersonationAction(clientId, clientName)
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
      title="Ver painel exatamente como o cliente vê (modo visualização)"
    >
      {isPending ? 'Acessando…' : 'Acessar como cliente'}
    </button>
  )
}
