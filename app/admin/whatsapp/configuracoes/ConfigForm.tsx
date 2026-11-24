'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Card } from '@/components/ui'
import type { WaConfig } from '@/lib/whatsapp/config'
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

function Check({ checked, onChange, title, hint }: { checked: boolean; onChange: (v: boolean) => void; title: string; hint: string }) {
  return (
    <label className="flex items-start gap-3">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-1 h-4 w-4" />
      <span>
        <span className="block text-sm font-medium text-gray-900">{title}</span>
        <span className="block text-xs text-gray-500">{hint}</span>
      </span>
    </label>
  )
}

export function ConfigForm({ initial }: { initial: WaConfig }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [config, setConfig] = useState(initial)
  const [hours, setHours] = useState(initial.followUpHours.join(', '))
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null)

  const set = <K extends keyof WaConfig>(key: K, value: WaConfig[K]) => setConfig((c) => ({ ...c, [key]: value }))

  const save = () => {
    const followUpHours = hours.split(/[,\s]+/).filter(Boolean).map(Number)
    if (config.liveMode && !initial.liveMode && !window.confirm('Ligar os envios reais? A partir de agora a IA responde, faz follow-up e envia ofertas de verdade pelo seu número.')) return
    start(async () => {
      const res = await saveConfigAction({ ...config, followUpHours })
      setMessage(res.ok ? { text: 'Configurações salvas.' } : { text: res.error, error: true })
      if (res.ok) router.refresh()
    })
  }

  return (
    <div className="space-y-5">
      <Card className={config.liveMode ? 'border-green-300' : 'border-yellow-300'}>
        <Check
          checked={config.liveMode}
          onChange={(v) => set('liveMode', v)}
          title="Envios reais ligados"
          hint="Desligado = simulação: a IA decide e escreve, mas nada sai (fica como “simulada” na conversa). Deixe uns dias em simulação, leia o que ela escreveria e só depois ligue."
        />
        <div className="mt-4">
          <Field label="Número de teste" hint="Recebe de verdade mesmo em simulação. Use outro celular seu e converse como se fosse um cliente. Só números, com DDI e DDD.">
            <input className={field} inputMode="numeric" value={config.testNumber} onChange={(e) => set('testNumber', e.target.value.replace(/\D/g, ''))} placeholder="5518999999999" />
          </Field>
        </div>
      </Card>

      <Card>
        <h3 className="mb-4 text-sm font-semibold text-gray-900">O que a IA sabe sobre o negócio</h3>
        <div className="space-y-4">
          <Field label="Nome que a IA usa"><input className={field} value={config.assistantName} onChange={(e) => set('assistantName', e.target.value)} /></Field>
          <Field label="Produtos, serviços e regras" hint="A IA só fala o que está aqui: não inventa prazo, desconto nem promessa. Quando não souber, chama você.">
            <textarea className={field} rows={12} value={config.businessContext} onChange={(e) => set('businessContext', e.target.value)} />
          </Field>
          <Check
            checked={config.priceToHuman}
            onChange={(v) => set('priceToHuman', v)}
            title="A IA não fala de valores: quando perguntarem preço, ela passa para você"
            hint="Ela avisa que o responsável vai passar os valores, pausa naquele contato e te notifica. Mensagens com “R$”, “reais” ou “/mês” são bloqueadas mesmo se a IA errar."
          />
        </div>
      </Card>

      <Card>
        <h3 className="mb-4 text-sm font-semibold text-gray-900">Para revisar antes de ligar os envios</h3>
        <div className="space-y-2 text-xs text-gray-600">
          <p>A IA lê as datas e as mensagens que você mandou pelo celular: se você já respondeu, já passou orçamento ou estava negociando, ela não repete nem contradiz.</p>
          <p>Quando você responde um contato pelo celular, ela fica quieta com ele pelo tempo definido em Respostas.</p>
        </div>
      </Card>

      <Card>
        <h3 className="mb-4 text-sm font-semibold text-gray-900">Respostas</h3>
        <div className="space-y-4">
          <Check checked={config.autoReply} onChange={(v) => set('autoReply', v)} title="Responder automaticamente leads e clientes" hint="A IA responde em cerca de 1 a 2 minutos. Pessoais e a revisar nunca são respondidos." />
          <Check checked={config.replyAnyTime} onChange={(v) => set('replyAnyTime', v)} title="Responder também fora do horário" hint="Follow-ups e ofertas sempre respeitam o horário abaixo." />
          <Field label="Quando você responde pelo celular, a IA fica quieta com o contato por (horas)">
            <input className={field} type="number" min={1} max={720} value={config.humanTakeoverHours} onChange={(e) => set('humanTakeoverHours', Number(e.target.value))} />
          </Field>
        </div>
      </Card>

      <Card>
        <h3 className="mb-4 text-sm font-semibold text-gray-900">Follow-up de leads</h3>
        <div className="space-y-4">
          <Check checked={config.followUpEnabled} onChange={(v) => set('followUpEnabled', v)} title="Fazer follow-up quando o lead parar de responder" hint="A IA decide se vale a pena e escreve algo novo a cada vez. Para se a pessoa responder." />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Horas parado antes de cada follow-up" hint="Padrão: 20, 72, 168 (20h, 3 dias e 7 dias).">
              <input className={field} value={hours} onChange={(e) => setHours(e.target.value)} />
            </Field>
            <Field label="Ignorar conversas paradas há mais de (dias)" hint="Essas ficam para as campanhas.">
              <input className={field} type="number" min={1} max={180} value={config.followUpMaxAgeDays} onChange={(e) => set('followUpMaxAgeDays', Number(e.target.value))} />
            </Field>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
            <p className="mb-2 text-xs text-gray-600">
              Depois de 24h sem mensagem do contato, o WhatsApp só aceita modelo aprovado. Sem modelo, só o 1º follow-up (20h) sai. Crie no WhatsApp Manager um modelo
              com variáveis (ex: “Oi {'{{1}}'}! {'{{2}}'}”) e cole o mesmo texto aqui.
            </p>
            <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
              <input className={field} value={config.followUpTemplateName} onChange={(e) => set('followUpTemplateName', e.target.value.trim())} placeholder="nome_do_modelo" />
              <input className={field} value={config.followUpTemplateLanguage} onChange={(e) => set('followUpTemplateLanguage', e.target.value.trim())} placeholder="pt_BR" />
            </div>
            <textarea className={field + ' mt-3'} rows={2} value={config.followUpTemplateBody} onChange={(e) => set('followUpTemplateBody', e.target.value)} placeholder="Oi {{1}}! {{2}}" />
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="mb-4 text-sm font-semibold text-gray-900">Limites (follow-ups e ofertas)</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Máximo de mensagens proativas por dia" hint="Comece baixo (30 a 50): muita oferta de uma vez derruba a qualidade do número na Meta.">
            <input className={field} type="number" min={1} max={1000} value={config.dailyLimit} onChange={(e) => set('dailyLimit', Number(e.target.value))} />
          </Field>
          <Field label="Intervalo mínimo entre ofertas para a mesma pessoa (dias)">
            <input className={field} type="number" min={1} max={180} value={config.offerMinIntervalDays} onChange={(e) => set('offerMinIntervalDays', Number(e.target.value))} />
          </Field>
          <Field label="Horário: início" hint="Dias úteis, horário de Brasília.">
            <input className={field} type="time" value={config.windowStart} onChange={(e) => set('windowStart', e.target.value)} />
          </Field>
          <Field label="Horário: fim"><input className={field} type="time" value={config.windowEnd} onChange={(e) => set('windowEnd', e.target.value)} /></Field>
        </div>
      </Card>

      <div className="flex items-center gap-3 pb-8">
        <Button onClick={save} loading={pending}>Salvar configurações</Button>
        {message && <span role="status" className={'text-sm ' + (message.error ? 'text-red-700' : 'text-green-700')}>{message.text}</span>}
      </div>
    </div>
  )
}
