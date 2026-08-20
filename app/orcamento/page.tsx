'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useCallback } from 'react'
import { saveQuoteLeadAction } from './actions'
import { buildWAMessage } from './utils'
import type { ProjectType } from './actions'

/* ─── Pricing ─────────────────────────────────────────────────────────────── */

function calcTotal(
  type: ProjectType,
  pages: number,
  hasAdmin: boolean,
  hasLogo: boolean,
  hasDomain: boolean,
): number {
  let base = 0
  if (type === 'landing_page') base = 497
  else if (type === 'loja_virtual') base = 1500
  else base = pages <= 4 ? 697 : 697 + (pages - 4) * 100
  return base + (hasAdmin ? 1000 : 0) + (!hasLogo ? 220 : 0) + (!hasDomain ? 140 : 0)
}

function fmtBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

/* ─── State ───────────────────────────────────────────────────────────────── */

interface FormState {
  projectType: ProjectType | null
  pageCount: number
  segment: string
  hasAdmin: boolean
  hasLogo: boolean
  hasDomain: boolean
  name: string
  email: string
}

const INIT: FormState = {
  projectType: null,
  pageCount: 1,
  segment: '',
  hasAdmin: false,
  hasLogo: true,
  hasDomain: true,
  name: '',
  email: '',
}

/* ─── Step helpers ────────────────────────────────────────────────────────── */

function getSteps(type: ProjectType | null) {
  const base = [0, 2, 3, 4, 5, 6, 7] // indices into STEP_IDS
  if (type === 'institucional') return [0, 1, 2, 3, 4, 5, 6, 7]
  return base
}

/* ─── Icons ──────────────────────────────────────────────────────────────── */

function IconCheck({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  )
}

function IconArrow() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
    </svg>
  )
}

function IconWA() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

/* ─── Progress bar ────────────────────────────────────────────────────────── */

function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = Math.round(((current + 1) / total) * 100)
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
          Passo {current + 1} de {total}
        </span>
        <span className="text-xs font-bold text-yellow-400">{pct}%</span>
      </div>
      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-yellow-400 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

/* ─── Card select ─────────────────────────────────────────────────────────── */

