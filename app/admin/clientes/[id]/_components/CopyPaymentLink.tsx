'use client'

import { useState, useTransition } from 'react'
import { sendPixChargeEmailAction } from '../mensal-actions'

type Props = {
  link: string
  clientId: string
  clientName: string
  phone: string | null
  amount: string
  dueDate: string | null
  overdue: boolean
}

// Número para o wa.me: só dígitos, com 55 na frente quando vier sem o código do país
function waNumber(phone: string | null) {
  const d = (phone ?? '').replace(/\D/g, '')
  if (!d) return null
  return d.startsWith('55') && d.length >= 12 ? d : `55${d}`
}

/** Cobrança da mensalidade por Pix (sem login): mensagem pronta para o WhatsApp ou envio por e-mail. */
export function CopyPaymentLink({ link, clientId, clientName, phone, amount, dueDate, overdue }: Props) {
  const [copied, setCopied] = useState(false)
  const [msg, setMsg] = useState('')
  const [isPending, startTransition] = useTransition()
  const btn = 'px-2.5 py-1 text-xs rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50'

  const firstName = clientName.split(' ')[0]
  const message = overdue
    ? `Olá, ${firstName}! Tudo bem? Sua mensalidade do site de ${amount}${dueDate ? ` venceu em ${dueDate}` : ' está em aberto'} e ainda não identificamos o pagamento. Para pagar por Pix, é só abrir o link: ${link}\n\nSe já pagou, pode desconsiderar. Qualquer dúvida, estou à disposição!`
    : `Olá, ${firstName}! Tudo bem? Sua mensalidade do site de ${amount}${dueDate ? ` vence em ${dueDate}` : ''}. Para pagar por Pix, é só abrir o link: ${link}\n\nAo pagar, seu banco pode pedir para autorizar o débito automático das próximas mensalidades. Qualquer dúvida, estou à disposição!`
  const wa = waNumber(phone)

  return (
    <span className="flex flex-col gap-1">
      <span className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => navigator.clipboard.writeText(message).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2500) })}
          className={btn}
          title={message}
        >
          {copied ? 'Mensagem copiada!' : 'Copiar mensagem de cobrança'}
        </button>
        {wa && (
          <a href={`https://wa.me/${wa}?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer" className={`${btn} text-green-700`}>
            Abrir no WhatsApp
          </a>
        )}
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
      {!wa && <span className="text-xs text-amber-700">Sem telefone no cadastro — copie a mensagem e envie manualmente.</span>}
      {msg && <span className="text-xs text-gray-600">{msg}</span>}
    </span>
  )
}
