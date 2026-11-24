'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Card } from '@/components/ui'
import { createCampaignAction, type CampaignInput } from '../actions'

const field = 'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-gray-500 focus:outline-none'

const EMPTY: CampaignInput = { name: '', offer: '', categories: ['lead'], templateName: '', templateLanguage: 'pt_BR', templateBody: '' }

export function CampaignForm() {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [form, setForm] = useState(EMPTY)
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null)

  const set = <K extends keyof CampaignInput>(key: K, value: CampaignInput[K]) => setForm((f) => ({ ...f, [key]: value }))
  const toggle = (cat: 'lead' | 'cliente') =>
    set('categories', form.categories.includes(cat) ? form.categories.filter((c) => c !== cat) : [...form.categories, cat])

  const save = () =>
    start(async () => {
      const res = await createCampaignAction(form)
      if (!res.ok) return setMessage({ text: res.error, error: true })
      router.push('/admin/whatsapp/campanhas/' + res.id)
    })

  return (
    <Card>
      <h3 className="mb-4 text-sm font-semibold text-gray-900">Nova campanha</h3>
      <div className="space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-gray-700">Nome</span>
          <input className={field} value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Ex: Upgrade para o Plus — dezembro" />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-gray-700">Oferta (instruções para a IA)</span>
          <textarea
            className={field}
            rows={5}
            value={form.offer}
            onChange={(e) => set('offer', e.target.value)}
            placeholder="O que é, preço, prazo da oferta, para quem faz sentido e para quem NÃO faz. Ex: Plano Plus por R$ 29/mês com 1 alteração inclusa. Faz sentido para quem está no Básico e já pediu alteração avulsa. Não ofereça para quem já é Plus."
          />
        </label>

        <div>
          <span className="mb-1 block text-sm font-medium text-gray-700">Para quem</span>
          <div className="flex gap-4 text-sm text-gray-700">
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.categories.includes('lead')} onChange={() => toggle('lead')} /> Leads</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.categories.includes('cliente')} onChange={() => toggle('cliente')} /> Clientes</label>
          </div>
          <p className="mt-1 text-xs text-gray-500">Contatos pessoais, a revisar e descadastrados nunca entram.</p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
          <p className="mb-2 text-sm font-medium text-gray-700">Modelo aprovado na Meta (para quem não falou com você nas últimas 24h)</p>
          <p className="mb-3 text-xs text-gray-500">
            Fora da janela de 24h o WhatsApp só deixa enviar modelos aprovados, da categoria Marketing. Crie o modelo no WhatsApp Manager com variáveis
            {' {{1}}, {{2}}'}… e cole aqui o mesmo texto. A IA preenche as variáveis para cada contato. Sem modelo, a campanha só alcança quem está com a janela aberta.
          </p>
          <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
            <input className={field} value={form.templateName} onChange={(e) => set('templateName', e.target.value.trim())} placeholder="nome_do_modelo" />
            <input className={field} value={form.templateLanguage} onChange={(e) => set('templateLanguage', e.target.value.trim())} placeholder="pt_BR" />
          </div>
          <textarea
            className={field + ' mt-3'}
            rows={3}
            value={form.templateBody}
            onChange={(e) => set('templateBody', e.target.value)}
            placeholder="Oi {{1}}! {{2}} Se não quiser receber ofertas, responda SAIR."
          />
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={save} loading={pending}>Criar campanha (rascunho)</Button>
          {message && <span role="status" className={'text-sm ' + (message.error ? 'text-red-700' : 'text-green-700')}>{message.text}</span>}
        </div>
      </div>
    </Card>
  )
}
