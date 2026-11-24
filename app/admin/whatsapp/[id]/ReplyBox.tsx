'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui'
import { sendManualAction } from '../actions'

// Resposta manual pelo painel (o número da IA não tem app no celular)
export function ReplyBox({ contactId, windowOpen, blocked }: { contactId: string; windowOpen: boolean; blocked: boolean }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [text, setText] = useState('')
  const [error, setError] = useState('')

  if (!windowOpen) {
    return (
      <div className="border-t border-gray-100 px-4 py-3 text-xs text-gray-500">
        Janela de 24h fechada: o WhatsApp só permite mensagem livre até 24h depois da última mensagem do contato. Para retomar, use uma campanha (modelo aprovado).
      </div>
    )
  }

  const send = () => {
    if (!text.trim()) return
    if (blocked && !window.confirm('Este contato pediu para não receber mensagens. Enviar mesmo assim?')) return
    setError('')
    start(async () => {
      const res = await sendManualAction(contactId, text)
      if (!res.ok) return setError(res.error)
      setText('')
      router.refresh()
    })
  }

  return (
    <div className="border-t border-gray-100 p-3">
      <textarea
        className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
        rows={3}
        value={text}
        placeholder="Escreva sua resposta… (Ctrl+Enter envia)"
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) send() }}
      />
      <div className="mt-2 flex items-center justify-between gap-3">
        <span className="text-[11px] text-gray-500">Ao responder, a IA fica quieta com este contato pelo tempo definido em Configurações.</span>
        <Button size="sm" onClick={send} loading={pending} disabled={!text.trim()}>Enviar</Button>
      </div>
      {error && <p role="alert" className="mt-2 text-xs text-red-700">{error}</p>}
    </div>
  )
}
