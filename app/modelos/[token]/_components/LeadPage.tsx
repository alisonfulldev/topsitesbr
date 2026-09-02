'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import Image from 'next/image'
import { captureEmailAction, checkoutAction } from '../actions'
import { validateDocument, formatDocument } from '@/lib/cpf'

interface Props {
  token: string
  leadName: string
  template1Name: string
  template2Name: string
  alreadyPaid: boolean
}

// ── Cases reais (dados da home) ───────────────────────────────────────────────
const CASES = [
  {
    name: 'Estética Del Soares',
    segment: 'Clínica Estética',
    domain: 'esteticadelsoares.com.br',
    favicon: '/faicon/del.png',
    desc: 'Tratamentos faciais e corporais com profissionais especializados.',
  },
  {
    name: 'OZ Energia Solar',
    segment: 'Energia Solar',
    domain: 'ozenergiasolar.com.br',
    favicon: '/faicon/oz.png',
    desc: 'Instalação de painéis solares com orçamento grátis em 24h.',
  },
  {
    name: 'Yasmim Pinho Psicóloga',
    segment: 'Psicologia',
    domain: 'yasmimpinhopsicologa.com.br',
    favicon: '/faicon/yasmin.png',
    desc: 'Atendimento psicológico online e presencial, com agenda flexível.',
  },
]

// ── SEO técnicas ──────────────────────────────────────────────────────────────
const SEO_ITEMS = [
  { icon: '🔍', title: 'SEO on-page', desc: 'Cada título, parágrafo e imagem do site são preparados para o Google entender o seu negócio.' },
  { icon: '🏷️', title: 'Meta tags otimizadas', desc: 'Título e descrição que aparecem direto nos resultados de busca — o primeiro contato do cliente com a sua empresa.' },
  { icon: '📋', title: 'Dados estruturados (Schema)', desc: 'Um "código especial" que ajuda o Google a identificar o seu negócio: nome, endereço, telefone, horário.' },
  { icon: '🔗', title: 'URLs amigáveis', desc: 'Endereços simples e descritivos que tanto o Google quanto seus clientes entendem de primeira.' },
  { icon: '⚡', title: 'Velocidade otimizada', desc: 'Sites lentos perdem visitantes. O seu é leve e rápido — o Google valoriza isso na hora de ranquear.' },
  { icon: '📊', title: 'Google Search Console', desc: 'Entregamos o site conectado ao Google Search Console para monitorar as buscas e evoluir o posicionamento.' },
]

// ── Planos ────────────────────────────────────────────────────────────────────
const PLANS = [
  {
    id: 'plano1',
    name: 'Site',
    price: 'R$ 97',
    period: 'pagamento único',
    description: 'Receba os arquivos do seu site para hospedar onde quiser.',
    features: [
      'Design exclusivo para o seu negócio',
      'Personalizado com sua logo, cores e textos',
      'Arquivo HTML/CSS completo',
      'Sem mensalidade',
    ],
    highlight: false,
  },
  {
    id: 'plano2',
    name: 'Essencial',
    price: 'R$ 97',
    period: '+ R$ 19/mês',
    description: 'Seu site no ar hoje, com hospedagem gerenciada e SSL inclusos.',
    features: [
      'Tudo do plano Site',
      '1º mês de mensalidade grátis',
      'Hospedagem gerenciada',
      'Certificado SSL',
      'Subdomínio .topsitebr.com.br',
      'Suporte via painel',
    ],
    highlight: true,
    badge: 'Mais popular',
  },
  {
    id: 'plano3',
    name: 'Completo',
    price: 'R$ 188',
    period: '+ R$ 19/mês',
    description: 'Tudo incluído: hospedagem, SSL e domínio .com.br no 1º ano.',
    features: [
      'Tudo do plano Essencial',
      '1º mês de mensalidade grátis',
      'Domínio .com.br incluso (1º ano)',
      'Configuração de DNS',
      'E-mail profissional',
    ],
    highlight: false,
  },
]

