'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { captureEmailAction, checkoutAction, chooseTemplateAction } from '../actions'
import { validateDocument, formatDocument } from '@/lib/cpf'

interface Props {
  token: string
  leadName: string
  leadPersonName: string | null
  template1Name: string
  template2Name: string
  alreadyPaid: boolean
  contractHtml: string
  pricePlano1: number
  pricePlano2: number
  pricePlano3: number
  priceMonthly: number
}

function toSlug(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '')
    .slice(0, 22)
}

type PlanId = 'plano1' | 'plano2' | 'plano3'

function fmt(n: number) {
  return `R$ ${n % 1 === 0 ? n : n.toFixed(2).replace('.', ',')}`
}

function buildPlanData(p1: number, p2: number, p3: number, monthly: number) {
  const fMonthly = fmt(monthly)
  return [
    {
      id: 'plano1' as PlanId,
      name: 'Criação do Site',
      price: fmt(p1),
      priceNote: 'pagamento único',
      monthly: null,
      description: 'Site profissional criado, personalizado e pronto para usar. Pagamento único.',
      note: 'Só a criação — sem hospedagem.',
      badge: null,
      highlight: false,
      features: [
        'Site profissional completo — design moderno e exclusivo',
        'Responsivo — perfeito no celular, tablet e computador',
        'Personalizado com sua logo, cores, textos e fotos',
        'Código limpo e otimizado — carrega rápido',
        'Você recebe os arquivos para hospedar onde quiser',
      ],
    },
    {
      id: 'plano2' as PlanId,
      name: 'Site + Plano no Ar',
      price: fmt(p2),
      priceNote: 'criação (pagamento único)',
      monthly: `${fMonthly}/mês`,
      description: 'Tudo da criação, e cuidamos de deixar seu site no ar e aparecendo no Google.',
      note: null,
      badge: '⭐ mais escolhido',
      highlight: true,
      features: [
        'Site no ar 24h — hospedagem, sempre acessível',
        'Aparecer no Google — meta tags, Schema, URLs amigáveis, dados estruturados',
        'Sitemap enviado ao Google — indexação de todas as páginas (essencial pra aparecer nas buscas)',
        'Integração com Google Search Console',
        'SSL (segurança) — o Google prioriza sites seguros',
        'Velocidade otimizada',
        'Painel de métricas — visitantes, origem, desempenho',
        'Suporte contínuo — sem você mexer em nada técnico',
      ],
    },
    {
      id: 'plano3' as PlanId,
      name: 'Site + Plano no Ar + Domínio',
      price: fmt(p3),
      priceNote: 'criação + domínio (único)',
      monthly: `${fMonthly}/mês`,
      description: 'Tudo do Plano no Ar, MAIS seu endereço profissional exclusivo.',
      note: 'Renovação do domínio: R$91/ano',
      badge: null,
      highlight: false,
      features: [
        'Domínio próprio (ex: seunegocio.com.br) — sem "topsitebr" no meio',
        'Muito mais credibilidade — endereço próprio passa seriedade e confiança',
        'Mais forte no Google — domínio próprio ajuda a ser reconhecido e ranquear melhor',
        'E-mail profissional possível — ex: contato@seunegocio.com.br',
        'Você é dono do seu endereço — sua marca, seu domínio registrado',
        'Configuramos tudo — registro e configuração por nossa conta',
      ],
    },
  ]
}

