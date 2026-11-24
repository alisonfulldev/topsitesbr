'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Card } from '@/components/ui'
import { WA_CATEGORY, type WaCategoryKey } from '@/lib/whatsapp/labels'
import { reanalyzeAction, releaseCategoryAction, setCategoryAction, setOptOutAction, setPausedAction } from '../actions'

interface Props {
  id: string
  category: WaCategoryKey
  categoryByAdmin: boolean
  aiPaused: boolean
  optedOut: boolean
  humanActive: boolean
}

const OPTIONS: WaCategoryKey[] = ['lead', 'cliente', 'pessoal', 'revisar']

export function ContactControls({ id, category, categoryByAdmin, aiPaused, optedOut, humanActive }: Props) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null)

  const run = (fn: () => Promise<{ ok: true } | { ok: false; error: string }>, done: string) =>
    start(async () => {
      const res = await fn()
      setMessage(res.ok ? { text: done } : { text: res.error, error: true })
      if (res.ok) router.refresh()
    })

  return (
    <Card>
      <h3 className="mb-3 text-sm font-semibold text-gray-900">Controles</h3>

      <p className="mb-1.5 text-xs font-medium text-gray-700">Categoria {categoryByAdmin ? '(definida por você)' : '(definida pela IA)'}</p>
      <div className="mb-2 flex flex-wrap gap-1.5">
        {OPTIONS.map((opt) => (
          <button
            key={opt}
            type="button"
            disabled={pending}
            onClick={() => run(() => setCategoryAction(id, opt), 'Categoria salva. A IA não muda mais.')}
            className={
              'rounded-full border px-3 py-1 text-xs transition-colors ' +
              (category === opt ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-300 text-gray-700 hover:border-gray-500')
            }
          >
            {WA_CATEGORY[opt].label}
          </button>
        ))}
      </div>
      {categoryByAdmin && (
        <button type="button" className="mb-3 text-xs text-gray-500 underline" disabled={pending} onClick={() => run(() => releaseCategoryAction(id), 'A IA vai reclassificar na próxima rodada.')}>
          Deixar a IA decidir de novo
        </button>
      )}
      <p className="mb-4 text-[11px] text-gray-500">Pessoal e A revisar nunca recebem mensagens automáticas.</p>

      <div className="space-y-2">
        <Button
          size="sm"
          fullWidth
          variant="secondary"
          loading={pending}
          onClick={() => run(() => setPausedAction(id, !(aiPaused || humanActive)), aiPaused || humanActive ? 'IA liberada para este contato.' : 'IA pausada para este contato.')}
        >
          {aiPaused || humanActive ? 'Liberar a IA para este contato' : 'Pausar a IA para este contato'}
        </Button>
        <Button
          size="sm"
          fullWidth
          variant="secondary"
          loading={pending}
          onClick={() => run(() => setOptOutAction(id, !optedOut), optedOut ? 'Contato volta a receber mensagens.' : 'Contato descadastrado.')}
        >
          {optedOut ? 'Remover descadastro' : 'Nunca enviar para este contato'}
        </Button>
        <Button size="sm" fullWidth variant="ghost" loading={pending} onClick={() => run(() => reanalyzeAction(id), 'Analisado de novo.')}>
          Reanalisar com a IA agora
        </Button>
      </div>

      {message && <p role="status" className={'mt-3 text-xs ' + (message.error ? 'text-red-700' : 'text-green-700')}>{message.text}</p>}
    </Card>
  )
}
