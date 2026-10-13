'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { MarketingIcon, WhatsAppIcon } from './MarketingIcon'
import { projectContact } from '@/lib/marketing'

// Fluxo de orçamento: coleta as informações básicas do projeto e envia uma
// mensagem pronta no WhatsApp. Roda só no navegador — nada é salvo no servidor.

type Answers = {
  company: string
  segment: string
  employees: string
  services: string
  siteType: string
  goal: string
  assets: string[]
}

type ChoiceStep = {
  key: 'employees' | 'services' | 'siteType' | 'goal'
  title: string
  options: { label: string; hint?: string }[]
}

const CHOICE_STEPS: ChoiceStep[] = [
  {
    key: 'employees',
    title: 'Quantas pessoas trabalham na empresa?',
    options: [{ label: '1 a 2 pessoas' }, { label: '3 a 10 pessoas' }, { label: 'Mais de 10 pessoas' }],
  },
  {
    key: 'services',
    title: 'Quantos serviços ou produtos você quer mostrar no site?',
    options: [{ label: '1 a 3' }, { label: '4 a 10' }, { label: 'Mais de 10' }],
  },
  {
    key: 'siteType',
    title: 'Que tipo de site você precisa?',
    options: [
      { label: 'Site da empresa', hint: 'Apresentar a empresa, os serviços e as formas de contato' },
      { label: 'Página de vendas', hint: 'Uma página focada em vender um serviço ou campanha' },
      { label: 'Loja virtual', hint: 'Vender produtos online, com carrinho e pagamento' },
      { label: 'Ainda não sei', hint: 'Quero uma recomendação' },
    ],
  },
  {
    key: 'goal',
    title: 'Qual o principal objetivo do site?',
    options: [
      { label: 'Vender mais', hint: 'Atrair novos clientes pela internet' },
      { label: 'Ter credibilidade', hint: 'Passar uma imagem profissional para quem já me procura' },
      { label: 'Os dois' },
    ],
  },
]

const ASSET_OPTIONS = ['Logotipo', 'Domínio (.com.br)', 'Site atual (quero refazer)', 'Google Meu Negócio', 'Instagram ativo']

// Passos: 0 = empresa, 1..4 = escolhas, 5 = o que já tem, 6 = revisão
const TOTAL_STEPS = CHOICE_STEPS.length + 3

const EMPTY: Answers = { company: '', segment: '', employees: '', services: '', siteType: '', goal: '', assets: [] }

function buildMessage(a: Answers, intro?: string) {
  const segment = a.segment.trim()
  return [
    intro ?? 'Olá! Quero um orçamento de site com a TopSite.',
    '',
    `*Empresa:* ${a.company.trim()}`,
    ...(segment ? [`*Ramo:* ${segment}`] : []),
    `*Funcionários:* ${a.employees}`,
    `*Serviços/produtos:* ${a.services}`,
    `*Tipo de site:* ${a.siteType}`,
    `*Objetivo:* ${a.goal}`,
    `*Já tenho:* ${a.assets.length ? a.assets.join(', ') : 'Nada disso ainda'}`,
    '',
    'Pode me passar um orçamento?',
  ].join('\n')
}

export function ProjectCTA({ message, label = 'Quero meu site agora', className = '' }: { message?: string; label?: string; className?: string }) {
  return (
    <QuoteButton message={message} className={'cta-pulse inline-flex max-w-full items-center justify-center gap-3 rounded-2xl bg-[#25D366] px-8 py-5 text-center text-base font-bold text-white shadow-lg shadow-[#25D366]/25 transition-colors hover:bg-[#1ebe5b] sm:px-10 sm:text-lg ' + className}>
      <WhatsAppIcon />
      {label}
    </QuoteButton>
  )
}

export function QuoteButton({ message, className, children }: { message?: string; className?: string; children: ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>{children}</button>
      {open && <QuoteWizard intro={message} onClose={() => setOpen(false)} />}
    </>
  )
}