function GoogleSerpMockup({ businessName }: { businessName: string }) {
  const domain = `${toSlug(businessName)}.com.br`
  const query = businessName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, '+')

  return (
    <div className="relative w-full max-w-lg mx-auto lg:mx-0">
      <div
        className="absolute -inset-8 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(250,204,21,0.07) 0%, transparent 60%)' }}
      />
      <div className="relative">
        <div
          className="rounded-t-2xl overflow-hidden"
          style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 20px 60px rgba(0,0,0,0.7)' }}
        >
          {/* Browser chrome */}
          <div className="flex items-center gap-2 px-3 py-2.5" style={{ background: '#f1f3f4' }}>
            <div className="flex gap-1.5 shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
            </div>
            <div className="flex-1 mx-3 overflow-hidden">
              <div className="max-w-sm mx-auto px-3 py-1 rounded flex items-center gap-2 truncate" style={{ background: '#fff', border: '1px solid #dadce0', fontSize: 9, color: '#5f6368' }}>
                google.com.br/search?q={query}
              </div>
            </div>
          </div>
          {/* SERP */}
          <div className="aspect-[16/10] relative overflow-hidden" style={{ background: '#fff' }}>
            <div className="absolute inset-0 flex flex-col" style={{ padding: '12px 16px', fontFamily: 'Arial, sans-serif' }}>
              <div className="flex items-center gap-3 mb-2">
                <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: -0.5, lineHeight: 1 }}>
                  <span style={{ color: '#4285f4' }}>G</span><span style={{ color: '#ea4335' }}>o</span><span style={{ color: '#fbbc04' }}>o</span><span style={{ color: '#4285f4' }}>g</span><span style={{ color: '#34a853' }}>l</span><span style={{ color: '#ea4335' }}>e</span>
                </span>
                <div className="flex-1 flex items-center gap-2 px-3" style={{ height: 26, border: '1px solid #dfe1e5', borderRadius: 14, boxShadow: '0 1px 6px rgba(32,33,36,.1)', background: '#fff' }}>
                  <span style={{ fontSize: 9, color: '#202124', flex: 1 }}>{businessName}</span>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#4285f4" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                </div>
              </div>
              <div className="flex items-center gap-4 mb-1.5 pb-1" style={{ borderBottom: '1px solid #ebebeb' }}>
                {(['Tudo', 'Imagens', 'Maps', 'Mais'] as const).map((label, i) => (
                  <span key={label} style={{ fontSize: 9, color: i === 0 ? '#1a73e8' : '#5f6368', borderBottom: i === 0 ? '2px solid #1a73e8' : 'none', paddingBottom: 3, fontWeight: i === 0 ? 500 : 400 }}>{label}</span>
                ))}
              </div>
              <p style={{ fontSize: 7.5, color: '#70757a', marginBottom: 8 }}>Cerca de 2.140.000 resultados (0,42 segundos)</p>
              <div style={{ marginBottom: 10, padding: '8px 10px', borderRadius: 8, border: '1px solid #e8f0fe', background: '#f8fbff' }}>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <div className="w-4 h-4 rounded-sm flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #facc15, #f59e0b)' }}>
                    <span style={{ fontSize: 6, fontWeight: 700, color: '#000' }}>1</span>
                  </div>
                  <span style={{ fontSize: 8, color: '#188038' }}>{domain} › inicio › servicos</span>
                </div>
                <div style={{ fontSize: 11, color: '#1a0dab', fontWeight: 500, lineHeight: 1.3, marginBottom: 3 }}>{businessName} — Referência na Região</div>
                <div style={{ fontSize: 8.5, color: '#4d5156', lineHeight: 1.5 }}>Atendimento de qualidade com resultado garantido. ⭐⭐⭐⭐⭐ Mais de 200 avaliações 5 estrelas.</div>
                <div className="flex gap-4 mt-2 pt-2" style={{ borderTop: '1px solid #e8f0fe' }}>
                  {['Agendar', 'Serviços', 'Contato'].map((l) => <span key={l} style={{ fontSize: 8, color: '#1a0dab' }}>{l}</span>)}
                </div>
              </div>
              <div style={{ opacity: 0.5, marginBottom: 7 }}>
                <div style={{ fontSize: 7.5, color: '#188038' }}>concorrente1.com.br</div>
                <div style={{ fontSize: 10, color: '#1a0dab' }}>Concorrente — Serviços na Região</div>
                <div style={{ fontSize: 8, color: '#4d5156' }}>Confira nossos planos e entre em contato...</div>
              </div>
              <div style={{ opacity: 0.25 }}>
                <div style={{ fontSize: 7.5, color: '#188038' }}>concorrente2.com.br</div>
                <div style={{ fontSize: 10, color: '#1a0dab' }}>Serviços — Resultados Comprovados</div>
              </div>
            </div>
          </div>
        </div>
        <div className="mx-auto h-2 rounded-b-2xl" style={{ width: '95%', background: 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))', border: '1px solid rgba(255,255,255,0.04)', borderTop: 'none' }} />
        <div className="mx-auto h-1" style={{ width: '60%', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.02)' }} />
        <div className="absolute -top-2 -right-2 px-3 py-1 rounded-full text-[10px] font-bold" style={{ background: 'linear-gradient(135deg, #facc15, #f59e0b)', color: '#000', boxShadow: '0 4px 16px rgba(250,204,21,0.3)' }}>
          #1 Google
        </div>
      </div>
      <p className="text-center mt-3 text-[11px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
        Exemplo ilustrativo · SEO otimizado para o seu segmento
      </p>
    </div>
  )
}

