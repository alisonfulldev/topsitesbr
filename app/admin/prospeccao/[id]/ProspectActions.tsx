'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { ProspectStatus } from '@prisma/client'
import { Button } from '@/components/ui'
import { activateAction, deleteDraftAction, markRepliedAction, pauseAction, sendTestAction } from '../actions'

type Res = { ok: true } | { ok: false; error: string }

export function ProspectActions({ id, status, testEmail }: { id: string; status: ProspectStatus; testEmail: string }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null)

  const run = (action: () => Promise<Res>, success: string, confirmText?: string) => {
    if (confirmText && !window.confirm(confirmText)) return
    start(async () => {
      const res = await action()
      setMessage(res.ok ? { text: success } : { text: res.error, error: true })
      if (res.ok) router.refresh()
    })
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {(status === 'rascunho' || status === 'pausado') && (
          <Button loading={pending} onClick={() => run(() => activateAction(id), status === 'pausado' ? 'Sequência retomada.' : 'Sequência ativada.')}>
            {status === 'pausado' ? 'Retomar' : 'Aprovar e ativar'}
          </Button>
        )}
        {status === 'ativo' && (
          <Button variant="secondary" loading={pending} onClick={() => run(() => pauseAction(id), 'Pausado. Nenhum e-mail sai até você retomar.')}>
            Pausar
          </Button>
        )}
        {['ativo', 'pausado', 'finalizado', 'interessado'].includes(status) && (
          <Button
            variant="secondary"
            loading={pending}
            onClick={() => run(() => markRepliedAction(id), 'Marcado como respondeu. Envios futuros cancelados.', 'Marcar como respondeu? Os próximos e-mails serão cancelados.')}
          >
            Marcar como respondeu
          </Button>
        )}
        <Button
          variant="secondary"
          loading={pending}
          onClick={() => run(
            async () => {
              const res = await sendTestAction(id)
              return res.ok ? { ok: true } : res
            },
            'Sequência de teste enviada para ' + testEmail + '.',
            'Enviar os 5 e-mails agora para ' + testEmail + '?',
          )}
        >
          Enviar teste para mim
        </Button>
        {status === 'rascunho' && (
          <Button
            variant="danger"
            loading={pending}
            onClick={() => run(
              async () => {
                const res = await deleteDraftAction(id)
                if (res.ok) router.push('/admin/prospeccao')
                return res
              },
              'Rascunho excluído.',
              'Excluir este rascunho?',
            )}
          >
            Excluir
          </Button>
        )}
      </div>
      {message && <p role="status" className={'mt-3 text-sm ' + (message.error ? 'text-red-700' : 'text-green-700')}>{message.text}</p>}
    </div>
  )
}
