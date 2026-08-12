'use client'

import { useState, useTransition, useEffect, useRef } from 'react'
import { captureLeadAction } from '../actions'

// ── Ajuste estes valores sem tocar no resto ───────────────────────────────────
const VAGAS_SEMANA = 5
const VAGAS_OCUPADAS = 3

const WHATSAPP_URL = `https://wa.me/${(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '5511999999999').replace(/\D/g, '')}?text=${encodeURIComponent('Oi! Vi a oferta do site por R$97 e quero garantir minha vaga!')}`

// ── Hook: revela elemento quando entra na viewport ────────────────────────────
function useReveal(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, visible }
}

// ── Wrapper de animação de entrada ────────────────────────────────────────────
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
      className={`transition-all duration-700 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

// ── Ícones ────────────────────────────────────────────────────────────────────
function Check({ size = 'sm' }: { size?: 'sm' | 'md' }) {
  const cls = size === 'md' ? 'w-5 h-5' : 'w-4 h-4'
  return (
    <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
    </svg>
  )
}
function X({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

// ── Botão CTA ─────────────────────────────────────────────────────────────────
function CTAButton({
  onClick,
  children,
  size = 'lg',
  full = false,
}: {
  onClick: () => void
  children: React.ReactNode
  size?: 'lg' | 'xl'
  full?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={`
        group relative inline-flex items-center justify-center gap-2
        bg-yellow-400 text-black font-black tracking-tight
        rounded-2xl transition-all duration-200
        hover:bg-yellow-300 hover:scale-[1.03]
        hover:shadow-[0_0_40px_rgba(250,204,21,0.55)]
        active:scale-[0.98]
        shadow-[0_0_20px_rgba(250,204,21,0.3)]
        ${size === 'xl' ? 'text-xl px-10 py-5' : 'text-base px-7 py-4'}
        ${full ? 'w-full' : ''}
      `}
    >
      {children}
      <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
    </button>
  )
}

// ── Modal de captura ──────────────────────────────────────────────────────────
function LeadModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !email.trim()) {
      setError('Preencha seu nome e e-mail para continuar.')
      return
    }
    setError(null)
    startTransition(async () => {
      const { whatsappUrl } = await captureLeadAction(name.trim(), email.trim())
      window.location.href = whatsappUrl
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" />
      <div className="relative w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border border-yellow-400/20"
           style={{ background: '#0f0f0f' }}>

        {/* Topo amarelo */}
        <div className="bg-yellow-400 px-6 pt-6 pb-5 relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-black/50 hover:text-black transition-colors">
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-black/40 animate-pulse" />
            <span className="text-black/70 text-xs font-bold uppercase tracking-widest">Vagas limitadas esta semana</span>
          </div>
          <h2 className="text-black text-2xl font-black leading-tight">
            Falta só um passo para<br />seu site sair do papel!
          </h2>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <p className="text-zinc-400 text-sm">Preencha abaixo e iremos alinhar tudo no WhatsApp.</p>

          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">Seu nome</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: João Silva"
              autoFocus
              autoComplete="name"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/40 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">Seu e-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ex: joao@email.com"
              autoComplete="email"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/40 transition-colors"
            />
          </div>

          {error && (
            <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-black py-4 rounded-2xl text-base transition-all duration-200 hover:shadow-[0_0_30px_rgba(250,204,21,0.5)] active:scale-[0.98] disabled:opacity-60"
          >
            {isPending ? 'Redirecionando...' : 'GARANTIR MINHA VAGA →'}
          </button>

          <p className="text-zinc-600 text-xs text-center">
            Você será direcionado ao WhatsApp. Sem spam, sem compromisso.
          </p>
        </form>
      </div>
    </div>
  )
}

// ── Barra flutuante de urgência (aparece após rolar) ──────────────────────────
function StickyBar({ onOpen }: { onOpen: () => void }) {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 500)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  if (!show) return null
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 p-3 sm:hidden">
      <button
        onClick={onOpen}
        className="w-full bg-yellow-400 text-black font-black text-base py-4 rounded-2xl shadow-[0_0_30px_rgba(250,204,21,0.45)] active:scale-[0.98] transition-all"
      >
        QUERO MEU SITE POR R$97 →
      </button>
    </div>
  )
}

// ── Página ────────────────────────────────────────────────────────────────────
export function LandingPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const open = () => setModalOpen(true)
  const vagasRestantes = VAGAS_SEMANA - VAGAS_OCUPADAS

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">

      {/* ════════════════════════════════════════════════════════
          1. HERO — primeira dobra, pancada visual
      ════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-5 py-24 text-center overflow-hidden">

        {/* Grade pontilhada de fundo */}
        <div className="absolute inset-0 opacity-[0.035]"
             style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

        {/* Glow amarelo agressivo */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full pointer-events-none"
             style={{ background: 'radial-gradient(ellipse, rgba(250,204,21,0.18) 0%, transparent 70%)' }} />

        {/* Badge pulsante */}
        <div className="relative inline-flex items-center gap-2 border border-yellow-400/40 rounded-full px-4 py-2 mb-8"
             style={{ background: 'rgba(250,204,21,0.08)' }}>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-400" />
          </span>
          <span className="text-yellow-400 text-xs font-bold tracking-wide">Primeiro mês de hospedagem grátis</span>
        </div>

        {/* Headline principal */}
        <h1 className="text-[2.6rem] sm:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight max-w-3xl mb-6">
          Seu negócio ainda não<br />aparece no{' '}
          <span className="text-yellow-400 relative">
            Google?
            <span className="absolute -bottom-1 left-0 right-0 h-1 bg-yellow-400/30 rounded-full" />
          </span>
          <br />
          <span className="text-zinc-400 text-3xl sm:text-4xl lg:text-5xl font-extrabold">
            Isso está te custando clientes todos os dias.
          </span>
        </h1>

        {/* Subtítulo */}
        <p className="text-zinc-400 text-lg sm:text-xl max-w-xl mb-10 leading-relaxed">
          Tenha um site profissional, rápido e pronto pra vender —{' '}
          <strong className="text-white font-bold">a partir de R$97</strong>,{' '}
          no ar em poucos dias.
        </p>

        {/* CTA */}
        <CTAButton onClick={open} size="xl">QUERO MEU SITE AGORA</CTAButton>

        {/* Seta para baixo */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-5 h-5 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          2. DOR — agitar o problema
      ════════════════════════════════════════════════════════ */}
      <section className="py-20 px-5" style={{ background: '#080808' }}>
        <div className="max-w-xl mx-auto">
          <Reveal>
            <p className="text-yellow-400 text-xs font-black uppercase tracking-[0.2em] mb-3 text-center">A realidade sem um site</p>
            <h2 className="text-3xl sm:text-4xl font-black text-center mb-10 leading-tight">
              Enquanto você espera,<br />
              <span className="text-zinc-400">seus clientes vão embora.</span>
            </h2>
          </Reveal>

          <div className="space-y-3">
            {[
              { text: 'Enquanto você não tem um site, seu concorrente aparece no Google e leva seus clientes.' },
              { text: 'Quem procura seu serviço online e não te encontra, encontra outro — na hora.' },
              { text: 'Um perfil de rede social não passa a mesma credibilidade de um site profissional.' },
              { text: 'Sem site, você depende 100% de indicação — e perde quem busca ativamente.' },
            ].map((item, i) => (
              <Reveal key={item.text} delay={i * 80}>
                <div className="flex items-start gap-4 border border-red-500/20 rounded-2xl px-5 py-4"
                     style={{ background: 'rgba(239,68,68,0.05)' }}>
                  <div className="w-7 h-7 rounded-full border border-red-500/40 flex items-center justify-center shrink-0 mt-0.5"
                       style={{ background: 'rgba(239,68,68,0.1)' }}>
                    <X className="w-3.5 h-3.5 text-red-400" />
                  </div>
                  <p className="text-zinc-300 leading-relaxed text-sm sm:text-base">{item.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          3. SOLUÇÃO — o alívio
      ════════════════════════════════════════════════════════ */}
      <section className="py-20 px-5 bg-black">
        <div className="max-w-xl mx-auto">
          <Reveal>
            <p className="text-yellow-400 text-xs font-black uppercase tracking-[0.2em] mb-3 text-center">O que você recebe</p>
            <h2 className="text-3xl sm:text-4xl font-black text-center mb-10 leading-tight">
              Um site completo,<br />
              <span className="text-yellow-400">pronto pra atrair clientes</span>
            </h2>
          </Reveal>

          <Reveal delay={100}>
            <div className="rounded-3xl border border-yellow-400/20 overflow-hidden"
                 style={{ background: '#0f0f0f' }}>
              <div className="border-b border-yellow-400/10 px-6 py-4" style={{ background: 'rgba(250,204,21,0.04)' }}>
                <p className="text-yellow-400 text-xs font-black uppercase tracking-widest">Incluído no seu site</p>
              </div>
              <div className="px-6 py-5 space-y-3.5">
                {[
                  'Design profissional feito sob medida para o seu negócio',
                  'Funciona perfeitamente no celular (mobile-first)',
                  'Otimizado para aparecer no Google (SEO básico incluso)',
                  'Botão de WhatsApp para o cliente te chamar na hora',
                  'Formulário de contato integrado',
                  'Carregamento ultra-rápido — sem frustração',
                  'Hospedagem inclusa com certificado SSL (cadeado de segurança)',
                  'Primeiro mês de hospedagem gratuito',
                ].map((item, i) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-yellow-400 flex items-center justify-center shrink-0">
                      <Check size="sm" />
                    </div>
                    <p className="text-zinc-200 text-sm sm:text-base leading-snug">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          4. OFERTA PRINCIPAL — R$97 em destaque máximo
      ════════════════════════════════════════════════════════ */}
      <section className="py-20 px-5 bg-black relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
             style={{ background: 'radial-gradient(ellipse at center, rgba(250,204,21,0.06) 0%, transparent 70%)' }} />
        <div className="relative max-w-sm mx-auto">
          <Reveal>
            <p className="text-yellow-400 text-xs font-black uppercase tracking-[0.2em] mb-3 text-center">Oferta principal</p>
            <h2 className="text-3xl sm:text-4xl font-black text-center mb-8 leading-tight">
              Tudo que você precisa,<br />
              <span className="text-yellow-400">em um único valor</span>
            </h2>
          </Reveal>

          <Reveal delay={100}>
            <div className="rounded-3xl overflow-hidden border-2 border-yellow-400 shadow-[0_0_60px_rgba(250,204,21,0.2)]">
              {/* Cabeçalho do card */}
              <div className="bg-yellow-400 px-6 py-6 text-center">
                <p className="text-black/60 text-xs font-black uppercase tracking-widest mb-2">Site Profissional</p>
                <div className="flex items-end justify-center gap-1 mb-1">
                  <span className="text-black/50 text-xl font-bold mb-2">R$</span>
                  <span className="text-black text-7xl font-black leading-none">97</span>
                </div>
                <p className="text-black/60 text-xs font-semibold">pagamento único · sem mensalidade oculta</p>
              </div>

              {/* Itens */}
              <div className="px-6 py-6 space-y-3.5" style={{ background: '#0f0f0f' }}>
                {[
                  'Site completo e responsivo — funciona no celular',
                  'Design personalizado para o seu negócio',
                  'Otimização para o Google (SEO)',
                  'Botão de WhatsApp + formulário de contato',
                  'Hospedagem + SSL com PRIMEIRO MÊS GRÁTIS',
                  'Prazo de entrega: até 7 dias úteis',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-yellow-400 flex items-center justify-center shrink-0">
                      <Check size="sm" />
                    </div>
                    <p className="text-zinc-200 text-sm leading-snug">{item}</p>
                  </div>
                ))}

                <div className="pt-3">
                  <CTAButton onClick={open} full>QUERO MEU SITE POR R$97</CTAButton>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          6. OUTRAS OPÇÕES — discretas, sem competir
      ════════════════════════════════════════════════════════ */}
      <section className="py-20 px-5" style={{ background: '#080808' }}>
        <div className="max-w-3xl mx-auto">
          <Reveal>
            <h2 className="text-2xl sm:text-3xl font-black text-center mb-2">Precisa de algo mais robusto?</h2>
            <p className="text-zinc-500 text-sm text-center mb-10">Temos opções para cada fase do seu negócio.</p>
          </Reveal>

          <div className="grid gap-4 sm:grid-cols-3">
            {/* R$97 — principal, destaque */}
            <Reveal delay={0}>
              <div className="relative rounded-2xl border-2 border-yellow-400/60 overflow-hidden flex flex-col h-full"
                   style={{ background: '#0f0f0f' }}>
                <div className="absolute -top-px left-1/2 -translate-x-1/2">
                  <span className="inline-block bg-yellow-400 text-black text-[10px] font-black px-4 py-1 rounded-b-lg uppercase tracking-widest whitespace-nowrap">
                    ★ Mais escolhido
                  </span>
                </div>
                <div className="px-5 pt-8 pb-5 flex-1 flex flex-col">
                  <p className="text-yellow-400 text-[10px] font-black uppercase tracking-widest mb-1">Site de Entrada</p>
                  <p className="text-white text-4xl font-black mb-1">R$97</p>
                  <p className="text-zinc-500 text-xs mb-4 leading-relaxed flex-1">
                    Para quem quer presença online profissional com o essencial para atrair clientes.
                  </p>
                  {['Página única completa', 'Design sob medida', 'SEO + WhatsApp', '1º mês grátis'].map((f) => (
                    <div key={f} className="flex items-center gap-2 mb-2 text-xs text-zinc-300">
                      <div className="w-4 h-4 rounded-full bg-yellow-400 flex items-center justify-center shrink-0">
                        <Check size="sm" />
                      </div>
                      {f}
                    </div>
                  ))}
                  <button onClick={open}
                    className="mt-4 w-full bg-yellow-400 hover:bg-yellow-300 text-black font-black py-3 rounded-xl text-sm transition-all hover:shadow-[0_0_20px_rgba(250,204,21,0.4)] active:scale-[0.98]">
                    Quero este
                  </button>
                </div>
              </div>
            </Reveal>

            {/* R$197 */}
            <Reveal delay={80}>
              <div className="rounded-2xl border border-zinc-800 flex flex-col h-full" style={{ background: '#0f0f0f' }}>
                <div className="px-5 py-5 flex-1 flex flex-col">
                  <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Landing Page</p>
                  <p className="text-white text-4xl font-black mb-1">R$197</p>
                  <p className="text-zinc-500 text-xs mb-4 leading-relaxed flex-1">
                    Focada em conversão — seções extras, depoimentos, FAQ e mais vendas.
                  </p>
                  {['Página focada em conversão', 'Mais seções e conteúdo', 'SEO avançado', '1º mês grátis'].map((f) => (
                    <div key={f} className="flex items-center gap-2 mb-2 text-xs text-zinc-400">
                      <Check size="sm" />{f}
                    </div>
                  ))}
                  <button onClick={open}
                    className="mt-4 w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 rounded-xl text-sm transition-colors active:scale-[0.98]">
                    Quero este
                  </button>
                </div>
              </div>
            </Reveal>

            {/* R$299 */}
            <Reveal delay={160}>
              <div className="rounded-2xl border border-zinc-800 flex flex-col h-full" style={{ background: '#0f0f0f' }}>
                <div className="px-5 py-5 flex-1 flex flex-col">
                  <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Site Institucional</p>
                  <p className="text-white text-4xl font-black mb-1">R$299</p>
                  <p className="text-zinc-500 text-xs mb-4 leading-relaxed flex-1">
                    Para empresas — múltiplas páginas, portfólio e presença corporativa completa.
                  </p>
                  {['Múltiplas páginas', 'Portfólio e galeria', 'Formulário avançado', '1º mês grátis'].map((f) => (
                    <div key={f} className="flex items-center gap-2 mb-2 text-xs text-zinc-400">
                      <Check size="sm" />{f}
                    </div>
                  ))}
                  <button onClick={open}
                    className="mt-4 w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 rounded-xl text-sm transition-colors active:scale-[0.98]">
                    Quero este
                  </button>
                </div>
              </div>
            </Reveal>
          </div>

          <p className="text-zinc-700 text-xs text-center mt-6">
            Todos incluem 1º mês de hospedagem grátis. O plano é alinhado no WhatsApp.
          </p>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          7. ESCASSEZ — urgência real, cor de alerta
      ════════════════════════════════════════════════════════ */}
      <section className="py-20 px-5 bg-black">
        <div className="max-w-lg mx-auto">
          <Reveal>
            <div className="rounded-3xl border border-orange-500/30 overflow-hidden"
                 style={{ background: 'rgba(234,88,12,0.05)' }}>

              {/* Cabeçalho de alerta */}
              <div className="flex items-center gap-3 px-6 py-4 border-b border-orange-500/20"
                   style={{ background: 'rgba(234,88,12,0.08)' }}>
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500" />
                </span>
                <span className="text-orange-400 text-xs font-black uppercase tracking-widest">Atenção — vagas limitadas</span>
              </div>

              <div className="px-6 py-6 text-center">
                <h2 className="text-2xl sm:text-3xl font-black text-white mb-3 leading-tight">
                  Produzimos sob demanda,<br />com qualidade.
                </h2>
                <p className="text-zinc-400 text-sm leading-relaxed mb-8">
                  Por isso, aceitamos apenas{' '}
                  <strong className="text-white">5 novos sites por semana</strong>.
                  As vagas desta semana estão acabando.
                </p>

                {/* Indicador visual de vagas */}
                <div className="flex justify-center gap-3 mb-4">
                  {Array.from({ length: VAGAS_SEMANA }).map((_, i) => (
                    <div key={i}
                         className={`w-12 h-12 rounded-2xl border-2 flex flex-col items-center justify-center text-xs font-black transition-all ${
                           i < VAGAS_OCUPADAS
                             ? 'border-red-500/60 text-red-400'
                             : 'border-green-500/60 text-green-400'
                         }`}
                         style={{ background: i < VAGAS_OCUPADAS ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.08)' }}>
                      <span className="text-lg leading-none">{i < VAGAS_OCUPADAS ? '✕' : '✓'}</span>
                      <span className="text-[8px] mt-0.5 opacity-70">{i < VAGAS_OCUPADAS ? 'Ocupada' : 'Livre'}</span>
                    </div>
                  ))}
                </div>

                <p className="text-yellow-400 font-black text-xl mb-6">
                  Restam {vagasRestantes} {vagasRestantes === 1 ? 'vaga' : 'vagas'} esta semana
                </p>

                <CTAButton onClick={open} size="xl" full>GARANTIR MINHA VAGA AGORA</CTAButton>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          8. COMO FUNCIONA — 4 passos
      ════════════════════════════════════════════════════════ */}
      <section className="py-20 px-5" style={{ background: '#070707' }}>
        <div className="max-w-2xl mx-auto">
          <Reveal>
            <p className="text-yellow-400 text-xs font-black uppercase tracking-[0.2em] mb-3 text-center">Simples assim</p>
            <h2 className="text-3xl sm:text-4xl font-black text-center mb-12">Como funciona</h2>
          </Reveal>

          <div className="space-y-6 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6">
            {[
              { n: '1', title: 'Você deixa seu contato', desc: 'Clica no botão, preenche nome e e-mail — leva 10 segundos.' },
              { n: '2', title: 'Alinhamos pelo WhatsApp', desc: 'Nossa equipe te chama para entender seu negócio e confirmar a vaga.' },
              { n: '3', title: 'Criamos seu site', desc: 'Design personalizado desenvolvido em até 7 dias úteis.' },
              { n: '4', title: 'Seu site vai ao ar', desc: 'Publicado, com hospedagem e SSL — pronto pra receber clientes.' },
            ].map((step, i) => (
              <Reveal key={step.n} delay={i * 100}>
                <div className="flex items-start gap-4 rounded-2xl border border-zinc-800/60 p-5"
                     style={{ background: '#0f0f0f' }}>
                  <div className="w-11 h-11 rounded-2xl bg-yellow-400 flex items-center justify-center text-black font-black text-lg shrink-0">
                    {step.n}
                  </div>
                  <div>
                    <p className="font-black text-white text-base mb-1">{step.title}</p>
                    <p className="text-zinc-500 text-sm leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          9. CTA FINAL — fechamento forte
      ════════════════════════════════════════════════════════ */}
      <section className="py-24 px-5 text-center relative overflow-hidden bg-black">
        <div className="absolute inset-0 pointer-events-none"
             style={{ background: 'radial-gradient(ellipse at center bottom, rgba(250,204,21,0.1) 0%, transparent 65%)' }} />
        <div className="absolute inset-0 opacity-[0.025]"
             style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

        <div className="relative max-w-2xl mx-auto">
          <Reveal>
            <div className="inline-flex items-center gap-2 border border-yellow-400/30 rounded-full px-4 py-2 mb-6"
                 style={{ background: 'rgba(250,204,21,0.06)' }}>
              <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
              <span className="text-yellow-400 text-xs font-bold">Restam poucas vagas esta semana</span>
            </div>

            <h2 className="text-4xl sm:text-6xl font-black leading-tight mb-4">
              Seu site profissional<br />
              por <span className="text-yellow-400">R$97</span>,<br />
              <span className="text-zinc-400 text-3xl sm:text-4xl">no ar em poucos dias.</span>
            </h2>

            <p className="text-zinc-400 text-lg mb-10">
              Não deixe para depois. Cada dia sem site é um dia perdendo clientes.
            </p>

            <CTAButton onClick={open} size="xl">QUERO MINHA VAGA AGORA</CTAButton>
          </Reveal>

          {/* Footer */}
          <div className="mt-16 border-t border-zinc-900 pt-8">
            <p className="text-zinc-600 text-xs">
              © TOP SITE — Todos os direitos reservados.{' '}
              <a href="/termos" className="hover:text-zinc-400 underline underline-offset-2 transition-colors">Termos de Uso</a>
              {' · '}
              <a href="/privacidade" className="hover:text-zinc-400 underline underline-offset-2 transition-colors">Política de Privacidade</a>
            </p>
          </div>
        </div>
      </section>

      {/* ════ Barra flutuante mobile ════ */}
      <StickyBar onOpen={open} />

      {/* ════ Modal ════ */}
      {modalOpen && <LeadModal onClose={() => setModalOpen(false)} />}
    </div>
  )
}