export default function LeadPage({ token, leadName, leadPersonName, template1Name, template2Name, alreadyPaid, contractHtml, pricePlano1, pricePlano2, pricePlano3, priceMonthly }: Props) {
  const firstName = leadPersonName ? leadPersonName.split(' ')[0] : null
  const templateNames = { '1': template1Name, '2': template2Name } as const
  const planData = buildPlanData(pricePlano1, pricePlano2, pricePlano3, priceMonthly)

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
    if (!gateEmail.trim() || !gateEmail.includes('@')) { setGateError('Informe um e-mail válido.'); return }
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

  // Contract modal
  const [contractOpen, setContractOpen] = useState(false)

  // Model selection
  const [selectedTemplate, setSelectedTemplate] = useState<'1' | '2' | null>(null)

  function handleChooseTemplate(num: '1' | '2') {
    setSelectedTemplate(num)
    chooseTemplateAction(token, parseInt(num)).catch(() => {})
    setTimeout(() => window.document.getElementById('checkout')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80)
  }

  // Plan selection
  const [selectedPlan, setSelectedPlan] = useState<PlanId>('plano2')

  function handleSelectPlan(planId: PlanId) {
    setSelectedPlan(planId)
    setTimeout(() => window.document.getElementById('checkout-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80)
  }

  // Checkout
  const [name, setName] = useState(leadPersonName ?? '')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [document, setDocument] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [checkoutError, setCheckoutError] = useState('')
  const [checkoutPending, startCheckoutTransition] = useTransition()
  const formRef = useRef<HTMLElement>(null)

  function handleDocumentChange(e: React.ChangeEvent<HTMLInputElement>) {
    setDocument(formatDocument(e.target.value.replace(/\D/g, '').slice(0, 14)))
  }

  function handleCheckout(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setCheckoutError('Informe seu nome.'); return }
    if (!email.trim() || !email.includes('@')) { setCheckoutError('Informe um e-mail válido.'); return }
    const docClean = document.replace(/\D/g, '')
    if (!validateDocument(docClean)) { setCheckoutError('CPF ou CNPJ inválido.'); return }
    if (!termsAccepted) { setCheckoutError('Você precisa aceitar os Termos de Uso para continuar.'); return }
    setCheckoutError('')
    startCheckoutTransition(async () => {
      const res = await checkoutAction(token, selectedPlan, name, email, phone, document, termsAccepted)
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
            <h1 className="text-2xl font-black text-white mb-2">{firstName ? `Olá, ${firstName}! Seu site está pronto.` : 'Seu site está pronto!'}</h1>
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
            <button type="submit" disabled={gatePending} className="w-full bg-brand text-brand-dark font-bold py-3.5 rounded-xl text-sm hover:bg-brand/90 transition-colors disabled:opacity-50">
              {gatePending ? 'Aguarde...' : 'Ver os modelos →'}
            </button>
          </form>
          <p className="text-center text-xs text-gray-600 mt-4">Sem spam. Só seus modelos.</p>
        </div>
      </main>
    )
  }

  const activePlan = planData.find((p) => p.id === selectedPlan)!

  // ── Página principal ──────────────────────────────────────────────────────
  return (
    <>
      {/* Modal preview completo */}
      {previewOpen !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90" onClick={() => setPreviewOpen(null)}>
          <div className="relative flex flex-col w-full h-full sm:w-96 sm:h-[88vh] sm:rounded-3xl overflow-hidden bg-white" onClick={(e) => e.stopPropagation()}>
            <div className="shrink-0 flex items-center justify-between px-4 py-2.5 bg-gray-900">
              <span className="text-xs font-semibold text-white/80 truncate">{templateNames[previewOpen]}</span>
              <button onClick={() => setPreviewOpen(null)} className="ml-3 text-white/60 hover:text-white text-xl leading-none">✕</button>
            </div>
            <iframe src={`/modelos/${token}/preview/${previewOpen}`} title={templateNames[previewOpen]} className="flex-1 w-full border-none" />
          </div>
        </div>
      )}

      {/* Modal contrato */}
      {contractOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 p-0 sm:p-4" onClick={() => setContractOpen(false)}>
          <div className="relative bg-white w-full sm:max-w-2xl sm:rounded-2xl overflow-hidden max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 shrink-0">
              <h3 className="text-sm font-bold text-gray-900">Contrato de Serviço</h3>
              <button onClick={() => setContractOpen(false)} className="text-gray-400 hover:text-gray-700 text-xl leading-none">✕</button>
            </div>
            <div className="overflow-y-auto px-5 py-4 text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: contractHtml }} />
            <div className="px-5 py-3.5 border-t border-gray-100 shrink-0">
              <button onClick={() => { setContractOpen(false); setTermsAccepted(true) }} className="w-full bg-brand text-brand-dark font-bold py-2.5 rounded-xl text-sm hover:bg-brand/90 transition-colors">
                Li e aceito o contrato
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="min-h-screen bg-white">
        {/* Banner vermelho */}
        <div className="bg-red-600 text-white text-center py-2.5 px-4 text-sm font-semibold tracking-wide">
          ⏰ Valor promocional por tempo limitado: <strong>{fmt(pricePlano1)}</strong>
        </div>

        {/* Header */}
        <header className="border-b border-white/10 bg-gray-950 sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
            <Image src="/logo.png" alt="TOP SITE" width={120} height={36} className="h-8 w-auto" priority />
            <a href="#checkout" className="text-xs font-semibold bg-brand text-brand-dark px-4 py-1.5 rounded-full hover:bg-brand/90 transition-colors">
              Contratar
            </a>
          </div>
        </header>

        {/* Hero */}
        <section className="bg-gray-950 py-16 sm:py-20 px-4">
          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-brand text-sm font-bold uppercase tracking-widest mb-4">{firstName ? `Criado para você, ${firstName}` : 'Criado especialmente para você'}</p>
              <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-5">
                Seu negócio aparecendo<br className="hidden sm:block" /> no Google — assim:
              </h1>
              <p className="text-gray-400 text-base leading-relaxed mb-8 max-w-md">
                Todo site que entregamos já vem preparado para ser encontrado no Google quando seus clientes pesquisam pelo que você oferece.
              </p>
              <a href="#modelos" className="inline-flex items-center gap-2 bg-brand text-brand-dark font-bold px-6 py-3 rounded-full hover:bg-brand/90 transition-colors text-sm">
                Ver os modelos ↓
              </a>
            </div>
            <GoogleSerpMockup businessName={leadName} />
          </div>
        </section>

        {/* Modelos */}
        <section className="py-16 px-4 bg-white" id="modelos">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-3">
                {firstName ? `Escolha o modelo do seu site, ${firstName}` : 'Escolha o modelo do seu site'}
              </h2>
              <p className="text-gray-500 max-w-lg mx-auto">
                Após escolher, personalizamos tudo com a sua identidade: sua logo, cores, textos e fotos.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start justify-center gap-10 sm:gap-16">
              {(['1', '2'] as const).map((num) => (
                <div key={num} className="flex flex-col items-center gap-4 w-full sm:w-auto">
                  <div className={`relative transition-all duration-200 ${selectedTemplate === num ? 'scale-[1.02]' : ''}`} style={{ width: 220 }}>
                    <div className={`relative rounded-[32px] bg-gray-900 shadow-2xl transition-all duration-200 ${selectedTemplate === num ? 'ring-4 ring-brand ring-offset-4 ring-offset-white' : ''}`} style={{ padding: '10px 8px 14px' }}>
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
                  <div className="text-center flex flex-col items-center gap-2 w-full max-w-[220px]">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Modelo {num} — {templateNames[num]}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleChooseTemplate(num)}
                      className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all ${selectedTemplate === num ? 'bg-brand text-brand-dark shadow-lg shadow-brand/20' : 'bg-gray-900 text-white hover:bg-gray-700'}`}
                    >
                      {selectedTemplate === num ? '✓ Modelo escolhido' : 'Escolher este modelo'}
                    </button>
                    <button type="button" onClick={() => setPreviewOpen(num)} className="text-xs font-semibold text-brand border border-brand/30 px-4 py-1.5 rounded-full hover:bg-brand/5 transition-colors">
                      Ver site completo ↗
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Planos */}
        <section className="py-16 px-4 bg-gray-50" id="checkout" ref={formRef}>
          {/* Seleção de plano */}
          <div className="max-w-4xl mx-auto mb-14">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2">Escolha seu plano</h2>
              <p className="text-gray-500 text-sm max-w-md mx-auto">
                A criação do site é a mesma em todos os planos. A diferença está no que acontece depois.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {planData.map((plan) => {
                const isSelected = selectedPlan === plan.id
                return (
                  <div
                    key={plan.id}
                    onClick={() => handleSelectPlan(plan.id)}
                    className={`relative bg-white rounded-2xl border-2 p-6 cursor-pointer transition-all duration-200 flex flex-col ${
                      isSelected
                        ? 'border-brand shadow-xl shadow-brand/10'
                        : plan.highlight
                          ? 'border-brand/30 shadow-md'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    {plan.badge && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-brand text-brand-dark text-[11px] font-bold px-3 py-1 rounded-full whitespace-nowrap shadow-sm">
                        {plan.badge}
                      </div>
                    )}

                    <div className="mb-4">
                      <p className="font-black text-gray-900 text-[15px] leading-tight">{plan.name}</p>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-gray-900">{plan.price}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{plan.priceNote}</p>
                      {plan.monthly && (
                        <p className="text-sm font-semibold text-brand mt-1.5">+ {plan.monthly} hospedagem</p>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 leading-relaxed mb-4">{plan.description}</p>

                    {plan.features.length > 0 && (
                      <ul className="space-y-2 mb-4 flex-1">
                        {plan.features.map((f) => (
                          <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                            <span className="text-green-500 font-bold shrink-0 mt-0.5 text-base leading-none">✓</span>
                            <span className="leading-snug">{f}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {plan.note && (
                      <p className="text-xs text-gray-400 mb-4">{plan.note}</p>
                    )}

                    <div className="mt-auto">
                      <button
                        type="button"
                        className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all ${
                          isSelected ? 'bg-brand text-brand-dark' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {isSelected ? '✓ Selecionado' : 'Selecionar'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Formulário */}
          <div className="max-w-md mx-auto" id="checkout-form">
            <h2 className="text-xl font-black text-gray-900 mb-1 text-center">Seus dados</h2>
            <p className="text-sm text-gray-500 text-center mb-6">Preencha e vá para o pagamento.</p>

            {/* Resumo do plano selecionado */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-900">{activePlan.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Design exclusivo · personalizado para você</p>
                  {selectedTemplate && (
                    <p className="text-xs text-brand font-semibold mt-1">Modelo {selectedTemplate} — {templateNames[selectedTemplate]}</p>
                  )}
                  {activePlan.monthly && (
                    <p className="text-xs text-gray-500 mt-1">+ {activePlan.monthly} hospedagem (após ativação)</p>
                  )}
                </div>
                <div className="text-right shrink-0 ml-4">
                  <p className="text-2xl font-black text-gray-900">{activePlan.price}</p>
                  <p className="text-xs text-gray-400">{activePlan.priceNote}</p>
                </div>
              </div>
            </div>

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

              {/* Terms */}
              <label className="flex items-start gap-3 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => { setTermsAccepted(e.target.checked); if (e.target.checked) setCheckoutError('') }}
                  className="mt-0.5 accent-brand shrink-0 w-4 h-4"
                />
                <span className="text-xs text-gray-500 leading-relaxed">
                  Li e concordo com os{' '}
                  <Link href="/termos" target="_blank" rel="noopener noreferrer" className="text-brand underline">Termos de Uso</Link>
                  {', '}
                  <Link href="/privacidade" target="_blank" rel="noopener noreferrer" className="text-brand underline">Política de Privacidade</Link>
                  {' e com o '}
                  <button type="button" onClick={() => setContractOpen(true)} className="text-brand underline">Contrato de Serviço</button>.
                </span>
              </label>

              {checkoutError && (
                <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-4 py-2">{checkoutError}</p>
              )}

              <button
                type="submit"
                disabled={checkoutPending || !termsAccepted}
                className="w-full bg-brand text-brand-dark font-bold py-4 rounded-xl text-sm hover:bg-brand/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {checkoutPending ? 'Aguarde...' : `Pagar ${activePlan.price} →`}
              </button>
              <p className="text-xs text-gray-400 text-center">
                Pix, boleto ou cartão. Página segura processada pelo Asaas.
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
