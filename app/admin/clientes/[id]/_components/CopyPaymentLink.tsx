'use client'

import { useState, useTransition } from 'react'
import { sendPixChargeEmailAction } from '../mensal-actions'

/** Link de pagamento da mensalidade por Pix (sem login): copiar para o WhatsApp ou enviar por e-mail. */
export function CopyPaymentLink({ link, clientId }: { link: string; clientId: string }) {
  const [copied, setCopied] = useState(false)
  const [msg, setMsg] = useState('')
  const [isPending, startTransition] = useTransition()
  const btn = 'px-2.5 py-1 text-xs rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50'
  return (
    <span className="flex flex-col gap-1">
      <span className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => navigator.clipboard.writeText(link).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2500) })}
          className={btn}
          title={link}
        >
          {copied ? 'Link copiado!' : 'Copiar link de pagamento (Pix)'}
        </button>
        <button
          type="button"
          disabled={isPending}
          className={btn}
          onClick={() => {
            if (!window.confirm('Enviar agora ao cliente o e-mail da mensalidade com o link e o Pix copia e cola?')) return
            startTransition(async () => {
              const r = await sendPixChargeEmailAction(clientId)
              setMsg(r.error ? `Não enviou: ${r.error}` : r.message ?? 'Enviado.')
            })
          }}
        >
          {isPending ? 'Enviando…' : 'Enviar cobrança por e-mail'}
        </button>
      </span>
      {msg && <span className="text-xs text-gray-600">{msg}</span>}
    </span>
  )
}
