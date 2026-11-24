'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui'
import { deleteCampaignAction, setCampaignStatusAction } from '../../actions'

export function CampaignActions({ id, status }: { id: string; status: string }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [error, setError] = useState('')

  const setStatus = (next: 'ativa' | 'pausada') => {
    if (next === 'ativa' && !window.confirm('Ativar a campanha? A IA começa a oferecer para o público dela no próximo horário de envio.')) return
    start(async () => {
      const res = await setCampaignStatusAction(id, next)
      if (!res.ok) return setError(res.error)
      router.refresh()
    })
  }

  const remove = () => {
    if (!window.confirm('Excluir a campanha e o registro dos envios? As mensagens continuam nas conversas.')) return
    start(async () => {
      const res = await deleteCampaignAction(id)
      if (!res.ok) return setError(res.error)
      router.push('/admin/whatsapp/campanhas')
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {error && <span className="text-xs text-red-700">{error}</span>}
      {status === 'ativa' ? (
        <Button size="sm" variant="secondary" loading={pending} onClick={() => setStatus('pausada')}>Pausar</Button>
      ) : status !== 'concluida' ? (
        <Button size="sm" loading={pending} onClick={() => setStatus('ativa')}>Ativar</Button>
      ) : null}
      <Button size="sm" variant="ghost" loading={pending} onClick={remove}>Excluir</Button>
    </div>
  )
}
