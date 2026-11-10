'use client'

import { useState, useTransition } from 'react'
import {
  cancelProposalAction,
  extendExpirationAction,
  resendEmailAction,
  sendPreviewAction,
  setSequencePausedAction,
  updatePreviewAction,
} from '../actions'

const BTN = 'px-3 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50'

export function ProposalAdminActions({ id, status, link, sequencePaused, unsubscribed }: { id: string; status: string; link: string; sequencePaused: boolean; unsubscribed: boolean }) {
  const [msg, setMsg] = useState('')
  const [isPending, startTransition] = useTransition()
  const canSendPreview = ['prospect', 'ajuste_solicitado', 'previa_enviada'].includes(status)
  const closed = ['ativo', 'cancelada'].includes(status)

  function run(fn: () => Promise<{ error?: string }>, ok: string, confirmText?: string) {
    if (confirmText && !window.confirm(confirmText)) return
    setMsg('')
    startTransition(async () => {
      const r = await fn()
      setMsg(r.error ? `Erro: ${r.error}` : ok)
    })
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4 space-y-4">
      <div>
        <p className="text-xs text-gray-500 mb-1">Link do prospect</p>
        <div className="flex gap-2">
          <input readOnly value={link} onFocus={(e) => e.currentTarget.select()} className="flex-1 min-w-0 border border-gray-300 rounded-lg px-3 py-2 text-xs font-mono bg-gray-50" />
          <button type="button" className={BTN} onClick={() => navigator.clipboard.writeText(link).then(() => setMsg('Link copiado.'))}>Copiar</button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {canSendPreview && (
          <button
            type="button"
            disabled={isPending}
            className="px-3 py-2 text-sm rounded-lg bg-gray-900 text-white hover:bg-gray-700 disabled:opacity-50"
            onClick={() => run(() => sendPreviewAction(id), 'Prévia enviada e sequência de e-mails iniciada.', status === 'previa_enviada' ? 'Reenviar a prévia e reiniciar a sequência de e-mails?' : 'Enviar a prévia e iniciar a sequência de e-mails?')}
          >
            {status === 'previa_enviada' ? 'Reenviar prévia' : 'Enviar prévia'}
          </button>
        )}
        {status === 'previa_enviada' && !unsubscribed && (
          <button type="button" disabled={isPending} className={BTN} onClick={() => run(() => setSequencePausedAction(id, !sequencePaused), sequencePaused ? 'Sequência retomada.' : 'Sequência pausada.')}>
            {sequencePaused ? 'Retomar e-mails' : 'Pausar e-mails'}
          </button>
        )}
        {!closed && (
          <>
            <button type="button" disabled={isPending} className={BTN} onClick={() => run(() => extendExpirationAction(id, 7), 'Prazo renovado por mais 7 dias.')}>+7 dias de prazo</button>
            <button type="button" disabled={isPending} className={`${BTN} text-red-700`} onClick={() => run(() => cancelProposalAction(id), 'Proposta cancelada.', 'Cancelar esta proposta? A sequência de e-mails para.')}>Cancelar proposta</button>
          </>
        )}
      </div>

      {canSendPreview && (
        <form
          className="border-t border-gray-100 pt-4"
          action={(fd) => run(() => updatePreviewAction(id, fd), 'Prévia atualizada. Clique em "Enviar prévia" para avisar o prospect.')}
        >
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Trocar prévia (nova versão)</p>
          <div className="flex flex-wrap items-center gap-2">
            <input name="previewUrl" type="url" placeholder="https://… (URL)" className="flex-1 min-w-[220px] border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            <span className="text-xs text-gray-400">ou</span>
            <input name="previewFile" type="file" accept=".html,.htm,text/html" className="text-xs" />
            <button type="submit" disabled={isPending} className={BTN}>Salvar prévia</button>
          </div>
        </form>
      )}

      {unsubscribed && <p className="text-xs text-amber-700">O prospect se descadastrou: a sequência de e-mails não é mais enviada.</p>}
      {msg && <p className="text-sm text-gray-700" role="status">{msg}</p>}
    </div>
  )
}

export function EmailRowActions({ proposalId, emailId, canResend }: { proposalId: string; emailId: string; canResend: boolean }) {
  const [isPending, startTransition] = useTransition()
  const [done, setDone] = useState('')
  if (!canResend) return null
  return (
    <button
      type="button"
      disabled={isPending}
      className="text-xs text-brand-text hover:underline disabled:opacity-50"
      onClick={() => {
        if (!window.confirm('Reenviar este e-mail agora?')) return
        startTransition(async () => {
          const r = await resendEmailAction(proposalId, emailId)
          setDone(r.error ? 'erro' : 'reenviado')
        })
      }}
    >
      {done || 'Reenviar'}
    </button>
  )
}
