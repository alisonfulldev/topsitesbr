'use client'

import { useState, useTransition } from 'react'
import { captureLeadAction } from '../actions'

const WHATSAPP_URL = `https://wa.me/${(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '5511999999999').replace(/\D/g, '')}?text=${encodeURIComponent('Oi! Vi a oferta do site por R$97 e quero garantir minha vaga!')}`

// ── Ajuste estes valores conforme necessário ──────────────────────────────────
const SITES_DELIVERED = 50
const VAGAS_SEMANA = 5
const VAGAS_OCUPADAS = 3   // vagas já preenchidas esta semana (1–5)

// ── Galeria de prova social ───────────────────────────────────────────────────
// Coloque as imagens em /public/gallery/ e substitua o array abaixo.
// Enquanto não tiver as imagens, os cards exibem o label da categoria.
const GALLERY = [
  { label: 'Crédito & Financeiro', bg: 'from-blue-950 to-blue-900' },
  { label: 'Estética & Beleza',    bg: 'from-pink-950 to-pink-900' },
  { label: 'Viagem & Turismo',     bg: 'from-teal-950 to-teal-900' },
  { label: 'Engenharia & Construção', bg: 'from-orange-950 to-orange-900' },
  { label: 'E-commerce',           bg: 'from-purple-950 to-purple-900' },
  { label: 'Serviço Público',      bg: 'from-green-950 to-green-900' },
]
// Para usar imagens reais, substitua cada item por:
// { label: 'Crédito & Financeiro', src: '/gallery/credito.jpg' }
// e troque o <div className="..."> pelo <img src={item.src} ... />

