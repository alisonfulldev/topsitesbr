'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui'
import { runQueueNowAction } from '../actions'

// Roda a fila na hora (mesmas regras do cron: janela, dias úteis e limite diário)
export function RunQueueButton() {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [message, setMessage] = useState('')

  return (
    <div className="flex flex-wrap items-center gap-3">
      {message && <span className="text-xs">{message}</span>}
      <Button
        size="sm"
        variant="secondary"
        loading={pending}
        onClick={() => start(async () => {
          const res = await runQueueNowAction()
          if (!res.ok) return setMessage(res.error)
          const r = res.result
          setMessage(r.skipped ?? `${r.sent} enviado(s)${r.failed ? `, ${r.failed} falha(s)` : ''}.`)
          router.refresh()
        })}
      >
        Rodar fila agora
      </Button>
    </div>
  )
}
