'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Card } from '@/components/ui'
import type { ProspectingConfig } from '@/lib/prospecting/config'
import { saveConfigAction } from '../actions'

const field = 'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-gray-500 focus:outline-none'

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-gray-700">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-gray-500">{hint}</span>}
    </label>
  )
}

export function ConfigForm({ initial }: { initial: ProspectingConfig }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [config, setConfig] = useState(initial)
  const [cadence, setCadence] = useState(initial.cadenceDays.join(', '))
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null)

  const set = <K extends keyof ProspectingConfig>(key: K, value: ProspectingConfig[K]) => setConfig((c) => ({ ...c, [key]: value }))

  const save = () => {
    const cadenceDays = cadence.split(/[,\s]+/).filter(Boolean).map(Number)
    if (config.liveMode && !initial.liveMode && !window.confirm('Ligar os envios reais? A partir de agora os prospects ativos passam a receber os e-mails.')) return
    start(async () => {
      const res = await saveConfigAction({ ...config, cadenceDays })
      setMessage(res.ok ? { text: 'Configurações salvas.' } : { text: res.error, error: true })
      if (res.ok) router.refresh()
    })
  }

  return (
    <div className="space-y-5">
      <Card className={config.liveMode ? 'border-green-300' : 'border-yellow-300'}>
        <label className="flex items-start gap-3">
          <input type="checkbox" checked={config.liveMode} onChange={(e) => set('liveMode', e.target.checked)} className="mt-1 h-4 w-4" />
          <span>
            <span className="block text-sm font-semibold text-gray-900">Envios reais ligados</span>
            <span className="block text-xs text-gray-500">
              Desligado = modo teste: nada sai para prospects, só a sequência de teste para o seu e-mail. Ligue depois de validar o teste.
            </span>
          </span>
        </label>
      </Card>

      <Card>
        <h3 className="mb-4 text-sm font-semibold text-gray-900">Remetente e rodapé</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Seu nome"><input className={field} value={config.senderName} onChange={(e) => set('senderName', e.target.value)} /></Field>
          <Field label="Empresa"><input className={field} value={config.company} onChange={(e) => set('company', e.target.value)} /></Field>
          <Field label="Remetente (from)" hint="Precisa ser do domínio verificado no Resend. Ex: Alison da TopSite <contato@topsitebr.com.br>">
            <input className={field} value={config.from} onChange={(e) => set('from', e.target.value)} />
          </Field>
          <Field label="Responder para (reply-to)" hint="Onde as respostas chegam. Deixe vazio para usar o remetente.">
            <input className={field} value={config.replyTo} onChange={(e) => set('replyTo', e.target.value)} />
          </Field>
          <Field label="Contato no rodapé"><input className={field} value={config.contactLine} onChange={(e) => set('contactLine', e.target.value)} /></Field>
          <Field label="E-mail para testes"><input className={field} value={config.testEmail} onChange={(e) => set('testEmail', e.target.value)} /></Field>
        </div>
      </Card>

      <Card>
        <h3 className="mb-4 text-sm font-semibold text-gray-900">WhatsApp ({'{{link_whatsapp}}'})</h3>
        <div className="grid gap-4">
          <Field label="Número" hint="Só números, com DDI e DDD.">
            <input className={field} inputMode="numeric" value={config.whatsappNumber} onChange={(e) => set('whatsappNumber', e.target.value.replace(/\D/g, ''))} />
          </Field>
          <Field label="Mensagem pré-preenchida" hint="Aceita {{nome}} e {{negocio}}.">
            <textarea className={field} rows={2} value={config.whatsappText} onChange={(e) => set('whatsappText', e.target.value)} />
          </Field>
        </div>
      </Card>

      <Card>
        <h3 className="mb-4 text-sm font-semibold text-gray-900">Agendamento</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Limite de envios por dia"><input className={field} type="number" min={1} max={500} value={config.dailyLimit} onChange={(e) => set('dailyLimit', Number(e.target.value))} /></Field>
          <Field label="Cadência (dias)" hint="Dia de cada um dos 5 e-mails. Padrão: 0, 2, 4, 6, 8.">
            <input className={field} value={cadence} onChange={(e) => setCadence(e.target.value)} />
          </Field>
          <Field label="Janela: início" hint="A fila automática roda por volta das 9h; mantenha o início até 09:00.">
            <input className={field} type="time" value={config.windowStart} onChange={(e) => set('windowStart', e.target.value)} />
          </Field>
          <Field label="Janela: fim"><input className={field} type="time" value={config.windowEnd} onChange={(e) => set('windowEnd', e.target.value)} /></Field>
        </div>
        <label className="mt-4 flex items-center gap-3 text-sm text-gray-700">
          <input type="checkbox" checked={config.allowDirectActivate} onChange={(e) => set('allowDirectActivate', e.target.checked)} className="h-4 w-4" />
          Permitir “Ler e ativar direto” (ativa sem passar pela prévia)
        </label>
      </Card>

      <div className="flex items-center gap-3">
        <Button onClick={save} loading={pending}>Salvar configurações</Button>
        {message && <span role="status" className={'text-sm ' + (message.error ? 'text-red-700' : 'text-green-700')}>{message.text}</span>}
      </div>
    </div>
  )
}
