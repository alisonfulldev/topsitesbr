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
  whatsapp: string
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
  whatsapp: '',
}

function getSteps(type: ProjectType | null) {
  if (type === 'institucional') return [0, 1, 2, 3, 4, 5, 6, 7]
  return [0, 2, 3, 4, 5, 6, 7]
}

/* ─── Icons ──────────────────────────────────────────────────────────────── */

function IconCheck({ className = 'w-3 h-3' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  )
}

function IconChevron() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5" aria-hidden>
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

function IconChevronLeft() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5" aria-hidden>
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

function IconWA() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

/* ─── Progress ────────────────────────────────────────────────────────────── */

function Progress({ current, total }: { current: number; total: number }) {
  return (
    <div className="mb-3 sm:mb-10">
      <div className="flex gap-[3px] mb-2.5">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className="flex-1 h-[2px] rounded-full transition-all duration-500"
            style={{ background: i <= current ? '#facc15' : 'rgba(0,0,0,0.1)' }}
          />
        ))}
      </div>
      <p className="text-[11px] tabular-nums" style={{ color: '#444' }}>
        {current + 1} <span style={{ color: '#2a2a2a' }}>/</span> {total}
      </p>
    </div>
  )
}

/* ─── Step header ─────────────────────────────────────────────────────────── */

function StepHeader({ label, title, sub }: { label: string; title: string; sub: string }) {
  return (
    <div className="mb-3 sm:mb-7">
      <p className="text-[10px] font-medium tracking-[0.14em] uppercase mb-1.5 sm:mb-3" style={{ color: '#d97706' }}>
        {label}
      </p>
      <h2 className="text-[18px] sm:text-[22px] font-bold leading-[1.25] tracking-tight text-[#0d0d0d] mb-1 sm:mb-2">
        {title}
      </h2>
      <p className="text-[13px] sm:text-[14px] leading-relaxed" style={{ color: '#666' }}>
        {sub}
      </p>
    </div>
  )
}

/* ─── Card option (step 1) ────────────────────────────────────────────────── */

function CardOption({
  selected,
  onClick,
  title,
  price,
  desc,
}: {
  selected: boolean
  onClick: () => void
  title: string
  price: string
  desc: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left px-5 py-2.5 sm:py-4 rounded-xl border transition-all duration-200 relative group"
      style={{
        background: selected ? '#f0f0f0' : '#fafafa',
        borderColor: selected ? 'rgba(250,204,21,0.4)' : 'rgba(0,0,0,0.09)',
        boxShadow: selected ? '0 0 0 0.5px rgba(250,204,21,0.2)' : undefined,
      }}
    >
      {selected && (
        <span
          className="absolute top-3.5 right-3.5 w-[18px] h-[18px] rounded-full flex items-center justify-center"
          style={{ background: '#facc15' }}
        >
          <IconCheck />
        </span>
      )}
      <div className="flex items-center justify-between gap-3 mb-1.5 pr-5">
        <p className="text-[15px] font-semibold text-[#0d0d0d]">{title}</p>
        <span
          className="text-[13px] font-bold tabular-nums shrink-0"
          style={{ color: selected ? '#b45309' : '#999' }}
        >
          {price}
        </span>
      </div>
      <p className="text-[13px] leading-relaxed" style={{ color: '#666' }}>
        {desc}
      </p>
    </button>
  )
}

