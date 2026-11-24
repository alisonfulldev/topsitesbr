'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui'
import { bulkCategorizeAction } from '../actions'

// Contatos da agenda sem nenhuma conversa: a IA não tem como classificar, então você decide em lote
export function BulkCategorize({ ids }: { ids: string[] }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [message, setMessage] = useState('')

  const run = (category: 'lead' | 'pessoal') => {
    const label = category === 'lead' ? 'LEAD (podem receber campanhas)' : 'PESSOAL (nunca recebem nada)'
    if (!window.confirm(`Marcar os ${ids.length} contatos desta lista como ${label}?`)) return
    start(async () => {
      const res = await bulkCategorizeAction(ids, category)
      setMessage(res.ok ? `${res.count} contato(s) atualizados.` : res.error)
      if (res.ok) router.refresh()
    })
  }

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
      <span className="mr-auto">Contatos da agenda sem conversa: a IA não tem o que analisar. Abra um a um ou marque a lista toda.</span>
      <Button size="sm" variant="secondary" loading={pending} onClick={() => run('lead')}>Marcar todos como lead</Button>
      <Button size="sm" variant="ghost" loading={pending} onClick={() => run('pessoal')}>Marcar todos como pessoal</Button>
      {message && <span className="w-full text-xs">{message}</span>}
    </div>
  )
}