// ── Componente principal ──────────────────────────────────────────────────────
export default function LeadPage({ token, leadName, template1Name, template2Name, alreadyPaid }: Props) {
  const firstName = leadName.split(' ')[0]
  const templateNames = { '1': template1Name, '2': template2Name } as const

  // Gate
  const [gateOpen, setGateOpen] = useState(true)
  const [gateEmail, setGateEmail] = useState('')
  const [gateError, setGateError] = useState('')
  const [gatePending, startGateTransition] = useTransition()

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem(`tps_gate_${token}`)) {
      setGateOpen(false)
    }
  }, [token])

  function handleGateSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!gateEmail.trim() || !gateEmail.includes('@')) {
      setGateError('Informe um e-mail válido.')
      return
    }
    setGateError('')
    startGateTransition(async () => {
      const res = await captureEmailAction(token, gateEmail)
      if (res.error) { setGateError(res.error); return }
      localStorage.setItem(`tps_gate_${token}`, '1')
      setGateOpen(false)
    })
  }

  // Preview modal
  const [previewOpen, setPreviewOpen] = useState<'1' | '2' | null>(null)

  // Checkout
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [name, setName] = useState(leadName)
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [document, setDocument] = useState('')
  const [checkoutError, setCheckoutError] = useState('')
  const [checkoutPending, startCheckoutTransition] = useTransition()
  const formRef = useRef<HTMLElement>(null)

  function choosePlan(planId: string) {
    setSelectedPlan(planId)
    setCheckoutError('')
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  function handleDocumentChange(e: React.ChangeEvent<HTMLInputElement>) {
    setDocument(formatDocument(e.target.value.replace(/\D/g, '').slice(0, 14)))
  }

  function handleCheckout(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedPlan) { setCheckoutError('Selecione uma opção acima.'); return }
    if (!name.trim()) { setCheckoutError('Informe seu nome.'); return }
    if (!email.trim() || !email.includes('@')) { setCheckoutError('Informe um e-mail válido.'); return }
    const docClean = document.replace(/\D/g, '')
    if (!validateDocument(docClean)) { setCheckoutError('CPF ou CNPJ inválido.'); return }
    setCheckoutError('')
    startCheckoutTransition(async () => {
      const res = await checkoutAction(token, selectedPlan, name, email, phone, document)
      if (res.error) { setCheckoutError(res.error); return }
      if (res.paymentUrl) window.location.href = res.paymentUrl
    })
  }

  // ── Já pago ───────────────────────────────────────────────────────────────
  if (alreadyPaid) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Site já adquirido!</h1>
          <p className="text-gray-500 text-sm">Entraremos em contato em breve para colocá-lo no ar.</p>
        </div>
      </main>
    )
  }

  // ── Gate de e-mail ────────────────────────────────────────────────────────
  if (gateOpen) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <Image src="/logo.png" alt="TOP SITE" width={120} height={36} className="h-9 w-auto mx-auto mb-6" priority />
            <h1 className="text-2xl font-black text-white mb-2">
              Olá, {firstName}! Seu site está pronto.
            </h1>
            <p className="text-gray-400 text-sm leading-relaxed">
              Preparamos modelos exclusivos para o seu negócio.<br />
              Informe seu e-mail para visualizar.
            </p>
          </div>

          <form onSubmit={handleGateSubmit} className="space-y-3">
            <input
              type="email"
              value={gateEmail}
              onChange={(e) => setGateEmail(e.target.value)}
              required
              placeholder="seu@email.com"
              className="w-full rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-500 px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand/50"
            />
            {gateError && <p className="text-red-400 text-xs">{gateError}</p>}
            <button
              type="submit"
              disabled={gatePending}
              className="w-full bg-brand text-brand-dark font-bold py-3.5 rounded-xl text-sm hover:bg-brand/90 transition-colors disabled:opacity-50"
            >
              {gatePending ? 'Aguarde...' : 'Ver os modelos →'}
            </button>
          </form>
          <p className="text-center text-xs text-gray-600 mt-4">Sem spam. Só seus modelos.</p>
        </div>
      </main>
    )
  }

  // ── Página principal ──────────────────────────────────────────────────────
  return (
    <>
      {/* Modal preview completo */}
      {previewOpen !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setPreviewOpen(null)}
        >
          <div
            className="relative flex flex-col w-full h-full sm:w-96 sm:h-[88vh] sm:rounded-3xl overflow-hidden bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="shrink-0 flex items-center justify-between px-4 py-2.5 bg-gray-900">
              <span className="text-xs font-semibold text-white/80 truncate">{templateNames[previewOpen]}</span>
              <button onClick={() => setPreviewOpen(null)} className="ml-3 text-white/60 hover:text-white text-xl leading-none">✕</button>
            </div>
            <iframe src={`/modelos/${token}/preview/${previewOpen}`} title={templateNames[previewOpen]} className="flex-1 w-full border-none" />
          </div>
        </div>
      )}

      <main className="min-h-screen bg-white">
        {/* Header */}
        <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
            <Image src="/logo.png" alt="TOP SITE" width={120} height={36} className="h-8 w-auto" priority />
            <a href="#checkout" className="text-xs font-semibold bg-brand text-brand-dark px-4 py-1.5 rounded-full hover:bg-brand/90 transition-colors">
              Contratar
            </a>
          </div>
        </header>

        {/* Hero */}
        <section className="py-14 px-4 text-center bg-gradient-to-b from-gray-50 to-white">
          <p className="text-sm font-semibold text-brand uppercase tracking-widest mb-3">Criado exclusivamente para você</p>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight mb-5">
            {firstName}, veja os modelos<br className="hidden sm:block" /> do seu site
          </h1>
          <p className="text-gray-500 text-base max-w-xl mx-auto">
            Desenvolvemos modelos de site pensados para o seu segmento de negócio.
            Após a contratação, personalizamos tudo com a sua identidade —
            logo, cores, textos e imagens — <strong className="text-gray-700">do jeito que você quiser</strong>.
          </p>
        </section>

        {/* Mockups */}
        <section className="py-12 px-4">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center sm:items-start justify-center gap-10 sm:gap-16">
            {(['1', '2'] as const).map((num) => (
              <div key={num} className="flex flex-col items-center gap-4">
                <div className="relative" style={{ width: 220 }}>
                  <div className="relative rounded-[32px] bg-gray-900 shadow-2xl" style={{ padding: '10px 8px 14px' }}>
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-5 bg-gray-900 rounded-b-xl z-10" />
                    <div className="rounded-[24px] overflow-hidden bg-white" style={{ width: 204, height: 432 }}>
                      <iframe
                        src={`/modelos/${token}/preview/${num}`}
                        title={`Template ${num}`}
                        scrolling="no"
                        style={{ width: 390, height: 844, border: 'none', transformOrigin: 'top left', transform: `scale(${204 / 390})`, pointerEvents: 'none' }}
                      />
                    </div>
                  </div>
                  <div className="absolute right-0 top-20 w-1 h-12 bg-gray-700 rounded-r-full" />
                  <div className="absolute left-0 top-16 w-1 h-8 bg-gray-700 rounded-l-full" />
                  <div className="absolute left-0 top-28 w-1 h-8 bg-gray-700 rounded-l-full" />
                </div>
                <div className="text-center flex flex-col items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-brand/15 text-brand text-[10px] font-black">{num}</span>
                    {templateNames[num]}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPreviewOpen(num)}
                    className="text-xs font-semibold text-brand border border-brand/30 px-4 py-1.5 rounded-full hover:bg-brand/5 transition-colors"
                  >
                    Ver site completo ↗
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Personalização */}
        <section className="py-14 px-4 bg-gray-900">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-brand text-sm font-bold uppercase tracking-widest mb-4">100% personalizado</p>
            <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-5">
              Estes são modelos de referência.<br />
              O <span className="text-brand">SEU</span> site será único.
            </h2>
            <p className="text-gray-400 text-base max-w-xl mx-auto mb-8">
              Após a contratação, montamos o site com a identidade da sua empresa: sua logo, suas cores, seus textos, suas fotos e seus dados de contato. Você aprova antes de ir ao ar.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
              {[
                { icon: '🎨', label: 'Cores e tipografia', desc: 'Adaptadas à identidade visual da sua marca' },
                { icon: '✏️', label: 'Textos e conteúdo', desc: 'Escritos para apresentar bem o seu negócio' },
                { icon: '📸', label: 'Fotos e imagens', desc: 'Suas fotos ou banco de imagens profissional' },
              ].map(({ icon, label, desc }) => (
                <div key={label} className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <span className="text-2xl mb-2 block">{icon}</span>
                  <p className="text-white font-semibold text-sm mb-1">{label}</p>
                  <p className="text-gray-400 text-xs leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Cases */}
        <section className="py-14 px-4 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <p className="text-sm font-semibold text-brand uppercase tracking-widest mb-2">Clientes reais</p>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2">Sites que já entregamos</h2>
              <p className="text-gray-500">Cada um personalizado para o segmento e identidade do cliente.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {CASES.map((c) => (
                <div key={c.domain} className="border border-gray-100 rounded-2xl p-5 flex flex-col gap-3 hover:border-gray-200 hover:shadow-sm transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                      <Image src={c.favicon} alt={c.name} width={28} height={28} className="w-7 h-7 object-contain" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 leading-tight">{c.name}</p>
                      <p className="text-xs text-gray-400">{c.segment}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed flex-1">{c.desc}</p>
                  <a
                    href={`https://${c.domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline"
                  >
                    Ver site ao vivo ↗
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SEO */}
        <section className="py-14 px-4 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <p className="text-sm font-semibold text-brand uppercase tracking-widest mb-2">Visibilidade no Google</p>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-3">
                Seu negócio vai aparecer<br className="hidden sm:block" /> quando seus clientes procurarem por você
              </h2>
              <p className="text-gray-500 max-w-xl mx-auto">
                Não basta ter um site bonito — ele precisa ser encontrado. Por isso, cada site que entregamos já vem preparado para o Google.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {SEO_ITEMS.map(({ icon, title, desc }) => (
                <div key={title} className="bg-white rounded-2xl p-5 border border-gray-100">
                  <span className="text-2xl mb-3 block">{icon}</span>
                  <p className="text-sm font-bold text-gray-900 mb-1">{title}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
            <p className="text-center text-xs text-gray-400 mt-6">
              Não prometemos a primeira posição — isso depende de tempo e competição no seu segmento. O que garantimos é que o site vai estar <strong>preparado e visível</strong> para quem busca pelo seu negócio.
            </p>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-14 px-4 bg-white" id="planos">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-3">Como você quer ter o seu site?</h2>
              <p className="text-gray-500 max-w-lg mx-auto">
                O site custa <strong className="text-gray-700">R$ 97 uma única vez</strong>. A hospedagem mensal é opcional — você escolhe se quer que a gente cuide de tudo ou prefere hospedar por conta própria.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {PLANS.map((plan) => (
                <div
                  key={plan.id}
                  className={`relative rounded-2xl p-6 flex flex-col gap-4 cursor-pointer border-2 transition-all ${
                    selectedPlan === plan.id
                      ? 'border-brand bg-white shadow-lg shadow-brand/10'
                      : plan.highlight
                      ? 'border-brand/30 bg-white shadow-md'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                  onClick={() => choosePlan(plan.id)}
                >
                  {plan.badge && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand text-brand-dark text-[11px] font-bold px-3 py-0.5 rounded-full whitespace-nowrap">
                      {plan.badge}
                    </span>
                  )}
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">{plan.name}</p>
                    <div className="flex items-end gap-1">
                      <span className="text-3xl font-black text-gray-900">{plan.price}</span>
                      <span className="text-sm text-gray-500 mb-0.5">{plan.period}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">{plan.description}</p>
                  </div>
                  <ul className="space-y-1.5 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="text-brand mt-0.5 shrink-0">✓</span>{f}
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); choosePlan(plan.id) }}
                    className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                      selectedPlan === plan.id ? 'bg-brand text-brand-dark' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {selectedPlan === plan.id ? '✓ Selecionado' : 'Quero esta opção'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Checkout */}
        <section className="py-14 px-4 bg-gray-50" id="checkout" ref={formRef}>
          <div className="max-w-md mx-auto">
            <h2 className="text-xl font-black text-gray-900 mb-1 text-center">Finalizar contratação</h2>
            <p className="text-sm text-gray-500 text-center mb-8">
              {selectedPlan
                ? `${PLANS.find((p) => p.id === selectedPlan)?.name} selecionado — preencha seus dados abaixo`
                : 'Selecione uma opção acima e preencha seus dados.'}
            </p>
            <form onSubmit={handleCheckout} className="space-y-4">
              {[
                { label: 'Seu nome *', type: 'text', value: name, onChange: (v: string) => setName(v), placeholder: 'Nome completo' },
                { label: 'E-mail *', type: 'email', value: email, onChange: (v: string) => setEmail(v), placeholder: 'seu@email.com' },
                { label: 'WhatsApp', type: 'tel', value: phone, onChange: (v: string) => setPhone(v), placeholder: '(11) 99999-9999' },
              ].map(({ label, type, value, onChange, placeholder }) => (
                <div key={label}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors"
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CPF ou CNPJ *</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={document}
                  onChange={handleDocumentChange}
                  placeholder="000.000.000-00"
                  maxLength={18}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors"
                />
                <p className="text-[11px] text-gray-400 mt-1">Necessário para emissão do comprovante de pagamento.</p>
              </div>

              {checkoutError && (
                <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-4 py-2">{checkoutError}</p>
              )}

              <button
                type="submit"
                disabled={checkoutPending || !selectedPlan}
                className="w-full bg-brand text-brand-dark font-bold py-4 rounded-xl text-sm hover:bg-brand/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {checkoutPending ? 'Aguarde...' : 'Ir para o pagamento →'}
              </button>
              <p className="text-xs text-gray-400 text-center">
                Você será redirecionado para a página segura de pagamento. Pix, boleto ou cartão de crédito.
              </p>
            </form>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-100 py-8 px-4">
          <div className="max-w-5xl mx-auto text-center">
            <Image src="/logo.png" alt="TOP SITE" width={100} height={30} className="h-6 w-auto mx-auto mb-2 opacity-40" />
            <p className="text-xs text-gray-400">Sites profissionais para pequenos negócios.</p>
          </div>
        </footer>
      </main>
    </>
  )
}
