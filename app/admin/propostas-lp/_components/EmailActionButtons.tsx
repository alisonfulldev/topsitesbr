'use client'

import { useState, useTransition } from 'react'
import { sendReminderEmail, sendReactivationEmail } from '../actions'

function fmtDate(d: Date | string | null) {
  if (!d) return null
  return new Date(d).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export function ReminderButton({
  proposalId,
  reminderSentAt,
}: {
  proposalId: string
  reminderSentAt: Date | null
}) {
  const [isPending, startTransition] = useTransition()
  const [sentAt, setSentAt] = useState<Date | null>(reminderSentAt)
  const [error, setError] = useState<string | null>(null)
  const [count, setCount] = useState<number | null>(null)

  function handle() {
    setError(null)
    setCount(null)
    startTransition(async () => {
      const res = await sendReminderEmail(proposalId)
      if (res.error) { setError(res.error); return }
      setSentAt(new Date())
      setCount(res.sent ?? null)
    })
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={handle}
        disabled={isPending}
        className="px-3 py-1.5 text-xs font-semibold bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-60 whitespace-nowrap"
      >
        {isPending ? 'Enviando…' : 'Enviar lembrete'}
      </button>
      {sentAt && !error && (
        <p className="text-xs text-gray-400">
          {count != null ? `Enviado para ${count} lead(s) em ` : 'Lembrete enviado em '}
          {fmtDate(sentAt)}
        </p>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

export function ReactivationButton({
  proposalId,
  reactivationSentAt,
}: {
  proposalId: string
  reactivationSentAt: Date | null
}) {
  const [isPending, startTransition] = useTransition()
  const [sentAt, setSentAt] = useState<Date | null>(reactivationSentAt)
  const [error, setError] = useState<string | null>(null)
  const [count, setCount] = useState<number | null>(null)

  function handle() {
    setError(null)
    setCount(null)
    startTransition(async () => {
      const res = await sendReactivationEmail(proposalId)
      if (res.error) { setError(res.error); return }
      setSentAt(new Date())
      setCount(res.sent ?? null)
    })
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={handle}
        disabled={isPending}
        className="px-3 py-1.5 text-xs font-semibold bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors disabled:opacity-60 whitespace-nowrap"
      >
        {isPending ? 'Enviando…' : 'Enviar reativação'}
      </button>
      {sentAt && !error && (
        <p className="text-xs text-gray-400">
          {count != null ? `Enviado para ${count} lead(s) em ` : 'Reativação enviada em '}
          {fmtDate(sentAt)}
        </p>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
