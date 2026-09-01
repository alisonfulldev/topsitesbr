'use client'

import { useState, useTransition, useRef } from 'react'
import Image from 'next/image'
import { checkoutAction } from '../actions'
import { validateDocument, formatDocument } from '@/lib/cpf'

interface Props {
  token: string
  leadName: string
  template1Name: string
  template2Name: string
  alreadyPaid: boolean
}

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
    cta: 'Quero esta opção',
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
    cta: 'Quero esta opção',
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
    cta: 'Quero esta opção',
  },
]

export default function LeadPage({ token, leadName, template1Name, template2Name, alreadyPaid }: Props) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [name, setName] = useState(leadName)
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [document, setDocument] = useState('')
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()
  const [previewOpen, setPreviewOpen] = useState<'1' | '2' | null>(null)
  const formRef = useRef<HTMLElement>(null)

  const templateNames = { '1': template1Name, '2': template2Name }

  function choosePlan(planId: string) {
    setSelectedPlan(planId)
    setError('')
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
  }

  function handleDocumentChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 14)
    setDocument(formatDocument(digits))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedPlan) { setError('Selecione um plano acima.'); return }
    if (!name.trim()) { setError('Informe seu nome.'); return }
    if (!email.trim() || !email.includes('@')) { setError('Informe um e-mail válido.'); return }

    const docClean = document.replace(/\D/g, '')
    if (!validateDocument(docClean)) {
      setError('CPF ou CNPJ inválido. Verifique os dígitos informados.')
      return
    }

    setError('')
    startTransition(async () => {
      const result = await checkoutAction(token, selectedPlan, name, email, phone, document)
      if (result.error) {
        setError(result.error)
      } else if (result.paymentUrl) {
        window.location.href = result.paymentUrl
      }
    })
  }

  if (alreadyPaid) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Site já adquirido!</h1>
          <p className="text-gray-500">Este site já foi contratado. Entraremos em contato em breve para colocá-lo no ar.</p>
        </div>
      </main>
    )
  }

  return (
    <>
      {/* ── Modal de preview completo ─────────────────────────────────────── */}
      {previewOpen !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setPreviewOpen(null)}
        >
          <div
            className="relative flex flex-col w-full h-full sm:w-96 sm:h-[88vh] sm:rounded-3xl overflow-hidden bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top bar */}
            <div className="shrink-0 flex items-center justify-between px-4 py-2.5 bg-gray-900">
              <span className="text-xs font-semibold text-white/80 truncate max-w-[240px]">
                {templateNames[previewOpen]}
              </span>
              <button
                onClick={() => setPreviewOpen(null)}
                className="shrink-0 ml-3 text-white/60 hover:text-white transition-colors text-xl leading-none"
                aria-label="Fechar"
              >
                ✕
              </button>
            </div>
            {/* Iframe — full scroll */}
            <iframe
              src={`/modelos/${token}/preview/${previewOpen}`}
              title={templateNames[previewOpen]}
              className="flex-1 w-full border-none"
            />
          </div>
        </div>
      )}

      <main className="min-h-screen bg-white">
        {/* Header */}
        <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
            <Image src="/logo.png" alt="TOP SITE" width={120} height={36} className="h-8 w-auto" priority />
            <a
              href="#checkout"
              className="text-xs font-semibold bg-brand text-brand-dark px-4 py-1.5 rounded-full hover:bg-brand/90 transition-colors"
            >
              Contratar
            </a>
          </div>
        </header>

        {/* Hero */}
        <section className="py-14 px-4 text-center bg-gradient-to-b from-gray-50 to-white">
          <p className="text-sm font-semibold text-brand uppercase tracking-widest mb-3">Seu site está pronto</p>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight mb-4">
            {leadName.split(' ')[0]}, veja os modelos<br className="hidden sm:block" /> criados para o seu negócio
          </h1>
          <p className="text-gray-500 text-base max-w-xl mx-auto mb-5">
            Criamos dois modelos de site pensados para o seu segmento de negócio. Após a contratação, personalizamos tudo com a sua identidade — logo, cores, textos e fotos — do jeito que você quiser.
          </p>
          <span className="inline-flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-4 py-2 rounded-full">
            ⚡ Estes são modelos de demonstração — o site final é 100% personalizado com a sua marca.
          </span>
        </section>

        {/* Phone mockups */}
        <section className="py-12 px-4">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center sm:items-start justify-center gap-10 sm:gap-16">
            {(['1', '2'] as const).map((num) => (
              <div key={num} className="flex flex-col items-center gap-4">
                {/* Phone frame */}
                <div className="relative" style={{ width: 220 }}>
                  <div
                    className="relative rounded-[32px] bg-gray-900 shadow-2xl"
                    style={{ padding: '10px 8px 14px', width: 220 }}
                  >
                    {/* Notch */}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-5 bg-gray-900 rounded-b-xl z-10" />
                    {/* Screen */}
                    <div
                      className="rounded-[24px] overflow-hidden bg-white relative"
                      style={{ width: 204, height: 432 }}
                    >
                      <iframe
                        src={`/modelos/${token}/preview/${num}`}
                        title={`Template ${num}`}
                        scrolling="no"
                        style={{
                          width: 390,
                          height: 844,
                          border: 'none',
                          transformOrigin: 'top left',
                          transform: `scale(${204 / 390})`,
                          pointerEvents: 'none',
                        }}
                      />
                    </div>
                  </div>
                  {/* Side buttons */}
                  <div className="absolute right-0 top-20 w-1 h-12 bg-gray-700 rounded-r-full" />
                  <div className="absolute left-0 top-16 w-1 h-8 bg-gray-700 rounded-l-full" />
                  <div className="absolute left-0 top-28 w-1 h-8 bg-gray-700 rounded-l-full" />
                </div>

                {/* Label + Ver completo */}
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

        {/* Pricing */}
        <section className="py-14 px-4 bg-gray-50" id="planos">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2">Como você quer ter o seu site?</h2>
              <p className="text-gray-500 max-w-lg mx-auto">
                O site custa <strong className="text-gray-700">R$ 97 uma única vez</strong>. A hospedagem mensal é opcional — você escolhe se quer que a gente cuide de tudo ou se prefere hospedar por conta própria.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {PLANS.map((plan) => (
                <div
                  key={plan.id}
                  className={`relative rounded-2xl p-6 flex flex-col gap-4 transition-all cursor-pointer border-2 ${
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
                        <span className="text-brand mt-0.5 shrink-0">✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); choosePlan(plan.id) }}
                    className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                      selectedPlan === plan.id
                        ? 'bg-brand text-brand-dark'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {selectedPlan === plan.id ? '✓ Selecionado' : 'Quero esta opção'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Checkout form */}
        <section className="py-14 px-4" id="checkout" ref={formRef}>
          <div className="max-w-md mx-auto">
            <h2 className="text-xl font-black text-gray-900 mb-1 text-center">Finalizar contratação</h2>
            <p className="text-sm text-gray-500 text-center mb-8">
              {selectedPlan
                ? `Plano ${PLANS.find((p) => p.id === selectedPlan)?.name} selecionado — preencha seus dados abaixo`
                : 'Selecione um plano acima e preencha seus dados.'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Seu nome <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Nome completo"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand focus:bg-white transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-mail <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="seu@email.com"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand focus:bg-white transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand focus:bg-white transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CPF ou CNPJ <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={document}
                  onChange={handleDocumentChange}
                  required
                  placeholder="000.000.000-00"
                  maxLength={18}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand focus:bg-white transition-colors"
                />
                <p className="text-[11px] text-gray-400 mt-1">Necessário para emissão do comprovante de pagamento.</p>
              </div>

              {error && (
                <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-4 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={pending || !selectedPlan}
                className="w-full bg-brand text-brand-dark font-bold py-4 rounded-xl text-sm hover:bg-brand/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {pending ? 'Aguarde...' : 'Ir para o pagamento →'}
              </button>

              <p className="text-xs text-gray-400 text-center">
                Você será redirecionado para a página segura de pagamento.
                Pix, boleto ou cartão de crédito.
              </p>
            </form>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-100 py-8 px-4">
          <div className="max-w-5xl mx-auto text-center text-xs text-gray-400">
            <Image src="/logo.png" alt="TOP SITE" width={100} height={30} className="h-6 w-auto mx-auto mb-2 opacity-50" />
            <p>Sites profissionais para pequenos negócios.</p>
          </div>
        </footer>
      </main>
    </>
  )
}
