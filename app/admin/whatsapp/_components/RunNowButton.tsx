'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui'
import { runNowAction } from '../actions'

// Roda uma rodada da IA na hora (mesmas regras do cron que roda a cada minuto)
export function RunNowButton() {
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
          const res = await runNowAction()
          if (!res.ok) return setMessage(res.error)
          const r = res.result
          setMessage(r.skipped ?? `${r.respostas} resposta(s), ${r.followUps} follow-up(s), ${r.ofertas} oferta(s), ${r.classificados} analisado(s)${r.erros ? `, ${r.erros} erro(s)` : ''}.`)
          router.refresh()
        })}
      >
        Rodar agora
      </Button>
    </div>
  )
}
