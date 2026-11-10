'use client'

import { useState, useTransition } from 'react'
import type { OnlineProposalConfig } from '@/lib/online-proposal/config'
import { saveConfigAction } from '../actions'

const INPUT = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand'
const THEMES = ['Sua prévia está pronta', 'Por que ter um site profissional', 'Como funciona a aprovação e o que está incluso', 'Dúvidas comuns e WhatsApp', 'Último aviso (expiração)']

export function ConfigForm({ initial }: { initial: OnlineProposalConfig }) {
  const [config, setConfig] = useState(initial)
  const [msg, setMsg] = useState('')
  const [isPending, startTransition] = useTransition()

  const set = <K extends keyof OnlineProposalConfig>(key: K, value: OnlineProposalConfig[K]) => setConfig((c) => ({ ...c, [key]: value }))

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault()
        setMsg('')
        startTransition(async () => {
          const r = await saveConfigAction(config)
          setMsg(r.error ? `Erro: ${r.error}` : 'Configurações salvas.')
        })
      }}
    >
      <div className="bg-white rounded-xl border border-gray-200 p-5 grid gap-4 md:grid-cols-2">
        <label className="md:col-span-2">
          <span className="block text-sm font-medium text-gray-700 mb-1">Cronograma (dias após enviar a prévia, para os 5 e-mails)</span>
          <div className="flex gap-2">
            {config.scheduleDays.map((d, i) => (
              <input key={i} type="number" min={0} max={60} value={d} aria-label={`Dia do e-mail ${i + 1}`} className={`${INPUT} max-w-[80px]`}
                onChange={(e) => set('scheduleDays', config.scheduleDays.map((v, j) => (j === i ? Number(e.target.value) : v)))} />
            ))}
          </div>
        </label>
        <label><span className="block text-sm font-medium text-gray-700 mb-1">Janela de envio — início</span><input type="time" value={config.windowStart} onChange={(e) => set('windowStart', e.target.value)} className={INPUT} /></label>
        <label><span className="block text-sm font-medium text-gray-700 mb-1">Janela de envio — fim</span><input type="time" value={config.windowEnd} onChange={(e) => set('windowEnd', e.target.value)} className={INPUT} /></label>
        <label><span className="block text-sm font-medium text-gray-700 mb-1">Remetente</span><input value={config.from} onChange={(e) => set('from', e.target.value)} className={INPUT} /></label>
        <label><span className="block text-sm font-medium text-gray-700 mb-1">Responder para</span><input value={config.replyTo} onChange={(e) => set('replyTo', e.target.value)} className={INPUT} /></label>
        <label><span className="block text-sm font-medium text-gray-700 mb-1">WhatsApp (DDI + DDD + número)</span><input value={config.whatsappNumber} onChange={(e) => set('whatsappNumber', e.target.value)} className={INPUT} /></label>
        <p className="md:col-span-2 text-xs text-gray-500">
          Horário de Brasília. Os e-mails agendados saem no envio diário automático (por volta das 9h) e, ao enviar a prévia, o 1º sai na hora se estiver dentro da janela.
        </p>
      </div>

      <p className="text-xs text-gray-500">
        Variáveis: {'{{nome}} {{empresa}} {{plano}} {{valor_setup}} {{valor_mensal}} {{link}} {{expira_em}} {{whatsapp}}'}. Todo e-mail recebe o botão &quot;Ver meu site&quot; e o link de descadastro automaticamente.
      </p>

      {config.templates.map((t, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
          <p className="text-sm font-semibold text-gray-800">E-mail {i + 1} — dia {config.scheduleDays[i]} · {THEMES[i]}</p>
          <input value={t.subject} aria-label={`Assunto do e-mail ${i + 1}`} className={INPUT}
            onChange={(e) => set('templates', config.templates.map((x, j) => (j === i ? { ...x, subject: e.target.value } : x)))} />
          <textarea value={t.body} rows={8} aria-label={`Texto do e-mail ${i + 1}`} className={`${INPUT} font-mono text-xs`}
            onChange={(e) => set('templates', config.templates.map((x, j) => (j === i ? { ...x, body: e.target.value } : x)))} />
        </div>
      ))}

      <div className="flex items-center justify-end gap-3">
        {msg && <span className="text-sm text-gray-700" role="status">{msg}</span>}
        <button type="submit" disabled={isPending} className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-700 disabled:opacity-50">{isPending ? 'Salvando…' : 'Salvar configurações'}</button>
      </div>
    </form>
  )
}
