'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { unlockProposalAction, approveProposalAction } from '../actions'
import { SPECIALIST_1, SPECIALIST_2, PORTFOLIO } from '../../_constants'

const WA_NUMBER = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '5511999999999').replace(/\D/g, '')
const WA_APPROVE = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent('Olá! Aprovei a proposta e quero seguir com meu projeto!')}`
const WA_EXPIRED = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent('Olá! Minha proposta expirou, mas ainda tenho interesse. Podemos conversar?')}`

// ── Helpers ───────────────────────────────────────────────────────────────────

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function formatExpiry(iso: string) {
  const d = new Date(iso)
  return (
    d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) +
    ' às ' +
    d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  )
}

// ── Reveal animation ──────────────────────────────────────────────────────────

function useReveal(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true) },
      { threshold },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, visible }
}

function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  const { ref, visible } = useReveal()
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface ProposalContent {
  value: number
  scope: string
  details: string | null
  expiresAt: string
}

type Stage = 'gate' | 'unlocked' | 'expired'

// ── Approve Button ─────────────────────────────────────────────────────────────

function ApproveButton({
  token,
  size = 'lg',
  full = false,
}: {
  token: string
  size?: 'lg' | 'xl'
  full?: boolean
}) {
  const [busy, setBusy] = useState(false)

  async function handleClick() {
    setBusy(true)
    try {
      await approveProposalAction(token)
    } catch {
      // non-critical — proceed to WhatsApp regardless
    }
    window.location.href = WA_APPROVE
  }

  return (
    <button
      onClick={handleClick}
      disabled={busy}
      className={`
        group inline-flex items-center justify-center gap-2
        bg-yellow-400 text-black font-black tracking-tight rounded-2xl
        transition-all duration-200
        hover:bg-yellow-300 hover:scale-[1.03]
        hover:shadow-[0_0_40px_rgba(250,204,21,0.5)]
        active:scale-[0.98] shadow-[0_0_20px_rgba(250,204,21,0.2)]
        disabled:opacity-60
        ${size === 'xl' ? 'text-xl px-10 py-5' : 'text-base px-7 py-4'}
        ${full ? 'w-full justify-center' : ''}
      `}
    >
      {busy ? (
        'Abrindo WhatsApp...'
      ) : (
        <>
          APROVAR PROPOSTA
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </>
      )}
    </button>
  )
}

// ── Email Gate ────────────────────────────────────────────────────────────────