// ── Ícones inline ─────────────────────────────────────────────────────────────
function CheckIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  )
}
function XIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}
function AlertIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    </svg>
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
      <div className="absolute inset-0 bg-black/75" />
      <div className="relative w-full max-w-sm bg-zinc-900 border border-zinc-700 rounded-2xl p-6 shadow-2xl">
        {/* Fechar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
          aria-label="Fechar"
        >
          <XIcon />
        </button>

        <div className="mb-5">
          <div className="inline-flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/30 rounded-full px-3 py-1 mb-3">
            <span className="text-yellow-400 text-xs font-bold">Garanta sua vaga</span>
          </div>
          <h2 className="text-xl font-bold text-white leading-tight">
            Falta só um passo para seu site sair do papel!
          </h2>
          <p className="text-zinc-400 text-sm mt-2 leading-relaxed">
            Deixe seu contato e te enviamos direto ao WhatsApp para alinhar os detalhes.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">Seu nome</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: João Silva"
              autoComplete="name"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">Seu e-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ex: joao@email.com"
              autoComplete="email"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            />
          </div>

          {error && (
            <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-3.5 rounded-xl text-sm transition-colors disabled:opacity-70 mt-1"
          >
            {isPending ? 'Redirecionando...' : 'GARANTIR MINHA VAGA →'}
          </button>
        </form>

        <p className="text-zinc-500 text-xs text-center mt-4 leading-relaxed">
          Você será redirecionado ao WhatsApp. Não enviamos spam.
        </p>
      </div>
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────
export function LandingPage() {
  const [modalOpen, setModalOpen] = useState(false)

  function openModal() { setModalOpen(true) }

  const vagasRestantes = VAGAS_SEMANA - VAGAS_OCUPADAS

  return (
    <div className="min-h-screen bg-black text-white">

      {/* ─── SEÇÃO 1: HERO ─────────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center min-h-screen px-5 py-20 text-center overflow-hidden">
        {/* Glow de fundo */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(250,204,21,0.08)_0%,_transparent_60%)] pointer-events-none" />

        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/25 rounded-full px-4 py-1.5 mb-6">
          <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse shrink-0" />
          <span className="text-yellow-400 text-xs font-semibold tracking-wide">Primeiro mês de hospedagem grátis</span>
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight max-w-2xl mb-4">
          Seu negócio ainda não aparece no{' '}
          <span className="text-yellow-400">Google?</span>{' '}
          Isso está te custando clientes todos os dias.
        </h1>

        {/* Subtítulo */}
        <p className="text-zinc-400 text-base sm:text-lg max-w-xl mb-8 leading-relaxed">
          Tenha um site profissional, rápido e pronto pra vender —{' '}
          <strong className="text-white">a partir de R$97</strong>, no ar em poucos dias.
        </p>

        {/* CTA */}
        <button
          onClick={openModal}
          className="bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold text-lg px-8 py-4 rounded-2xl shadow-lg shadow-yellow-400/20 transition-all active:scale-95 mb-4"
        >
          QUERO MEU SITE AGORA →
        </button>

        {/* Micro prova social */}
        <p className="text-zinc-500 text-sm">
          +{SITES_DELIVERED} sites entregues · sem contrato · cancele quando quiser
        </p>
      </section>

      {/* ─── SEÇÃO 2: DOR ──────────────────────────────────────────────── */}
      <section className="bg-zinc-950 py-16 px-5">
        <div className="max-w-xl mx-auto">
          <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-6 text-center">A realidade sem um site</p>
          <div className="space-y-4">
            {[
              'Enquanto você não tem um site, seu concorrente aparece no Google e leva seus clientes.',
              'Quem procura seu serviço online e não te encontra, encontra outro.',
              'Um perfil de rede social não passa a mesma credibilidade de um site profissional.',
              'Sem site, você depende 100% de indicação — e perde quem busca ativamente.',
            ].map((text) => (
              <div key={text} className="flex items-start gap-3 bg-red-500/5 border border-red-500/15 rounded-xl px-4 py-4">
                <div className="w-6 h-6 rounded-full bg-red-500/15 flex items-center justify-center shrink-0 mt-0.5">
                  <XIcon className="w-3.5 h-3.5 text-red-400" />
                </div>
                <p className="text-sm text-zinc-300 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SEÇÃO 3: SOLUÇÃO ──────────────────────────────────────────── */}
      <section className="py-16 px-5">
        <div className="max-w-xl mx-auto">
          <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-2 text-center">O que você recebe</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8">
            Um site completo, pronto pra{' '}
            <span className="text-yellow-400">atrair clientes</span>
          </h2>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-3">
            {[
              'Design profissional feito sob medida para o seu negócio',
              'Funciona perfeitamente no celular (mobile-first)',
              'Otimizado para aparecer no Google (SEO básico incluso)',
              'Botão de WhatsApp para o cliente te chamar na hora',
              'Formulário de contato integrado',
              'Carregamento rápido — sem esperar página abrir',
              'Hospedagem inclusa com certificado SSL (cadeado de segurança)',
              'Primeiro mês de hospedagem gratuito',
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-yellow-400/15 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckIcon className="w-3 h-3 text-yellow-400" />
                </div>
                <p className="text-sm text-zinc-300 leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SEÇÃO 4: PROVA SOCIAL ─────────────────────────────────────── */}
      <section className="bg-zinc-950 py-16 px-5">
        <div className="max-w-3xl mx-auto">
          <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-2 text-center">Prova social</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2">
            Sites que já entregamos —{' '}
            <span className="text-yellow-400">para negócios como o seu</span>
          </h2>
          <p className="text-zinc-500 text-sm text-center mb-8">
            De clínicas a financeiras, de lojas a prestadores de serviço — já colocamos dezenas de negócios no ar.
          </p>

          {/* Galeria */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-8">
            {GALLERY.map((item) => (
              <div
                key={item.label}
                className={`relative aspect-[4/3] rounded-xl overflow-hidden bg-gradient-to-br ${item.bg} border border-white/5 shadow-md flex items-end`}
              >
                {/* Substitua este div por <img src={item.src} className="absolute inset-0 w-full h-full object-cover" /> */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white/20 text-xs font-medium text-center px-3">{item.label}</span>
                </div>
                <div className="relative w-full bg-gradient-to-t from-black/60 to-transparent px-3 py-2">
                  <p className="text-white text-xs font-medium">{item.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Contador */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-3 bg-yellow-400/10 border border-yellow-400/25 rounded-full px-5 py-2.5">
              <span className="text-yellow-400 text-2xl font-extrabold">+{SITES_DELIVERED}</span>
              <span className="text-yellow-400/80 text-sm font-medium">sites entregues</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SEÇÃO 5: OFERTA PRINCIPAL ─────────────────────────────────── */}
      <section className="py-16 px-5">
        <div className="max-w-sm mx-auto">
          <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-2 text-center">Oferta principal</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8">
            Tudo que você precisa,{' '}
            <span className="text-yellow-400">em um único valor</span>
          </h2>

          <div className="bg-zinc-900 border-2 border-yellow-400 rounded-2xl overflow-hidden shadow-xl shadow-yellow-400/10">
            {/* Header do card */}
            <div className="bg-yellow-400 px-6 py-4 text-center">
              <p className="text-black text-xs font-bold uppercase tracking-widest mb-1">Site Profissional</p>
              <p className="text-black text-5xl font-extrabold leading-none">R$97</p>
              <p className="text-black/70 text-xs mt-1">pagamento único · sem mensalidade oculta</p>
            </div>

            {/* Itens incluídos */}
            <div className="px-6 py-5 space-y-3">
              {[
                'Site completo e responsivo (funciona no celular)',
                'Design personalizado para o seu negócio',
                'Otimização para o Google (SEO)',
                'Botão de WhatsApp e formulário de contato',
                'Hospedagem + SSL com PRIMEIRO MÊS GRÁTIS',
                'Prazo de entrega de até 7 dias úteis',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckIcon className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-zinc-300 leading-snug">{item}</p>
                </div>
              ))}
            </div>

            <div className="px-6 pb-6">
              <button
                onClick={openModal}
                className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold py-4 rounded-xl text-base transition-all active:scale-95 shadow-lg shadow-yellow-400/20"
              >
                QUERO MEU SITE POR R$97 →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SEÇÃO 6: OUTRAS OPÇÕES ────────────────────────────────────── */}
      <section className="bg-zinc-950 py-16 px-5">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl font-bold text-center mb-2">Precisa de algo mais robusto?</h2>
          <p className="text-zinc-500 text-sm text-center mb-8">Temos opções para cada fase do seu negócio.</p>

          <div className="grid gap-4 sm:grid-cols-3">
            {/* R$97 — destaque */}
            <div className="relative bg-zinc-900 border-2 border-yellow-400/50 rounded-2xl p-5 flex flex-col">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-yellow-400 text-black text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wide whitespace-nowrap">
                  Mais escolhido
                </span>
              </div>
              <p className="text-yellow-400 text-xs font-bold uppercase tracking-widest mb-1 mt-2">Site de Entrada</p>
              <p className="text-3xl font-extrabold text-white mb-1">R$97</p>
              <p className="text-zinc-500 text-xs mb-4 leading-relaxed">
                Para quem quer presença online profissional com o essencial para atrair clientes.
              </p>
              <ul className="space-y-1.5 mb-5 flex-1">
                {['Página única completa', 'Design sob medida', 'SEO + WhatsApp', '1º mês grátis'].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-zinc-300">
                    <CheckIcon className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={openModal}
                className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-2.5 rounded-xl text-sm transition-colors"
              >
                Quero este
              </button>
            </div>

            {/* R$197 */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col">
              <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-1">Landing Page</p>
              <p className="text-3xl font-extrabold text-white mb-1">R$197</p>
              <p className="text-zinc-500 text-xs mb-4 leading-relaxed">
                Para quem quer converter mais — seções extras, depoimentos, FAQ e foco em vendas.
              </p>
              <ul className="space-y-1.5 mb-5 flex-1">
                {['Página focada em conversão', 'Mais seções e conteúdo', 'SEO avançado', '1º mês grátis'].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-zinc-300">
                    <CheckIcon className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={openModal}
                className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-2.5 rounded-xl text-sm transition-colors"
              >
                Quero este
              </button>
            </div>

            {/* R$299 */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col">
              <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-1">Site Institucional</p>
              <p className="text-3xl font-extrabold text-white mb-1">R$299</p>
              <p className="text-zinc-500 text-xs mb-4 leading-relaxed">
                Para empresas que precisam de múltiplas páginas, portfólio e maior credibilidade.
              </p>
              <ul className="space-y-1.5 mb-5 flex-1">
                {['Múltiplas páginas', 'Portfólio e galeria', 'Formulário avançado', '1º mês grátis'].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-zinc-300">
                    <CheckIcon className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={openModal}
                className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-2.5 rounded-xl text-sm transition-colors"
              >
                Quero este
              </button>
            </div>
          </div>

          <p className="text-zinc-600 text-xs text-center mt-6">
            Todos os planos incluem 1º mês de hospedagem grátis. A escolha do plano é alinhada no WhatsApp.
          </p>
        </div>
      </section>

      {/* ─── SEÇÃO 7: ESCASSEZ ─────────────────────────────────────────── */}
      <section className="py-16 px-5">
        <div className="max-w-xl mx-auto">
          <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 text-center">
            <div className="flex justify-center mb-3">
              <AlertIcon className="w-6 h-6 text-red-400" />
            </div>
            <h2 className="text-lg font-bold text-white mb-2">Atenção: produzimos sob demanda, com qualidade</h2>
            <p className="text-zinc-400 text-sm leading-relaxed mb-6">
              Por isso, aceitamos apenas <strong className="text-white">5 novos sites por semana</strong>.
              As vagas desta semana estão acabando — garanta a sua antes que esgotem.
            </p>

            {/* Indicador de vagas */}
            <div className="flex justify-center gap-2 mb-3">
              {Array.from({ length: VAGAS_SEMANA }).map((_, i) => (
                <div
                  key={i}
                  className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${
                    i < VAGAS_OCUPADAS
                      ? 'bg-red-500/20 border-red-500 text-red-400'
                      : 'bg-green-500/15 border-green-500 text-green-400'
                  }`}
                >
                  {i < VAGAS_OCUPADAS ? '✕' : '✓'}
                </div>
              ))}
            </div>
            <p className="text-sm font-semibold text-yellow-400">
              Restam {vagasRestantes} {vagasRestantes === 1 ? 'vaga' : 'vagas'} esta semana
            </p>
          </div>
        </div>
      </section>

      {/* ─── SEÇÃO 8: COMO FUNCIONA ────────────────────────────────────── */}
      <section className="bg-zinc-950 py-16 px-5">
        <div className="max-w-2xl mx-auto">
          <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-2 text-center">Simples assim</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">Como funciona</h2>

          <div className="grid gap-6 sm:grid-cols-2">
            {[
              { n: '1', title: 'Você deixa seu contato', desc: 'Clica no botão, preenche nome e e-mail — leva 10 segundos.' },
              { n: '2', title: 'Alinhamos pelo WhatsApp', desc: 'Nossa equipe te chama para entender o seu negócio e confirmar a vaga.' },
              { n: '3', title: 'Criamos seu site', desc: 'Design personalizado desenvolvido em até 7 dias úteis.' },
              { n: '4', title: 'Seu site vai ao ar', desc: 'Publicado, com hospedagem e SSL configurados — pronto pra receber clientes.' },
            ].map((step) => (
              <div key={step.n} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center text-black font-extrabold text-base shrink-0">
                  {step.n}
                </div>
                <div>
                  <p className="font-semibold text-white text-base leading-snug mb-1">{step.title}</p>
                  <p className="text-zinc-500 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SEÇÃO 9: CTA FINAL ────────────────────────────────────────── */}
      <section className="py-20 px-5 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(250,204,21,0.07)_0%,_transparent_60%)] pointer-events-none" />
        <div className="relative max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-4xl font-extrabold leading-tight mb-3">
            Seu site profissional por{' '}
            <span className="text-yellow-400">R$97</span>,{' '}
            no ar em poucos dias.
          </h2>
          <p className="text-zinc-400 text-base mb-8">
            Restam poucas vagas esta semana — não deixe para depois.
          </p>
          <button
            onClick={openModal}
            className="bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold text-lg px-10 py-4 rounded-2xl shadow-lg shadow-yellow-400/20 transition-all active:scale-95 mb-10"
          >
            QUERO MINHA VAGA AGORA →
          </button>

          {/* Footer */}
          <div className="border-t border-zinc-800 pt-8">
            <p className="text-zinc-600 text-xs">
              © TOP SITE — Todos os direitos reservados.{' '}
              <a href="/termos" className="hover:text-zinc-400 underline underline-offset-2">Termos de Uso</a>
              {' · '}
              <a href="/privacidade" className="hover:text-zinc-400 underline underline-offset-2">Política de Privacidade</a>
            </p>
          </div>
        </div>
      </section>

      {/* ─── Modal ─────────────────────────────────────────────────────── */}
      {modalOpen && <LeadModal onClose={() => setModalOpen(false)} />}
    </div>
  )
}