function QuoteWizard({ intro, onClose }: { intro?: string; onClose: () => void }) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Answers>(EMPTY)
  const [mounted, setMounted] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  // Leva o foco para o conteúdo de cada passo (leitores de tela e teclado)
  useEffect(() => {
    const el = dialogRef.current?.querySelector<HTMLElement>('input, [data-autofocus]')
    el?.focus()
  }, [step, mounted])

  if (!mounted) return null

  const next = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1))
  const back = () => setStep((s) => Math.max(s - 1, 0))
  const choiceStep = step >= 1 && step <= CHOICE_STEPS.length ? CHOICE_STEPS[step - 1] : null

  function choose(key: ChoiceStep['key'], value: string) {
    setAnswers((a) => ({ ...a, [key]: value }))
    next()
  }

  function toggleAsset(value: string) {
    setAnswers((a) => ({
      ...a,
      assets: a.assets.includes(value) ? a.assets.filter((v) => v !== value) : [...a.assets, value],
    }))
  }

  function send() {
    window.open(projectContact(buildMessage(answers, intro)), '_blank', 'noopener,noreferrer')
    onClose()
  }

  const progress = ((step + 1) / TOTAL_STEPS) * 100

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/75 backdrop-blur-sm sm:items-center sm:p-6" onClick={onClose}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="quote-wizard-title"
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[92dvh] w-full max-w-xl flex-col overflow-hidden rounded-t-3xl border border-white/10 bg-[#111] text-white shadow-2xl sm:rounded-3xl"
      >
        <div className="flex items-center justify-between gap-4 px-6 pt-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-yellow-400">
            Orçamento · {step + 1} de {TOTAL_STEPS}
          </p>
          <button type="button" onClick={onClose} aria-label="Fechar" className="rounded-lg p-2 text-white/60 hover:bg-white/5 hover:text-white">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5"><path d="M6 6l12 12M6 18L18 6" /></svg>
          </button>
        </div>
        <div className="mx-6 mt-3 h-1 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-[#25D366] transition-all duration-300" style={{ width: progress + '%' }} />
        </div>

        <div className="overflow-y-auto px-6 pb-6 pt-6">
          {step === 0 && (
            <form onSubmit={(e) => { e.preventDefault(); if (answers.company.trim()) next() }}>
              <h2 id="quote-wizard-title" className="mb-6 text-2xl font-semibold tracking-tight">Qual o nome da sua empresa?</h2>
              <label className="mb-2 block text-sm text-white/65" htmlFor="quote-company">Nome da empresa</label>
              <input
                id="quote-company"
                value={answers.company}
                onChange={(e) => setAnswers((a) => ({ ...a, company: e.target.value }))}
                maxLength={80}
                autoComplete="organization"
                className="mb-5 w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3.5 text-base outline-none focus:border-[#25D366]"
              />
              <label className="mb-2 block text-sm text-white/65" htmlFor="quote-segment">Ramo de atividade <span className="text-white/40">(opcional)</span></label>
              <input
                id="quote-segment"
                value={answers.segment}
                onChange={(e) => setAnswers((a) => ({ ...a, segment: e.target.value }))}
                maxLength={80}
                placeholder="Ex: barbearia, clínica, advocacia"
                className="mb-6 w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3.5 text-base outline-none placeholder:text-white/30 focus:border-[#25D366]"
              />
              <button type="submit" disabled={!answers.company.trim()} className="w-full rounded-xl bg-[#25D366] px-6 py-4 text-base font-bold text-white transition-colors hover:bg-[#1ebe5b] disabled:cursor-not-allowed disabled:opacity-40">
                Continuar
              </button>
            </form>
          )}

          {choiceStep && (
            <div>
              <h2 id="quote-wizard-title" className="mb-6 text-2xl font-semibold tracking-tight" tabIndex={-1} data-autofocus>{choiceStep.title}</h2>
              <div className="space-y-3">
                {choiceStep.options.map(({ label, hint }) => {
                  const selected = answers[choiceStep.key] === label
                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() => choose(choiceStep.key, label)}
                      className={'flex w-full items-center justify-between gap-4 rounded-xl border px-5 py-4 text-left transition-colors ' + (selected ? 'border-[#25D366] bg-[#25D366]/10' : 'border-white/15 hover:border-white/35 hover:bg-white/[0.04]')}
                    >
                      <span>
                        <span className="block font-semibold">{label}</span>
                        {hint && <span className="mt-0.5 block text-sm text-white/55">{hint}</span>}
                      </span>
                      <MarketingIcon name="arrow" className="h-4 w-4 shrink-0 text-white/40" />
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {step === CHOICE_STEPS.length + 1 && (
            <div>
              <h2 id="quote-wizard-title" className="mb-2 text-2xl font-semibold tracking-tight" tabIndex={-1} data-autofocus>O que você já tem?</h2>
              <p className="mb-6 text-sm text-white/55">Marque tudo que se aplica — ou siga em frente se ainda não tem nada.</p>
              <div className="mb-6 grid gap-3 sm:grid-cols-2">
                {ASSET_OPTIONS.map((label) => {
                  const selected = answers.assets.includes(label)
                  return (
                    <button
                      key={label}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => toggleAsset(label)}
                      className={'flex items-center gap-3 rounded-xl border px-4 py-3.5 text-left text-sm font-medium transition-colors ' + (selected ? 'border-[#25D366] bg-[#25D366]/10' : 'border-white/15 hover:border-white/35 hover:bg-white/[0.04]')}
                    >
                      <span className={'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ' + (selected ? 'border-[#25D366] bg-[#25D366] text-white' : 'border-white/30')}>
                        {selected && <MarketingIcon name="check" className="h-3.5 w-3.5" />}
                      </span>
                      {label}
                    </button>
                  )
                })}
              </div>
              <button type="button" onClick={next} className="w-full rounded-xl bg-[#25D366] px-6 py-4 text-base font-bold text-white transition-colors hover:bg-[#1ebe5b]">
                {answers.assets.length ? 'Continuar' : 'Ainda não tenho nada disso'}
              </button>
            </div>
          )}

          {step === TOTAL_STEPS - 1 && (
            <div>
              <h2 id="quote-wizard-title" className="mb-2 text-2xl font-semibold tracking-tight" tabIndex={-1} data-autofocus>Tudo certo!</h2>
              <p className="mb-6 text-sm text-white/55">Confira as informações. Vamos abrir o WhatsApp com a mensagem pronta — é só enviar.</p>
              <dl className="mb-6 divide-y divide-white/10 rounded-xl border border-white/10 bg-white/[0.02] text-sm">
                {[
                  ['Empresa', answers.company + (answers.segment.trim() ? ` · ${answers.segment.trim()}` : '')],
                  ['Funcionários', answers.employees],
                  ['Serviços/produtos', answers.services],
                  ['Tipo de site', answers.siteType],
                  ['Objetivo', answers.goal],
                  ['Já tem', answers.assets.length ? answers.assets.join(', ') : 'Nada disso ainda'],
                ].map(([term, value]) => (
                  <div key={term} className="flex justify-between gap-4 px-4 py-3">
                    <dt className="text-white/55">{term}</dt>
                    <dd className="text-right font-medium">{value}</dd>
                  </div>
                ))}
              </dl>
              <button type="button" onClick={send} className="cta-pulse flex w-full items-center justify-center gap-3 rounded-xl bg-[#25D366] px-6 py-4 text-base font-bold text-white transition-colors hover:bg-[#1ebe5b]">
                <WhatsAppIcon className="h-6 w-6" />
                Enviar no WhatsApp
              </button>
            </div>
          )}

          {step > 0 && (
            <button type="button" onClick={back} className="mt-5 text-sm text-white/55 hover:text-white">
              ← Voltar
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}
