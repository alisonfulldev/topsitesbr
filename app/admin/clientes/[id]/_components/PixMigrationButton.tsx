'use client'

import { useState, useTransition } from 'react'
import { migrateClientToPixAction } from '../mensal-actions'

export function PixMigrationButton({ clientId }: { clientId: string }) {
  const [msg, setMsg] = useState('')
  const [isPending, startTransition] = useTransition()
  return (
    <span className="inline-flex flex-col gap-1">
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          if (!window.confirm('Migrar este cliente para o Pix Automático agora? A cobrança pendente e a assinatura antiga são removidas no Asaas e o cliente é avisado por e-mail.')) return
          startTransition(async () => {
            const r = await migrateClientToPixAction(clientId)
            setMsg(r.error ? `Não migrou: ${r.error}` : r.message ?? 'Migrado.')
          })
        }}
        className="self-start px-2.5 py-1 text-xs rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
      >
        {isPending ? 'Migrando…' : 'Migrar para Pix Automático agora'}
      </button>
      {msg && <span className="text-xs text-gray-600">{msg}</span>}
    </span>
  )
}