/* ─── Yes / No ────────────────────────────────────────────────────────────── */

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
    <div className="grid grid-cols-2 gap-2.5">
      {([{ label: yesLabel, val: true }, { label: noLabel, val: false }] as const).map(({ label, val }) => (
        <button
          key={String(val)}
          type="button"
          onClick={() => onChange(val)}
          className="py-3 sm:py-4 rounded-xl border text-[15px] font-medium transition-all duration-200"
          style={{
            background: value === val ? '#f0f0f0' : '#fafafa',
            borderColor: value === val ? 'rgba(250,204,21,0.4)' : 'rgba(0,0,0,0.09)',
            color: value === val ? '#0d0d0d' : '#888',
            boxShadow: value === val ? '0 0 0 0.5px rgba(250,204,21,0.2)' : undefined,
          }}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

/* ─── Primary button ─────────────────────────────────────────────────────── */

function PrimaryBtn({
  onClick,
  disabled,
  loading,
  label = 'Continuar',
}: {
  onClick: () => void
  disabled?: boolean
  loading?: boolean
  label?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className="w-full py-3 sm:py-3.5 rounded-xl text-[15px] font-semibold transition-all duration-200 disabled:opacity-20 disabled:cursor-not-allowed active:scale-[0.99]"
      style={{
        background: '#facc15',
        color: '#000',
      }}
      onMouseEnter={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.background = '#fde047'
          e.currentTarget.style.boxShadow = '0 0 36px rgba(250,204,21,0.2)'
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = '#facc15'
        e.currentTarget.style.boxShadow = ''
      }}
    >
      <span className="flex items-center justify-center gap-2">
        {loading ? (
          <>
            <span className="inline-block w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            Calculando…
          </>
        ) : (
          <>
            {label}
            <IconChevron />
          </>
        )}
      </span>
    </button>
  )
}

/* ─── Info note ──────────────────────────────────────────────────────────── */

function Note({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex gap-3 items-start px-4 py-3 sm:py-4 rounded-xl"
      style={{ background: '#f5f5f5', border: '1px solid rgba(0,0,0,0.07)' }}
    >
      <div
        className="w-px self-stretch rounded-full shrink-0 mt-0.5"
        style={{ background: '#d97706' }}
      />
      <p className="text-[14px] leading-relaxed" style={{ color: '#555' }}>
        {children}
      </p>
    </div>
  )
}

/* ─── Toggle switch ──────────────────────────────────────────────────────── */

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      className="relative shrink-0 w-9 h-[20px] rounded-full transition-all duration-300"
      style={{
        background: value ? '#facc15' : 'transparent',
        border: value ? '1px solid #facc15' : '1px solid rgba(0,0,0,0.2)',
      }}
    >
      <span
        className="absolute top-[2px] w-3.5 h-3.5 rounded-full transition-all duration-300"
        style={{
          left: value ? '18px' : '2px',
          background: value ? '#000' : 'rgba(0,0,0,0.2)',
        }}
      />
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
  const WA_NUMBER = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '5511999999999').replace(/\D/g, '')

  function handleApprove() {
    const msg = buildWAMessage({
      projectType: type,
      pageCount: type === 'institucional' ? pages : null,
      hasAdmin, hasLogo, hasDomain, totalValue: total,
    })
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer')
  }

  const typeLabels: Record<ProjectType, string> = {
    landing_page: 'Landing Page',
    institucional: 'Institucional',
    loja_virtual: 'Loja Virtual',
  }

  function basePrice() {
    if (type === 'landing_page') return 497
    if (type === 'loja_virtual') return 1500
    return pages <= 4 ? 697 : 697 + (pages - 4) * 100
  }

  const addons = [
    {
      label: 'Painel admin / backend',
      tip: 'Área administrativa para gerenciar conteúdo.',
      price: 1000,
      value: hasAdmin,
      onChange: setHasAdmin,
    },
    {
      label: 'Criação de logotipo',
      tip: 'Identidade visual completa (logo + paleta).',
      price: 220,
      value: !hasLogo,
      onChange: (v: boolean) => setHasLogo(!v),
    },
    {
      label: 'Domínio + configuração DNS',
      tip: 'Registro e configuração do .com.br.',
      price: 140,
      value: !hasDomain,
      onChange: (v: boolean) => setHasDomain(!v),
    },
  ]

  return (
    <div className="space-y-4">

      {/* Total card */}
      <div
        className="relative py-10 text-center rounded-2xl overflow-hidden"
        style={{ background: '#f7f7f7', border: '1px solid rgba(0,0,0,0.07)' }}
      >
        {/* Glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden
          style={{
            background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(250,204,21,0.08) 0%, transparent 70%)',
          }}
        />
        <p
          className="relative text-[10px] font-medium tracking-[0.16em] uppercase mb-3"
          style={{ color: '#888' }}
        >
          Investimento total
        </p>
        <p className="relative text-[58px] sm:text-[68px] font-black text-[#0d0d0d] leading-none tabular-nums">
          {fmtBRL(total)}
        </p>
        <div className="relative mt-4 flex flex-col items-center gap-2">
          <div
            className="inline-flex items-center gap-1 rounded-full px-4 py-1.5"
            style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.07)' }}
          >
            <p className="text-[12px]" style={{ color: '#666' }}>
              2×{' '}
              <span className="text-[#0d0d0d] font-medium">{fmtBRL(half)}</span>
              <span style={{ color: '#aaa' }} className="mx-1">·</span>
              <span className="text-[#0d0d0d] font-medium">{fmtBRL(total - half)}</span>
              <span style={{ color: '#888' }}> no mês seguinte</span>
            </p>
          </div>
          <p className="text-[12px]" style={{ color: '#aaa' }}>
            2× no boleto &nbsp;·&nbsp; 12× no cartão
          </p>
        </div>
      </div>

      {/* Tipo */}
      <div
        className="rounded-xl p-4"
        style={{ background: '#f7f7f7', border: '1px solid rgba(0,0,0,0.07)' }}
      >
        <p className="text-[10px] font-medium tracking-[0.12em] uppercase mb-3" style={{ color: '#888' }}>
          Tipo de projeto
        </p>
        <div
          className="flex gap-0.5 rounded-lg p-1"
          style={{ background: '#ebebeb', border: '1px solid rgba(0,0,0,0.07)' }}
        >
          {(['landing_page', 'institucional', 'loja_virtual'] as ProjectType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => { setType(t); if (t !== 'institucional') setPages(1); else setPages((p) => Math.max(4, p)) }}
              className="flex-1 py-2 text-[11px] font-medium rounded-md transition-all duration-200"
              style={{
                background: type === t ? '#ffffff' : 'transparent',
                color: type === t ? '#0d0d0d' : '#888',
                border: type === t ? '1px solid rgba(0,0,0,0.09)' : '1px solid transparent',
              }}
            >
              {typeLabels[t]}
            </button>
          ))}
        </div>

        {type === 'institucional' && (
          <div
            className="mt-4 pt-4"
            style={{ borderTop: '1px solid rgba(0,0,0,0.07)' }}
          >
            <p className="text-[11px] mb-3" style={{ color: '#666' }}>
              Número de páginas
              <span style={{ color: '#aaa' }} className="ml-1.5">· 4 incluídas, a partir da 5ª: +R$100 cada</span>
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setPages((p) => Math.max(4, p - 1))}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-lg leading-none transition-all duration-200"
                style={{ border: '1px solid rgba(0,0,0,0.12)', color: '#666' }}
                aria-label="Reduzir"
              >
                −
              </button>
              <span className="text-2xl font-bold text-[#0d0d0d] w-7 text-center tabular-nums">{pages}</span>
              <button
                type="button"
                onClick={() => setPages((p) => p + 1)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-lg leading-none transition-all duration-200"
                style={{ border: '1px solid rgba(0,0,0,0.12)', color: '#666' }}
                aria-label="Adicionar"
              >
                +
              </button>
              <span className="text-[13px] tabular-nums ml-1" style={{ color: '#666' }}>
                = {fmtBRL(basePrice())}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Adicionais */}
      <div
        className="rounded-xl px-4"
        style={{ background: '#f7f7f7', border: '1px solid rgba(0,0,0,0.07)' }}
      >
        <p
          className="text-[10px] font-medium tracking-[0.12em] uppercase pt-4 pb-3"
          style={{ color: '#888' }}
        >
          Adicionais
        </p>
        <div style={{ borderTop: '1px solid rgba(0,0,0,0.07)' }}>
          {addons.map(({ label, tip, price, value, onChange }) => (
            <div
              key={label}
              className="flex items-center gap-3.5 py-4"
              style={{ borderBottom: '1px solid rgba(0,0,0,0.07)' }}
            >
              <Toggle value={value} onChange={onChange} />
              <div className="flex-1 min-w-0">
                <p
                  className="text-[14px] transition-colors"
                  style={{ color: value ? '#0d0d0d' : '#888' }}
                >
                  {label}
                </p>
                <p className="text-[12px] mt-0.5" style={{ color: '#aaa' }}>{tip}</p>
              </div>
              <span
                className="text-[13px] font-semibold tabular-nums shrink-0 transition-colors"
                style={{ color: value ? '#b45309' : '#ccc' }}
              >
                +{fmtBRL(price)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Resumo */}
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-xl"
        style={{ background: '#f5f5f5', border: '1px solid rgba(0,0,0,0.07)' }}
      >
        <div
          className="w-px self-stretch rounded-full shrink-0"
          style={{ background: 'rgba(0,0,0,0.12)' }}
        />
        <div className="space-y-0.5 text-[13px]">
          <p>
            <span style={{ color: '#888' }}>Nome — </span>
            <span style={{ color: '#444' }}>{name}</span>
          </p>
          <p>
            <span style={{ color: '#888' }}>Segmento — </span>
            <span style={{ color: '#444' }}>{segment}</span>
          </p>
        </div>
      </div>

      {/* CTA */}
      <button
        type="button"
        onClick={handleApprove}
        className="w-full py-4 rounded-xl text-[15px] font-semibold transition-all duration-200 active:scale-[0.99]"
        style={{ background: '#facc15', color: '#000' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#fde047'
          e.currentTarget.style.boxShadow = '0 0 40px rgba(250,204,21,0.25)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#facc15'
          e.currentTarget.style.boxShadow = ''
        }}
      >
        <span className="flex items-center justify-center gap-2.5">
          <IconWA />
          Aprovar orçamento no WhatsApp
          <IconChevron />
        </span>
      </button>

      <p className="text-center text-[12px]" style={{ color: '#aaa' }}>
        Você será redirecionado ao WhatsApp com o resumo final ajustado.
      </p>
    </div>
  )
}

/* ─── Main ────────────────────────────────────────────────────────────────── */

export default function OrcamentoPage() {
  const [form, setForm] = useState<FormState>(INIT)
  const [stepIndex, setStepIndex] = useState(0)
  const [saving, setSaving] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [done, setDone] = useState(false)
  const [emailFailed, setEmailFailed] = useState(false)

  const steps = getSteps(form.projectType)
  const currentStep = steps[stepIndex]
  const progressTotal = steps.length - 1

  const set = useCallback(
    <K extends keyof FormState>(key: K, value: FormState[K]) =>
      setForm((f) => ({ ...f, [key]: value })),
    [],
  )

  function next() { setStepIndex((i) => Math.min(i + 1, steps.length - 1)) }
  function back() { setEmailError(''); setStepIndex((i) => Math.max(i - 1, 0)) }

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

    const total = calcTotal(form.projectType!, form.pageCount, form.hasAdmin, form.hasLogo, form.hasDomain)

    const result = await saveQuoteLeadAction({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.whatsapp.trim() || undefined,
      projectType: form.projectType!,
      pageCount: form.projectType === 'institucional' ? form.pageCount : null,
      segment: form.segment.trim(),
      hasAdmin: form.hasAdmin,
      hasLogo: form.hasLogo,
      hasDomain: form.hasDomain,
      totalValue: total,
    })

    setSaving(false)

    if (!result.ok && result.error === 'email_invalid') {
      setEmailError('Informe um e-mail válido.')
      return
    }
    if (result.emailFailed) setEmailFailed(true)
    setDone(true)
    next()
  }

  /* ── Steps ────────────────────────────────────────────────────────────── */

  function renderStep() {
    if (currentStep === 0) return (
      <div className="space-y-3 sm:space-y-5">
        <StepHeader
          label="Tipo de projeto"
          title="O que você precisa?"
          sub="Escolha o tipo que melhor descreve o que você busca."
        />
        <div className="space-y-2">
          <CardOption
            selected={form.projectType === 'landing_page'}
            onClick={() => set('projectType', 'landing_page')}
            title="Landing Page"
            price="R$497"
            desc="Página única focada em converter visitas em contatos. Ideal para um produto ou serviço específico."
          />
          <CardOption
            selected={form.projectType === 'institucional'}
            onClick={() => { set('projectType', 'institucional'); set('pageCount', Math.max(4, form.pageCount)) }}
            title="Site Institucional"
            price="a partir de R$697"
            desc="Site com múltiplas páginas — Início, Sobre, Serviços, Contato e mais."
          />
          <CardOption
            selected={form.projectType === 'loja_virtual'}
            onClick={() => set('projectType', 'loja_virtual')}
            title="Loja Virtual"
            price="R$1.500"
            desc="E-commerce completo para vender produtos online com carrinho e pagamento."
          />
        </div>
        <PrimaryBtn onClick={next} disabled={!form.projectType} />
      </div>
    )

    if (currentStep === 1) return (
      <div className="space-y-4 sm:space-y-7">
        <StepHeader
          label="Páginas"
          title="Quantas páginas terá o site?"
          sub="4 páginas incluídas no valor base. A partir da 5ª, +R$100 cada."
        />
        <div className="flex items-center justify-center gap-8 py-3 sm:py-6">
          <button
            type="button"
            onClick={() => set('pageCount', Math.max(4, form.pageCount - 1))}
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl leading-none transition-all duration-200"
            style={{ border: '1px solid rgba(0,0,0,0.12)', color: '#666' }}
            aria-label="Reduzir"
          >
            −
          </button>
          <div className="text-center">
            <p className="text-[52px] sm:text-[76px] font-black text-[#0d0d0d] leading-none tabular-nums">{form.pageCount}</p>
            <p className="text-[15px] font-bold mt-2 tabular-nums" style={{ color: '#b45309' }}>
              {fmtBRL(form.pageCount <= 4 ? 697 : 697 + (form.pageCount - 4) * 100)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => set('pageCount', form.pageCount + 1)}
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl leading-none transition-all duration-200"
            style={{ border: '1px solid rgba(0,0,0,0.12)', color: '#666' }}
            aria-label="Adicionar"
          >
            +
          </button>
        </div>
        <PrimaryBtn onClick={next} />
      </div>
    )

    if (currentStep === 2) return (
      <div className="space-y-3 sm:space-y-5">
        <StepHeader
          label="Segmento"
          title="O que o seu negócio faz?"
          sub="Descreva brevemente para personalizarmos a proposta."
        />
        <textarea
          value={form.segment}
          onChange={(e) => set('segment', e.target.value)}
          placeholder="Ex.: Escritório de advocacia especializado em direito trabalhista"
          rows={3}
          className="w-full rounded-xl px-4 py-3 sm:py-4 text-[#0d0d0d] text-[15px] placeholder-[#bbb] resize-none transition-all duration-200 leading-relaxed focus:outline-none"
          style={{
            background: '#fafafa',
            border: '1px solid rgba(0,0,0,0.1)',
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(180,83,9,0.4)' }}
          onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)' }}
        />
        <PrimaryBtn onClick={next} disabled={form.segment.trim().length < 3} />
      </div>
    )

    if (currentStep === 3) return (
      <div className="space-y-3 sm:space-y-5">
        <StepHeader
          label="Painel administrativo"
          title="Precisa de área logada para gerenciar conteúdo?"
          sub="Ex.: cadastrar produtos, editar textos, gerenciar cadastros no próprio site."
        />
        <p className="text-[13px]" style={{ color: '#888' }}>
          Investimento: <span className="font-semibold" style={{ color: '#b45309' }}>+R$1.000</span>
        </p>
        <YesNo value={form.hasAdmin} onChange={(v) => set('hasAdmin', v)} />
        <PrimaryBtn onClick={next} />
      </div>
    )

    if (currentStep === 4) return (
      <div className="space-y-3 sm:space-y-5">
        <StepHeader
          label="Logotipo"
          title="Você já tem logotipo profissional?"
          sub="Um logotipo profissional é essencial para a identidade visual do site."
        />
        <p className="text-[13px]" style={{ color: '#888' }}>
          Investimento: <span className="font-semibold" style={{ color: '#b45309' }}>+R$220</span>
        </p>
        <YesNo
          value={form.hasLogo}
          onChange={(v) => set('hasLogo', v)}
          yesLabel="Já tenho"
          noLabel="Não tenho"
        />
        <PrimaryBtn onClick={next} />
      </div>
    )

    if (currentStep === 5) return (
      <div className="space-y-3 sm:space-y-5">
        <StepHeader
          label="Domínio"
          title="Você já tem domínio próprio?"
          sub="Ex.: suaempresa.com.br — o endereço do seu site na internet."
        />
        <p className="text-[13px]" style={{ color: '#888' }}>
          Investimento: <span className="font-semibold" style={{ color: '#b45309' }}>+R$140</span>
        </p>
        <YesNo
          value={form.hasDomain}
          onChange={(v) => set('hasDomain', v)}
          yesLabel="Já tenho"
          noLabel="Não tenho"
        />
        <PrimaryBtn onClick={next} />
      </div>
    )

    if (currentStep === 6) return (
      <div className="space-y-3 sm:space-y-5">
        <StepHeader
          label="Quase lá"
          title="Onde enviamos seu orçamento?"
          sub="Informe seus dados para receber uma cópia por e-mail."
        />
        <div className="space-y-3">
          <div>
            <label
              htmlFor="lead-name"
              className="block text-[12px] font-medium mb-2 tracking-wide"
              style={{ color: '#555' }}
            >
              Nome completo
            </label>
            <input
              id="lead-name"
              type="text"
              value={form.name}
              onChange={(e) => { set('name', e.target.value); setEmailError('') }}
              placeholder="João Silva"
              autoComplete="name"
              className="w-full rounded-xl px-4 py-3 sm:py-4 text-[#0d0d0d] text-[15px] placeholder-[#bbb] transition-all duration-200 focus:outline-none"
              style={{ background: '#fafafa', border: '1px solid rgba(0,0,0,0.1)' }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(180,83,9,0.4)' }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)' }}
            />
          </div>
          <div>
            <label
              htmlFor="lead-email"
              className="block text-[12px] font-medium mb-2 tracking-wide"
              style={{ color: '#555' }}
            >
              E-mail
            </label>
            <input
              id="lead-email"
              type="email"
              value={form.email}
              onChange={(e) => { set('email', e.target.value); setEmailError('') }}
              placeholder="voce@empresa.com.br"
              autoComplete="email"
              className="w-full rounded-xl px-4 py-3 sm:py-4 text-[#0d0d0d] text-[15px] placeholder-[#bbb] transition-all duration-200 focus:outline-none"
              style={{ background: '#fafafa', border: '1px solid rgba(0,0,0,0.1)' }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(180,83,9,0.4)' }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)' }}
            />
          </div>
          <div>
            <label
              htmlFor="lead-whatsapp"
              className="block text-[12px] font-medium mb-2 tracking-wide"
              style={{ color: '#555' }}
            >
              WhatsApp
            </label>
            <input
              id="lead-whatsapp"
              type="tel"
              value={form.whatsapp}
              onChange={(e) => set('whatsapp', e.target.value)}
              placeholder="(11) 99999-9999"
              autoComplete="tel"
              className="w-full rounded-xl px-4 py-3 sm:py-4 text-[#0d0d0d] text-[15px] placeholder-[#bbb] transition-all duration-200 focus:outline-none"
              style={{ background: '#fafafa', border: '1px solid rgba(0,0,0,0.1)' }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(180,83,9,0.4)' }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)' }}
            />
          </div>
        </div>
        {emailError && (
          <p className="text-[13px]" style={{ color: 'rgba(248,113,113,0.8)' }}>{emailError}</p>
        )}
        <PrimaryBtn onClick={handleEmailSubmit} loading={saving} label="Ver meu orçamento" />
        <p className="text-center text-[12px]" style={{ color: '#333' }}>
          Sem spam — apenas seu orçamento e contato para dúvidas.
        </p>
      </div>
    )

    if (currentStep === 7) return (
      <>
        {emailFailed && (
          <div
            className="mb-5 px-4 py-3 rounded-xl text-[13px]"
            style={{ background: '#f5f5f5', border: '1px solid rgba(0,0,0,0.07)', color: '#666' }}
          >
            Não foi possível enviar o e-mail — mas seu orçamento está calculado abaixo.
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

    return null
  }

  const isResult = currentStep === 7

  return (
    <div className="min-h-screen antialiased" style={{ background: '#ffffff', color: '#0d0d0d' }}>

      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden>
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-xl h-72 blur-[100px]"
          style={{ background: 'radial-gradient(ellipse, rgba(250,204,21,0.06) 0%, transparent 65%)' }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.04) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
      </div>

      {/* Nav */}
      <header
        className="relative z-20 sticky top-0 backdrop-blur-md"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: '#000000' }}
      >
        <nav className="max-w-[560px] mx-auto px-5 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" aria-label="TOP SITE">
            <Image src="/logo.png" alt="TOP SITE" width={100} height={34} className="h-7 w-auto" priority />
          </Link>
          <Link
            href="/login"
            className="text-[12px] px-3 py-1.5 rounded-lg transition-all duration-200"
            style={{ color: '#ccc', border: '1px solid rgba(255,255,255,0.18)' }}
          >
            Acessar painel
          </Link>
        </nav>
      </header>

      <main className="relative z-10 max-w-[480px] mx-auto px-5 sm:px-6 py-4 sm:py-20">

        {/* Page header */}
        <div className="text-center mb-4 sm:mb-12">
          {!done ? (
            <>
              <p
                className="hidden sm:block text-[10px] font-medium tracking-[0.18em] uppercase mb-5"
                style={{ color: '#d97706' }}
              >
                Calculadora de orçamento
              </p>
              <h1 className="text-[24px] sm:text-[40px] font-bold text-[#0d0d0d] leading-[1.15] tracking-tight">
                Quanto custa<br />
                <span style={{ color: '#b45309' }}>o seu site?</span>
              </h1>
            </>
          ) : (
            <>
              <div
                className="inline-flex items-center gap-2 text-[11px] tracking-[0.1em] uppercase mb-5"
                style={{ color: 'rgba(5,150,105,0.9)' }}
              >
                <span className="w-8 h-px" style={{ background: 'rgba(5,150,105,0.4)' }} />
                Orçamento gerado
                <span className="w-8 h-px" style={{ background: 'rgba(5,150,105,0.4)' }} />
              </div>
              <h1 className="text-[24px] sm:text-[40px] font-bold text-[#0d0d0d] leading-[1.15] tracking-tight">
                Aqui está<br />
                <span style={{ color: '#b45309' }}>seu orçamento.</span>
              </h1>
            </>
          )}
        </div>

        {/* Progress */}
        {!isResult && (
          <Progress current={stepIndex} total={progressTotal} />
        )}

        {/* Step content — card wrapper only for non-result steps */}
        <div key={stepIndex} className="animate-in fade-in slide-in-from-right-3 duration-300">
          {!isResult ? (
            <div
              className="rounded-2xl p-4 sm:p-7"
              style={{ background: '#f7f7f7', border: '1px solid rgba(0,0,0,0.07)' }}
            >
              {renderStep()}
            </div>
          ) : (
            renderStep()
          )}
        </div>

        {/* Back */}
        {stepIndex > 0 && !isResult && (
          <div className="flex justify-center mt-6">
            <button
              type="button"
              onClick={back}
              className="flex items-center gap-1.5 text-[12px] transition-colors duration-200 py-2 px-1"
              style={{ color: '#bbb' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#666' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#bbb' }}
            >
              <IconChevronLeft />
              Voltar
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
