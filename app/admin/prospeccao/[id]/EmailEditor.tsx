'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui'
import { updateEmailAction } from '../actions'

const field = 'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-gray-500 focus:outline-none'

// Edição de um e-mail ainda não enviado; os enviados aparecem só para leitura
export function EmailEditor({ id, subject, body, editable }: { id: string; subject: string; body: string; editable: boolean }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [draft, setDraft] = useState({ subject, body })
  const [message, setMessage] = useState('')
  const changed = draft.subject !== subject || draft.body !== body

  if (!editable) {
    return (
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-800">{subject}</p>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">{body}</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <input aria-label="Assunto" value={draft.subject} onChange={(e) => setDraft({ ...draft, subject: e.target.value })} className={field} />
      <textarea aria-label="Corpo" value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} rows={10} className={field + ' leading-relaxed'} />
      <div className="flex items-center gap-3">
        <Button
          size="sm"
          disabled={!changed}
          loading={pending}
          onClick={() => start(async () => {
            const res = await updateEmailAction(id, draft.subject, draft.body)
            setMessage(res.ok ? 'Salvo.' : res.error)
            if (res.ok) router.refresh()
          })}
        >
          Salvar alterações
        </Button>
        {message && <span className="text-xs text-gray-600">{message}</span>}
      </div>
    </div>
  )
}