function CardOption({
  selected,
  onClick,
  children,
}: {
  selected: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left px-5 py-4 rounded-2xl border-2 transition-all duration-200 ${
        selected
          ? 'border-yellow-400 bg-yellow-400/5 text-white'
          : 'border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-500 hover:text-white'
      }`}
    >
      {children}
    </button>
  )
}

/* ─── Yes/No choice ───────────────────────────────────────────────────────── */

function YesNo({
  value,
  onChange,
  yesLabel = 'Sim',
  noLabel = 'Não',
}: {
  value: boolean
  onChange: (v: boolean) => void
  yesLabel?: string
  noLabel?: string
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        type="button"
        onClick={() => onChange(true)}
        className={`py-4 rounded-2xl border-2 font-semibold text-sm transition-all duration-200 ${
          value
            ? 'border-yellow-400 bg-yellow-400/5 text-yellow-400'
            : 'border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-500 hover:text-white'
        }`}
      >
        {yesLabel}
      </button>
      <button
        type="button"
        onClick={() => onChange(false)}
        className={`py-4 rounded-2xl border-2 font-semibold text-sm transition-all duration-200 ${
          !value
            ? 'border-yellow-400 bg-yellow-400/5 text-yellow-400'
            : 'border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-500 hover:text-white'
        }`}
      >
        {noLabel}
      </button>
    </div>
  )
}

/* ─── Next button ─────────────────────────────────────────────────────────── */

function NextBtn({
  onClick,
  disabled,
  label = 'Próximo',
}: {
  onClick: () => void
  disabled?: boolean
  label?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-40 disabled:cursor-not-allowed text-black font-black rounded-2xl px-8 py-4 text-base transition-all duration-200 hover:shadow-[0_0_28px_rgba(250,204,21,0.4)] hover:scale-[1.01] active:scale-[0.99]"
    >
      {label}
      <IconArrow />
    </button>
  )
}

/* ─── Result screen ───────────────────────────────────────────────────────── */

function ResultScreen({
  initial,
  name,
  segment,
}: {
  initial: { projectType: ProjectType; pageCount: number; hasAdmin: boolean; hasLogo: boolean; hasDomain: boolean }
  name: string
  segment: string
}) {
  const [type, setType] = useState<ProjectType>(initial.projectType)
  const [pages, setPages] = useState(initial.pageCount)
  const [hasAdmin, setHasAdmin] = useState(initial.hasAdmin)
  const [hasLogo, setHasLogo] = useState(initial.hasLogo)
  const [hasDomain, setHasDomain] = useState(initial.hasDomain)

  const total = calcTotal(type, pages, hasAdmin, hasLogo, hasDomain)
  const half = Math.ceil(total / 2)

  const WA_NUMBER =
    (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '5511999999999').replace(/\D/g, '')

  function handleApprove() {
    const msg = buildWAMessage({ projectType: type, pageCount: type === 'institucional' ? pages : null, hasAdmin, hasLogo, hasDomain, totalValue: total })
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer')
  }

  const typeLabels: Record<ProjectType, string> = {
    landing_page: 'Landing Page',
    institucional: 'Site Institucional',
    loja_virtual: 'Loja Virtual',
  }

  const baseLabel = () => {
    if (type === 'landing_page') return `Landing Page (1 página) — ${fmtBRL(497)}`
    if (type === 'loja_virtual') return `Loja Virtual — ${fmtBRL(1500)}`
    const base = pages <= 4 ? 697 : 697 + (pages - 4) * 100
    return `Site Institucional (${pages} pág.) — ${fmtBRL(base)}`
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">
          Seu orçamento
        </p>
        <p className="text-5xl sm:text-6xl font-black text-yellow-400 mb-2 transition-all duration-300">
          {fmtBRL(total)}
        </p>
        <p className="text-sm text-zinc-400">
          Pagamento em{' '}
          <strong className="text-white">
            2×: {fmtBRL(half)} agora + {fmtBRL(total - half)} no mês seguinte
          </strong>{' '}
          — sem juros
        </p>
      </div>

      {/* Tipo */}
      <div className="rounded-2xl border border-zinc-700 bg-zinc-900 p-5 space-y-3">
        <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Tipo de projeto</p>
        <div className="grid grid-cols-3 gap-2">
          {(['landing_page', 'institucional', 'loja_virtual'] as ProjectType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => { setType(t); if (t !== 'institucional') setPages(1) }}
              className={`py-2.5 px-2 text-xs font-semibold rounded-xl border transition-all duration-200 ${
                type === t
                  ? 'border-yellow-400 bg-yellow-400/10 text-yellow-400'
                  : 'border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white'
              }`}
            >
              {typeLabels[t]}
            </button>
          ))}
        </div>

        {/* Páginas (só Institucional) */}
        {type === 'institucional' && (
          <div className="pt-1">
            <p className="text-xs font-semibold text-zinc-400 mb-2">
              Número de páginas
              <span className="ml-2 text-zinc-600 font-normal">(a partir de 5 páginas: +R$100 cada)</span>
            </p>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setPages((p) => Math.max(1, p - 1))}
                className="w-10 h-10 rounded-xl border border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-white font-bold text-lg transition-all flex items-center justify-center"
                aria-label="Reduzir páginas"
              >
                −
              </button>
              <span className="text-2xl font-black text-white w-8 text-center">{pages}</span>
              <button
                type="button"
                onClick={() => setPages((p) => p + 1)}
                className="w-10 h-10 rounded-xl border border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-white font-bold text-lg transition-all flex items-center justify-center"
                aria-label="Adicionar página"
              >
                +
              </button>
              <span className="text-sm text-zinc-500 ml-1">{baseLabel()}</span>
            </div>
          </div>
        )}
      </div>

      {/* Adicionais */}
      <div className="rounded-2xl border border-zinc-700 bg-zinc-900 p-5 space-y-3">
        <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Adicionais</p>

        {[
          { label: 'Painel admin / backend (CRUD, área logada)', price: 1000, value: hasAdmin, onChange: setHasAdmin, tip: 'Inclui área administrativa para gerenciar conteúdo do site.' },
          { label: 'Criação de logotipo profissional', price: 220, value: !hasLogo, onChange: (v: boolean) => setHasLogo(!v), tip: 'Necessário pois você ainda não tem logo.' },
          { label: 'Registro de domínio + configuração DNS', price: 140, value: !hasDomain, onChange: (v: boolean) => setHasDomain(!v), tip: 'Compra e configuração do seu domínio .com.br.' },
        ].map(({ label, price, value, onChange, tip }) => (
          <label
            key={label}
            className={`flex items-start gap-3 p-3.5 rounded-xl cursor-pointer border transition-all duration-200 ${
              value
                ? 'border-yellow-400/40 bg-yellow-400/5'
                : 'border-zinc-800 hover:border-zinc-700'
            }`}
          >
            <span
              onClick={() => onChange(!value)}
              className={`mt-0.5 w-5 h-5 shrink-0 rounded-md border-2 flex items-center justify-center transition-all cursor-pointer ${
                value ? 'border-yellow-400 bg-yellow-400' : 'border-zinc-600 bg-transparent'
              }`}
            >
              {value && <IconCheck className="w-3 h-3 text-black" />}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className={`text-sm font-semibold ${value ? 'text-white' : 'text-zinc-400'}`}>
                  {label}
                </span>
                <span className="text-sm font-bold text-yellow-400 shrink-0">+{fmtBRL(price)}</span>
              </div>
              <p className="text-xs text-zinc-600 mt-0.5">{tip}</p>
            </div>
            <input type="checkbox" checked={value} onChange={() => onChange(!value)} className="sr-only" />
          </label>
        ))}
      </div>

      {/* Resumo texto */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 px-5 py-4 text-sm text-zinc-400 space-y-1">
        <p><span className="text-zinc-500">Nome:</span> <span className="text-white font-semibold">{name}</span></p>
        <p><span className="text-zinc-500">Segmento:</span> <span className="text-white">{segment}</span></p>
      </div>

      {/* CTA */}
      <button
        type="button"
        onClick={handleApprove}
        className="w-full flex items-center justify-center gap-2.5 bg-yellow-400 hover:bg-yellow-300 text-black font-black rounded-2xl px-8 py-4 text-base transition-all duration-200 hover:shadow-[0_0_32px_rgba(250,204,21,0.5)] hover:scale-[1.01] active:scale-[0.99]"
      >
        <IconWA />
        APROVAR ORÇAMENTO
        <IconArrow />
      </button>

      <p className="text-center text-xs text-zinc-600">
        Você será redirecionado ao WhatsApp com o resumo do orçamento final.
      </p>
    </div>
  )
}

/* ─── Main form ───────────────────────────────────────────────────────────── */

export default function OrcamentoPage() {
  const [form, setForm] = useState<FormState>(INIT)
  const [stepIndex, setStepIndex] = useState(0) // index into getSteps()
  const [saving, setSaving] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [done, setDone] = useState(false)
  const [emailFailed, setEmailFailed] = useState(false)

  const steps = getSteps(form.projectType)
  const currentStep = steps[stepIndex] // 0-7 logical step
  const totalSteps = steps.length
  // Don't count the result screen (step 7) in the progress bar
  const progressTotal = totalSteps - 1

  const set = useCallback(
    <K extends keyof FormState>(key: K, value: FormState[K]) =>
      setForm((f) => ({ ...f, [key]: value })),
    [],
  )

  function next() {
    setStepIndex((i) => Math.min(i + 1, steps.length - 1))
  }
  function back() {
    setEmailError('')
    setStepIndex((i) => Math.max(i - 1, 0))
  }

  async function handleEmailSubmit() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!form.name.trim() || form.name.trim().length < 2) {
      setEmailError('Informe seu nome completo.')
      return
    }
    if (!emailRegex.test(form.email)) {
      setEmailError('Informe um e-mail válido.')
      return
    }
    setEmailError('')
    setSaving(true)

    const total = calcTotal(
      form.projectType!,
      form.pageCount,
      form.hasAdmin,
      form.hasLogo,
      form.hasDomain,
    )

    const result = await saveQuoteLeadAction({
      name: form.name.trim(),
      email: form.email.trim(),
      projectType: form.projectType!,
      pageCount: form.projectType === 'institucional' ? form.pageCount : null,
      segment: form.segment.trim(),
      hasAdmin: form.hasAdmin,
      hasLogo: form.hasLogo,
      hasDomain: form.hasDomain,
      totalValue: total,
    })

    setSaving(false)

    if (!result.ok) {
      if (result.error === 'email_invalid') {
        setEmailError('Informe um e-mail válido.')
        return
      }
      // DB error — still proceed to result
    }

    if (result.emailFailed) setEmailFailed(true)
    setDone(true)
    next()
  }

  /* ── Render steps ─────────────────────────────────────────────────────── */

  function renderStep() {
    // Step 0 — tipo de projeto
    if (currentStep === 0) {
      return (
        <div className="space-y-4">
          <StepHeader
            label="Tipo de projeto"
            title="O que você precisa?"
            sub="Escolha o tipo de projeto que melhor descreve o que você busca."
          />
          <div className="space-y-3">
            <CardOption
              selected={form.projectType === 'landing_page'}
              onClick={() => set('projectType', 'landing_page')}
            >
              <p className="font-bold text-base">Landing Page</p>
              <p className="text-sm text-zinc-400 mt-1">
                Página única, focada em um produto ou serviço específico. Ideal para converter visitas em contatos. <span className="text-yellow-400 font-semibold">R$497</span>
              </p>
            </CardOption>
            <CardOption
              selected={form.projectType === 'institucional'}
              onClick={() => set('projectType', 'institucional')}
            >
              <p className="font-bold text-base">Site Institucional</p>
              <p className="text-sm text-zinc-400 mt-1">
                Site com múltiplas páginas (Início, Sobre, Serviços, Contato...). A partir de <span className="text-yellow-400 font-semibold">R$697</span>
              </p>
            </CardOption>
            <CardOption
              selected={form.projectType === 'loja_virtual'}
              onClick={() => set('projectType', 'loja_virtual')}
            >
              <p className="font-bold text-base">Loja Virtual</p>
              <p className="text-sm text-zinc-400 mt-1">
                E-commerce completo para vender produtos online. <span className="text-yellow-400 font-semibold">R$1.500</span>
              </p>
            </CardOption>
          </div>
          <div className="pt-2">
            <NextBtn onClick={next} disabled={!form.projectType} />
          </div>
        </div>
      )
    }

    // Step 1 — quantidade de páginas (só institucional)
    if (currentStep === 1) {
      return (
        <div className="space-y-6">
          <StepHeader
            label="Páginas"
            title="Quantas páginas terá o site?"
            sub="Exemplos: Início, Sobre, Serviços, Blog, Contato = 5 páginas."
          />
          <div className="flex items-center justify-center gap-6 py-4">
            <button
              type="button"
              onClick={() => set('pageCount', Math.max(1, form.pageCount - 1))}
              className="w-14 h-14 rounded-2xl border-2 border-zinc-700 text-white font-bold text-2xl hover:border-yellow-400 hover:text-yellow-400 transition-all flex items-center justify-center"
              aria-label="Reduzir"
            >
              −
            </button>
            <div className="text-center">
              <p className="text-6xl font-black text-white">{form.pageCount}</p>
              <p className="text-sm text-zinc-500 mt-1">
                {form.pageCount <= 4
                  ? `até 4 páginas — ${fmtBRL(697)}`
                  : `${form.pageCount} páginas — ${fmtBRL(697 + (form.pageCount - 4) * 100)}`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => set('pageCount', form.pageCount + 1)}
              className="w-14 h-14 rounded-2xl border-2 border-zinc-700 text-white font-bold text-2xl hover:border-yellow-400 hover:text-yellow-400 transition-all flex items-center justify-center"
              aria-label="Adicionar"
            >
              +
            </button>
          </div>
          {form.pageCount > 4 && (
            <p className="text-center text-sm text-zinc-500">
              Base R$697 + {form.pageCount - 4} página(s) adicional(is) × R$100 ={' '}
              <strong className="text-yellow-400">{fmtBRL(697 + (form.pageCount - 4) * 100)}</strong>
            </p>
          )}
          <NextBtn onClick={next} />
        </div>
      )
    }

    // Step 2 — segmento
    if (currentStep === 2) {
      return (
        <div className="space-y-6">
          <StepHeader
            label="Segmento"
            title="O que o seu negócio faz?"
            sub="Descreva brevemente seu negócio ou segmento de atuação."
          />
          <textarea
            value={form.segment}
            onChange={(e) => set('segment', e.target.value)}
            placeholder="Ex.: Escritório de advocacia especializado em direito trabalhista"
            rows={4}
            className="w-full bg-zinc-900 border border-zinc-700 hover:border-zinc-600 focus:border-yellow-400 focus:outline-none rounded-2xl px-4 py-3.5 text-white placeholder-zinc-600 resize-none text-sm transition-colors"
          />
          <NextBtn onClick={next} disabled={form.segment.trim().length < 3} />
        </div>
      )
    }

    // Step 3 — painel admin
    if (currentStep === 3) {
      return (
        <div className="space-y-6">
          <StepHeader
            label="Painel administrativo"
            title="Precisa de área logada ou painel para gerenciar conteúdo?"
            sub="Ex.: cadastrar produtos, editar textos, gerenciar clientes no próprio site."
          />
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-sm text-zinc-400">
            Se sim, adicionamos um <strong className="text-white">painel admin personalizado</strong> (CRUD completo). Custo: <span className="text-yellow-400 font-bold">+R$1.000</span>
          </div>
          <YesNo value={form.hasAdmin} onChange={(v) => set('hasAdmin', v)} />
          <NextBtn onClick={next} />
        </div>
      )
    }

    // Step 4 — logo
    if (currentStep === 4) {
      return (
        <div className="space-y-6">
          <StepHeader
            label="Logotipo"
            title="Você já tem logotipo profissional?"
            sub="Um logo profissional é essencial para a identidade visual do site."
          />
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-sm text-zinc-400">
            Se não tiver, criamos uma <strong className="text-white">identidade visual completa</strong> (logo + paleta). Custo: <span className="text-yellow-400 font-bold">+R$220</span>
          </div>
          <YesNo
            value={form.hasLogo}
            onChange={(v) => set('hasLogo', v)}
            yesLabel="Sim, já tenho"
            noLabel="Não tenho"
          />
          <NextBtn onClick={next} />
        </div>
      )
    }

    // Step 5 — domínio
    if (currentStep === 5) {
      return (
        <div className="space-y-6">
          <StepHeader
            label="Domínio"
            title="Você já tem domínio próprio?"
            sub="Ex.: suaempresa.com.br — o endereço do seu site na internet."
          />
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-sm text-zinc-400">
            Se não tiver, cuidamos do <strong className="text-white">registro e configuração completa</strong>. Custo: <span className="text-yellow-400 font-bold">+R$140</span>
          </div>
          <YesNo
            value={form.hasDomain}
            onChange={(v) => set('hasDomain', v)}
            yesLabel="Sim, já tenho"
            noLabel="Não tenho"
          />
          <NextBtn onClick={next} />
        </div>
      )
    }

    // Step 6 — gate de e-mail
    if (currentStep === 6) {
      return (
        <div className="space-y-5">
          <StepHeader
            label="Quase lá!"
            title="Informe seu nome e e-mail"
            sub="Para receber uma cópia do seu orçamento e entrarmos em contato."
          />
          <div>
            <label htmlFor="lead-name" className="block text-sm font-semibold text-zinc-300 mb-2">
              Nome completo
            </label>
            <input
              id="lead-name"
              type="text"
              value={form.name}
              onChange={(e) => { set('name', e.target.value); setEmailError('') }}
              placeholder="Ex.: João Silva"
              autoComplete="name"
              className="w-full bg-zinc-900 border border-zinc-700 hover:border-zinc-600 focus:border-yellow-400 focus:outline-none rounded-xl px-4 py-3.5 text-white placeholder-zinc-600 text-sm transition-colors"
            />
          </div>
          <div>
            <label htmlFor="lead-email" className="block text-sm font-semibold text-zinc-300 mb-2">
              E-mail
            </label>
            <input
              id="lead-email"
              type="email"
              value={form.email}
              onChange={(e) => { set('email', e.target.value); setEmailError('') }}
              placeholder="voce@empresa.com.br"
              autoComplete="email"
              className="w-full bg-zinc-900 border border-zinc-700 hover:border-zinc-600 focus:border-yellow-400 focus:outline-none rounded-xl px-4 py-3.5 text-white placeholder-zinc-600 text-sm transition-colors"
            />
          </div>
          {emailError && (
            <p className="text-sm text-red-400">{emailError}</p>
          )}
          <button
            type="button"
            onClick={handleEmailSubmit}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed text-black font-black rounded-2xl px-8 py-4 text-base transition-all duration-200 hover:shadow-[0_0_28px_rgba(250,204,21,0.4)] hover:scale-[1.01] active:scale-[0.99]"
          >
            {saving ? 'Calculando…' : 'Ver meu orçamento →'}
          </button>
          <p className="text-center text-xs text-zinc-600">
            Sem spam. Apenas seu orçamento e, se quiser, contato para tirar dúvidas.
          </p>
        </div>
      )
    }

    // Step 7 — resultado
    if (currentStep === 7) {
      return (
        <>
          {emailFailed && (
            <div className="mb-4 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-zinc-400">
              Não foi possível enviar o e-mail, mas seu orçamento está aqui abaixo. ✓
            </div>
          )}
          <ResultScreen
            initial={{
              projectType: form.projectType!,
              pageCount: form.pageCount,
              hasAdmin: form.hasAdmin,
              hasLogo: form.hasLogo,
              hasDomain: form.hasDomain,
            }}
            name={form.name}
            segment={form.segment}
          />
        </>
      )
    }

    return null
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white antialiased">

      {/* ── NAV ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#0a0a0a]/95 backdrop-blur-sm">
        <nav className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between" aria-label="Navegação">
          <Link href="/" aria-label="TOP SITE — página inicial">
            <Image src="/logo.png" alt="TOP SITE" width={120} height={40} className="h-8 w-auto" priority />
          </Link>
          <Link
            href="/login"
            className="text-xs font-medium text-zinc-400 hover:text-white border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 px-3.5 py-2 rounded-xl transition-all"
          >
            Acessar painel
          </Link>
        </nav>
      </header>

      <main className="max-w-lg mx-auto px-4 sm:px-6 py-12 sm:py-20">

        {/* ── Header estático ──────────────────────────────────────────── */}
        {!done && (
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 border border-yellow-400/20 rounded-full px-4 py-1.5 text-xs font-semibold text-yellow-400/80 mb-4" style={{ background: 'rgba(250,204,21,0.05)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" aria-hidden="true" />
              Orçamento automático e instantâneo
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              Quanto custa o<br />
              <span className="text-yellow-400">seu site ideal?</span>
            </h1>
          </div>
        )}

        {done && (
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-green-950 border border-green-800 rounded-full px-4 py-1.5 text-xs font-semibold text-green-400 mb-4">
              <IconCheck className="w-3.5 h-3.5" />
              Orçamento enviado para {form.email}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              Aqui está seu<br />
              <span className="text-yellow-400">orçamento personalizado</span>
            </h2>
          </div>
        )}

        {/* ── Progress (não mostrar na tela final) ─────────────────────── */}
        {currentStep < 7 && (
          <ProgressBar current={stepIndex} total={progressTotal} />
        )}

        {/* ── Step content ─────────────────────────────────────────────── */}
        <div key={stepIndex} className="animate-in fade-in slide-in-from-right-4 duration-300">
          {renderStep()}
        </div>

        {/* ── Back button ──────────────────────────────────────────────── */}
        {stepIndex > 0 && currentStep < 7 && (
          <button
            type="button"
            onClick={back}
            className="w-full mt-4 text-sm text-zinc-500 hover:text-zinc-300 transition-colors py-2"
          >
            ← Voltar
          </button>
        )}
      </main>
    </div>
  )
}

/* ─── Step header ─────────────────────────────────────────────────────────── */

function StepHeader({ label, title, sub }: { label: string; title: string; sub: string }) {
  return (
    <div className="mb-6">
      <p className="text-xs font-bold uppercase tracking-widest text-yellow-400/70 mb-2">{label}</p>
      <h2 className="text-xl sm:text-2xl font-black text-white leading-tight mb-2">{title}</h2>
      <p className="text-sm text-zinc-400 leading-relaxed">{sub}</p>
    </div>
  )
}