function EmailGate({
  clientName,
  token,
  onUnlocked,
  onExpired,
}: {
  clientName: string
  token: string
  onUnlocked: (data: ProposalContent) => void
  onExpired: () => void
}) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = email.trim()
    if (!isValidEmail(trimmed)) {
      setError('Digite um e-mail válido para continuar.')
      return
    }
    setError(null)
    setLoading(true)
    const result = await unlockProposalAction(token, trimmed)
    setLoading(false)
    if (result.error === 'expired') {
      onExpired()
    } else if (result.error) {
      setError('Não foi possível acessar a proposta. Tente novamente.')
    } else {
      onUnlocked({
        value: result.value!,
        scope: result.scope!,
        details: result.details ?? null,
        expiresAt: result.expiresAt!,
      })
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 relative overflow-hidden bg-[#0a0a0a]">
      {/* Dot grid */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
      {/* Yellow glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[320px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(250,204,21,0.13) 0%, transparent 70%)' }}
      />

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <p className="text-center text-yellow-400 text-[10px] font-black tracking-[0.3em] uppercase mb-10">
          TOP SITE
        </p>

        {/* Card */}
        <div
          className="rounded-3xl overflow-hidden shadow-2xl border border-white/[0.06]"
          style={{ background: '#111111' }}
        >
          {/* Yellow header */}
          <div className="bg-yellow-400 px-6 py-6 text-center">
            <p className="text-black/50 text-[10px] font-black uppercase tracking-[0.25em] mb-2">
              Proposta exclusiva
            </p>
            <h1 className="text-black text-2xl font-black leading-tight">
              Olá, {clientName}!
              <br />
              <span className="text-black/70 text-lg font-bold">
                Sua proposta está pronta.
              </span>
            </h1>
          </div>

          {/* Form */}
          <div className="px-6 py-6">
            <p className="text-zinc-400 text-sm leading-relaxed mb-6">
              Para liberar o acesso, informe seu e-mail abaixo. Você receberá
              uma cópia da proposta por e-mail.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                  Seu e-mail
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  autoFocus
                  autoComplete="email"
                  className="w-full rounded-xl px-4 py-3 text-white placeholder-zinc-700 text-sm
                             focus:outline-none focus:border-yellow-400/60 focus:ring-1 focus:ring-yellow-400/20
                             transition-colors border border-white/[0.07]"
                  style={{ background: '#0a0a0a' }}
                />
              </div>

              {error && (
                <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-black py-4 rounded-2xl text-sm
                           transition-all duration-200 hover:shadow-[0_0_25px_rgba(250,204,21,0.4)]
                           active:scale-[0.98] disabled:opacity-60"
              >
                {loading ? 'Verificando...' : 'ACESSAR MINHA PROPOSTA →'}
              </button>
            </form>

            <p className="text-zinc-700 text-xs text-center mt-4">
              Seu e-mail é usado apenas para registrar o acesso.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Expired Screen ────────────────────────────────────────────────────────────

function ExpiredScreen({ clientName }: { clientName: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 bg-[#0a0a0a]">
      <div className="w-full max-w-sm text-center">
        <p className="text-yellow-400 text-[10px] font-black tracking-[0.3em] uppercase mb-10">
          TOP SITE
        </p>

        <div
          className="w-16 h-16 rounded-full border border-orange-500/30 flex items-center justify-center mx-auto mb-6"
          style={{ background: 'rgba(234,88,12,0.07)' }}
        >
          <svg className="w-7 h-7 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h2 className="text-2xl font-black text-white mb-3">Proposta expirada</h2>
        <p className="text-zinc-400 text-sm leading-relaxed mb-8">
          O prazo de validade desta proposta expirou, {clientName}. Mas não se
          preocupe — podemos conversar e montar uma nova para você!
        </p>

        <a
          href={WA_EXPIRED}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 w-full bg-yellow-400 hover:bg-yellow-300
                     text-black font-black py-4 rounded-2xl text-sm transition-all
                     hover:shadow-[0_0_25px_rgba(250,204,21,0.4)]"
        >
          Falar no WhatsApp →
        </a>
      </div>
    </div>
  )
}

// ── Proposal View ─────────────────────────────────────────────────────────────

function ProposalView({
  token,
  clientName,
  content,
}: {
  token: string
  clientName: string
  content: ProposalContent
}) {
  return (
    <div className="bg-[#0a0a0a] text-white">

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 py-24 text-center overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '22px 22px' }}
        />
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(250,204,21,0.14) 0%, transparent 70%)' }}
        />

        <div className="relative w-full max-w-lg mx-auto">
          <div className="flex justify-center mb-10">
            <Image src="/logo.png" alt="TOP SITE" width={160} height={48} className="h-11 w-auto" priority />
          </div>

          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 border border-yellow-400/30 rounded-full px-4 py-2 mb-8"
            style={{ background: 'rgba(250,204,21,0.07)' }}
          >
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse shrink-0" />
            <span className="text-yellow-400 text-xs font-bold">
              Proposta exclusiva — válida por 24 horas
            </span>
          </div>

          {/* Greeting */}
          <h1 className="text-[2.2rem] sm:text-5xl font-black leading-[1.1] tracking-tight mb-5">
            Olá, {clientName}!
          </h1>
          <p className="text-zinc-300 text-lg sm:text-2xl font-semibold leading-snug mb-4">
            Preparamos uma proposta exclusiva
            <br className="hidden sm:block" />
            {' '}para o seu negócio.
          </p>
          <p className="text-zinc-500 text-base leading-relaxed max-w-sm mx-auto">
            Role a página para conferir tudo com calma — o escopo do projeto,
            nossa apresentação e o investimento no final.
          </p>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 animate-bounce">
          <span className="text-zinc-700 text-[10px] font-semibold uppercase tracking-widest">Ver proposta</span>
          <svg className="w-4 h-4 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* ── ESCOPO ── */}
      <section className="py-16 px-6" style={{ background: '#0d0d0d' }}>
        <div className="max-w-2xl mx-auto">
          <Reveal>
            <p className="text-yellow-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">
              O Projeto
            </p>
            <h2 className="text-2xl sm:text-3xl font-black mb-6">Escopo do Trabalho</h2>
          </Reveal>

          <Reveal delay={80}>
            <div
              className="rounded-2xl border border-white/[0.06] p-6 sm:p-8"
              style={{ background: '#111111' }}
            >
              <p className="text-zinc-200 text-[1.05rem] leading-[1.95] whitespace-pre-wrap">
                {content.scope}
              </p>
            </div>
          </Reveal>

          {content.details && (
            <>
              <Reveal delay={120}>
                <p className="text-yellow-400 text-[10px] font-black uppercase tracking-[0.2em] mt-10 mb-2">
                  Informações Adicionais
                </p>
                <h3 className="text-xl font-black mb-4">Detalhes & Observações</h3>
              </Reveal>
              <Reveal delay={160}>
                <div
                  className="rounded-2xl border border-white/[0.06] p-6 sm:p-8"
                  style={{ background: '#111111' }}
                >
                  <p className="text-zinc-200 text-[1.05rem] leading-[1.95] whitespace-pre-wrap">
                    {content.details}
                  </p>
                </div>
              </Reveal>
            </>
          )}
        </div>
      </section>

      {/* ── QUEM SOMOS ── */}
      <section className="py-16 px-6 bg-[#0a0a0a]">
        <div className="max-w-2xl mx-auto">
          <Reveal>
            <p className="text-yellow-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">
              Quem Somos
            </p>
            <h2 className="text-2xl sm:text-3xl font-black mb-2">
              Os especialistas por trás do projeto
            </h2>
            <p className="text-zinc-400 text-base leading-relaxed mb-10">
              Dois profissionais que unem desenvolvimento de qualidade e visão de
              marketing digital para criar sites que realmente vendem.
            </p>
          </Reveal>

          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            {[SPECIALIST_1, SPECIALIST_2].map((sp, i) => (
              <Reveal key={sp.name} delay={i * 100}>
                <div
                  className="rounded-2xl border border-white/[0.06] p-6 h-full"
                  style={{ background: '#111111' }}
                >
                  {/* Foto */}
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border border-yellow-400/20 mb-4">
                    <Image
                      src={sp.photo}
                      alt={sp.name}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <p className="text-white font-black text-lg mb-0.5">{sp.name}</p>
                  <p className="text-yellow-400 text-[10px] font-bold uppercase tracking-widest mb-3">
                    {sp.role}
                  </p>
                  <div className="flex items-start gap-2">
                    <svg
                      className="w-4 h-4 text-zinc-600 shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 14l9-5-9-5-9 5 9 5z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                    </svg>
                    <p className="text-zinc-400 text-sm">{sp.credential}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={200}>
            <div
              className="rounded-2xl border border-yellow-400/10 px-6 py-5"
              style={{ background: 'rgba(250,204,21,0.03)' }}
            >
              <p className="text-zinc-400 text-sm leading-relaxed text-center">
                Apaixonados por tecnologia e marketing digital, trabalhamos juntos para
                entregar sites que vão além do visual — projetos estratégicos que geram
                resultados reais para o seu negócio.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── PORTFÓLIO ── */}
      <section className="py-16 px-6" style={{ background: '#0d0d0d' }}>
        <div className="max-w-3xl mx-auto">
          <Reveal>
            <p className="text-yellow-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">
              Portfólio
            </p>
            <h2 className="text-2xl sm:text-3xl font-black mb-2">Sites que já entregamos</h2>
            <p className="text-zinc-500 text-sm mb-10">
              Cada site é desenvolvido sob medida, com atenção aos detalhes.
            </p>
          </Reveal>

          {PORTFOLIO.length === 0 ? (
            <Reveal delay={80}>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-[4/3] rounded-2xl border border-white/[0.04] flex flex-col items-center justify-center gap-2"
                    style={{ background: '#111111' }}
                  >
                    {/* Browser chrome */}
                    <div className="flex gap-1 mb-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
                    </div>
                    <div className="w-10 h-1.5 bg-zinc-800 rounded" />
                    <div className="w-7 h-1.5 bg-zinc-800 rounded" />
                  </div>
                ))}
              </div>
              <p className="text-zinc-700 text-xs text-center mt-4">Portfólio em atualização</p>
            </Reveal>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {PORTFOLIO.map((img, i) => (
                <Reveal key={img.src} delay={i * 60}>
                  <div className="aspect-[4/3] rounded-2xl overflow-hidden border border-white/[0.05]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.src}
                      alt={img.alt}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-24 px-6 text-center bg-[#0a0a0a] relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, rgba(250,204,21,0.1) 0%, transparent 65%)' }}
        />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '22px 22px' }}
        />

        <div className="relative max-w-lg mx-auto">
          <Reveal>
            <p className="text-yellow-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6">
              Próximo passo
            </p>
            <h2 className="text-3xl sm:text-4xl font-black leading-tight mb-10">
              Pronto para começar?
            </h2>

            {/* Value — destaque máximo aqui */}
            <div className="mb-8">
              <div
                className="inline-block rounded-3xl border-2 border-yellow-400 px-8 py-6 shadow-[0_0_60px_rgba(250,204,21,0.2)]"
                style={{ background: 'rgba(250,204,21,0.04)' }}
              >
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-3">
                  Investimento total
                </p>
                <p className="text-yellow-400 text-5xl sm:text-6xl font-black leading-none mb-3">
                  {formatCurrency(content.value)}
                </p>
                <div className="flex items-center justify-center gap-1.5 text-zinc-600 text-xs">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Válida até {formatExpiry(content.expiresAt)}</span>
                </div>
              </div>
            </div>

            <p className="text-zinc-400 text-base leading-relaxed mb-8 max-w-sm mx-auto">
              Clique abaixo para aprovar e falarmos pelo WhatsApp — alinhamos
              os próximos passos juntos.
            </p>

            <ApproveButton token={token} size="xl" full />
            <p className="text-zinc-600 text-xs mt-4">
              Você será direcionado ao WhatsApp para alinharmos os detalhes.
            </p>
          </Reveal>

          <div className="mt-16 border-t border-white/[0.04] pt-8">
            <p className="text-zinc-700 text-xs">
              © TOP SITE ·{' '}
              <a href="/privacidade" className="hover:text-zinc-500 transition-colors">
                Privacidade
              </a>
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export function ProposalLandingClient({
  token,
  clientName,
  initialStage,
}: {
  token: string
  clientName: string
  initialStage: Stage
}) {
  const [stage, setStage] = useState<Stage>(initialStage)
  const [content, setContent] = useState<ProposalContent | null>(null)

  if (stage === 'expired') return <ExpiredScreen clientName={clientName} />
  if (stage === 'unlocked' && content)
    return <ProposalView token={token} clientName={clientName} content={content} />

  return (
    <EmailGate
      clientName={clientName}
      token={token}
      onUnlocked={(data) => {
        setContent(data)
        setStage('unlocked')
      }}
      onExpired={() => setStage('expired')}
    />
  )
}
