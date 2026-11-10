'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createOnlineProposalAction } from '../actions'

type Plan = { key: string; name: string; setup: number; monthly: number }
type Extra = { key: string; name: string; price: number }

const INPUT = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent'
const LABEL = 'block text-sm font-medium text-gray-700 mb-1'

export function NewProposalForm({ plans, extras }: { plans: Plan[]; extras: Extra[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [planKey, setPlanKey] = useState(plans[0]?.key ?? '')
  const [setup, setSetup] = useState(String(plans[0]?.setup ?? ''))
  const [monthly, setMonthly] = useState(String(plans[0]?.monthly ?? ''))
  const [previewMode, setPreviewMode] = useState<'url' | 'html'>('url')

  function choosePlan(key: string) {
    const plan = plans.find((p) => p.key === key)
    setPlanKey(key)
    if (plan) {
      setSetup(String(plan.setup))
      setMonthly(String(plan.monthly))
    }
  }

  function submit(formData: FormData) {
    setError('')
    if (previewMode === 'url') formData.delete('previewFile')
    else formData.delete('previewUrl')
    startTransition(async () => {
      const r = await createOnlineProposalAction(formData)
      if (r.error) setError(r.error)
      else if (r.id) router.push(`/admin/propostas-online/${r.id}`)
    })
  }

  return (
    <form action={submit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}

      <div className="grid gap-4 md:grid-cols-2">
        <label><span className={LABEL}>Nome <span className="text-red-500">*</span></span><input name="name" required className={INPUT} /></label>
        <label><span className={LABEL}>Empresa</span><input name="company" className={INPUT} /></label>
        <label><span className={LABEL}>E-mail <span className="text-red-500">*</span></span><input name="email" type="email" required className={INPUT} /></label>
        <label><span className={LABEL}>WhatsApp</span><input name="whatsapp" type="tel" className={INPUT} placeholder="(00) 90000-0000" /></label>
        <label><span className={LABEL}>CNPJ / CPF</span><input name="document" className={INPUT} /></label>
      </div>

      <div className="pt-2 border-t border-gray-100">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Plano</p>
        <div className="grid grid-cols-2 gap-2">
          {plans.map((p) => (
            <label key={p.key} className={`flex flex-col gap-0.5 p-3 rounded-lg border cursor-pointer ${planKey === p.key ? 'border-brand bg-brand/5' : 'border-gray-200 hover:bg-gray-50'}`}>
              <input type="radio" name="planKey" value={p.key} checked={planKey === p.key} onChange={() => choosePlan(p.key)} className="sr-only" />
              <span className="text-sm font-semibold text-gray-800">{p.name}</span>
              <span className="text-xs text-gray-500">Setup R$ {p.setup} + R$ {p.monthly}/mês</span>
            </label>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2 mt-4">
          <label><span className={LABEL}>Valor do setup (R$)</span><input name="setupPrice" type="number" min="0" step="0.01" value={setup} onChange={(e) => setSetup(e.target.value)} className={INPUT} /></label>
          <label><span className={LABEL}>Valor da mensalidade (R$)</span><input name="monthlyPrice" type="number" min="1" step="0.01" value={monthly} onChange={(e) => setMonthly(e.target.value)} className={INPUT} /></label>
        </div>
      </div>

      {extras.length > 0 && (
        <div className="pt-2 border-t border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Extras oferecidos (o prospect escolhe antes de aprovar)</p>
          {extras.map((e) => (
            <div key={e.key} className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-gray-700 flex-1">
                <input type="checkbox" name={`extra_${e.key}`} defaultChecked className="h-4 w-4" />
                {e.name}
              </label>
              <input name={`extraPrice_${e.key}`} type="number" min="0" step="0.01" defaultValue={e.price} className={`${INPUT} max-w-[140px]`} aria-label={`Valor de ${e.name}`} />
            </div>
          ))}
        </div>
      )}

      <div className="pt-2 border-t border-gray-100">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Prévia</p>
        <div className="flex gap-4 text-sm mb-3">
          <label className="flex items-center gap-2"><input type="radio" checked={previewMode === 'url'} onChange={() => setPreviewMode('url')} /> URL</label>
          <label className="flex items-center gap-2"><input type="radio" checked={previewMode === 'html'} onChange={() => setPreviewMode('html')} /> Upload de HTML</label>
        </div>
        {previewMode === 'url' ? (
          <input name="previewUrl" type="url" placeholder="https://cliente.github.io/site" className={INPUT} />
        ) : (
          <>
            <input name="previewFile" type="file" accept=".html,.htm,text/html" className="text-sm" />
            <p className="mt-1 text-xs text-gray-400">Arquivo único, até 3 MB. Imagens e CSS precisam usar endereços completos (https://…).</p>
          </>
        )}
        <p className="mt-2 text-xs text-gray-400">Pode deixar em branco e cadastrar depois, antes de enviar.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 pt-2 border-t border-gray-100">
        <label><span className={LABEL}>Link expira em (dias)</span><input name="expiresInDays" type="number" min="1" max="90" defaultValue={15} className={INPUT} /></label>
        <label><span className={LABEL}>Limite de ajustes</span><input name="maxRevisions" type="number" min="0" max="10" defaultValue={2} className={INPUT} /></label>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <button type="button" onClick={() => router.back()} className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Cancelar</button>
        <button type="submit" disabled={isPending} className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-700 disabled:opacity-50">
          {isPending ? 'Salvando…' : 'Cadastrar proposta'}
        </button>
      </div>
    </form>
  )
}
