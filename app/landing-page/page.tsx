import type { Metadata } from 'next'
import Link from 'next/link'
import { MarketingHeader } from '@/components/marketing/MarketingHeader'
import { MarketingFooter } from '@/components/marketing/MarketingFooter'

/* ─── Config ─────────────────────────────────────────────────────────────── */

const BASE_URL = 'https://topsitebr.com.br'
const WA_NUMBER = '5518996742364'
const MSG = 'Olá! Quero criar meu site profissional por R$197. Como funciona?'
function wa() {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(MSG)}`
}

/* ─── SEO ────────────────────────────────────────────────────────────────── */

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: 'Landing Page Profissional por R$197 — TOP SITE',
  description:
    'Landing page que converte por R$197. Design focado em conversão, SEO e integração com WhatsApp. Pronta em 7 dias úteis. Atendemos todo o Brasil.',
  keywords:
    'landing page profissional, página de vendas, criar landing page, landing page que converte, landing page para anúncios, landing page barata, landing page R$197',
  authors: [{ name: 'TOP SITE' }],
  alternates: { canonical: `${BASE_URL}/landing-page` },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  openGraph: {
    type: 'website',
    url: `${BASE_URL}/landing-page`,
    title: 'Landing Page Profissional por R$197 — TOP SITE',
    description:
      'Landing page que converte por R$197. Design focado em conversão, SEO e integração com WhatsApp. Pronta em 7 dias úteis.',
    siteName: 'TOP SITE',
    locale: 'pt_BR',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'TOP SITE — Sites profissionais para o seu negócio' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og-image.png'],
    title: 'Landing Page Profissional por R$197 — TOP SITE',
    description:
      'Landing page que converte por R$197. Design focado em conversão, SEO e integração com WhatsApp. Pronta em 7 dias úteis.',
  },
}

/* ─── JSON-LD ────────────────────────────────────────────────────────────── */

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Landing Page Profissional',
  description:
    'Landing page focada em conversão por R$197. Design estratégico, SEO e integração com WhatsApp. Pronta em 7 dias úteis.',
  provider: {
    '@type': 'Organization',
    name: 'TOP SITE',
    url: BASE_URL,
  },
  offers: {
    '@type': 'Offer',
    price: '197',
    priceCurrency: 'BRL',
    availability: 'https://schema.org/InStock',
  },
  areaServed: { '@type': 'Country', name: 'Brazil' },
  url: `${BASE_URL}/landing-page`,
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Posso usar a landing page com meus anúncios do Instagram?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sim! Nossa landing page é otimizada para receber tráfego de anúncios pagos. O carregamento rápido reduz o custo por clique e aumenta sua taxa de conversão.',
      },
    },
    {
      '@type': 'Question',
      name: 'A landing page aparece no Google?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sim. Mesmo com foco em conversão, incluímos SEO básico para que sua página também receba tráfego orgânico, além dos anúncios.',
      },
    },
    {
      '@type': 'Question',
      name: 'Posso ter uma landing page e um site institucional?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sim, e é muito comum. O site institucional é sua presença permanente. A landing page é criada para campanhas específicas.',
      },
    },
  ],
}

/* ─── Icons ──────────────────────────────────────────────────────────────── */

function WAIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 shrink-0">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4"
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  )
}

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default function LandingPagePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div className="min-h-screen text-white antialiased" style={{ background: '#0a0a0a' }}>
        <MarketingHeader />

        <main className="pt-20">

          {/* ─── HERO ────────────────────────────────────────────────────── */}
          <section className="relative min-h-[88vh] flex items-center overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0">
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'radial-gradient(ellipse 60% 50% at 30% 20%, rgba(250,204,21,0.06) 0%, transparent 50%), radial-gradient(ellipse 40% 40% at 70% 80%, rgba(180,83,9,0.04) 0%, transparent 50%)',
                }}
              />
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage:
                    'radial-gradient(circle, rgba(255,255,255,0.015) 1px, transparent 1px)',
                  backgroundSize: '40px 40px',
                }}
              />
            </div>

            <div className="relative max-w-4xl mx-auto px-4 sm:px-8 w-full py-24 text-center">
              {/* Badge */}
              <span
                className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest mb-6"
                style={{
                  background: 'rgba(250,204,21,0.08)',
                  color: '#facc15',
                  border: '1px solid rgba(250,204,21,0.12)',
                }}
              >
                Landing Page
              </span>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] mb-6">
                Landing Page que{' '}
                <span
                  style={{
                    background: 'linear-gradient(135deg, #facc15, #f59e0b, #d97706)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  Converte
                </span>
              </h1>

              <p className="text-lg text-white/70 leading-relaxed mb-10 max-w-2xl mx-auto">
                Uma landing page é uma página feita com um único objetivo: converter visitantes em
                clientes. Cada elemento — o título, a imagem, o formulário e o botão — é pensado
                para gerar resultado.
              </p>

              {/* Price */}
              <div className="flex justify-center mb-8">
                <div
                  className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl"
                  style={{
                    background: 'rgba(250,204,21,0.08)',
                    border: '1px solid rgba(250,204,21,0.18)',
                  }}
                >
                  <span className="text-sm text-white/50">Sua landing page por apenas</span>
                  <span className="text-2xl font-black" style={{ color: '#facc15' }}>
                    R$ 197
                  </span>
                  <span className="text-xs text-white/35 border-l border-white/10 pl-3">
                    pagamento único
                  </span>
                </div>
              </div>

              <a
                href={wa()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-sm font-bold text-black"
                style={{
                  background: 'linear-gradient(135deg, #facc15, #f59e0b)',
                  boxShadow: '0 4px 24px rgba(250,204,21,0.3)',
                }}
              >
                <WAIcon />
                Falar no WhatsApp
              </a>
            </div>
          </section>

          {/* ─── QUANDO USAR ──────────────────────────────────────────────── */}
          <section className="relative py-24" style={{ background: '#0d0d0d' }}>
            <div className="max-w-6xl mx-auto px-4 sm:px-8">
              <div className="text-center mb-16">
                <span
                  className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest mb-4"
                  style={{
                    background: 'rgba(250,204,21,0.08)',
                    color: '#facc15',
                    border: '1px solid rgba(250,204,21,0.12)',
                  }}
                >
                  Casos de Uso
                </span>
                <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
                  Quando usar uma{' '}
                  <span
                    style={{
                      background: 'linear-gradient(135deg, #facc15, #f59e0b)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    landing page
                  </span>
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    number: '01',
                    title: 'Anúncios pagos (Google/Facebook/Instagram)',
                    desc: 'Quando você investe em tráfego pago, mandar o visitante para sua home dispersa a atenção. Uma landing page foca em converter aquele visitante específico no que você está anunciando.',
                  },
                  {
                    number: '02',
                    title: 'Lançamento de produto ou serviço',
                    desc: 'Novo serviço, promoção especial ou pacote específico? A landing page destaca exatamente aquela oferta, sem distrações.',
                  },
                  {
                    number: '03',
                    title: 'Captura de leads',
                    desc: 'Formulários simples para capturar nome e WhatsApp de interessados. Você acumula contatos qualificados para abordar depois.',
                  },
                  {
                    number: '04',
                    title: 'Eventos e webinars',
                    desc: 'Inscrições para cursos, workshops, consultas gratuitas ou eventos. Uma página específica para cada evento.',
                  },
                ].map((item) => (
                  <div
                    key={item.number}
                    className="group p-8 rounded-2xl transition-all duration-300 hover:-translate-y-1"
                    style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.05)',
                    }}
                  >
                    <div
                      className="text-xs font-bold mb-4 tabular-nums"
                      style={{ color: 'rgba(250,204,21,0.5)' }}
                    >
                      {item.number}
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-3">{item.title}</h3>
                    <p className="text-sm text-white/60 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ─── O QUE INCLUI ─────────────────────────────────────────────── */}
          <section className="relative py-24" style={{ background: '#0a0a0a' }}>
            <div className="max-w-5xl mx-auto px-4 sm:px-8">
              <div className="text-center mb-16">
                <span
                  className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest mb-4"
                  style={{
                    background: 'rgba(250,204,21,0.08)',
                    color: '#facc15',
                    border: '1px solid rgba(250,204,21,0.12)',
                  }}
                >
                  Entregáveis
                </span>
                <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
                  O que inclui nossa{' '}
                  <span
                    style={{
                      background: 'linear-gradient(135deg, #facc15, #f59e0b)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    landing page
                  </span>
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[
                  {
                    title: 'Headline poderosa',
                    desc: 'Título que comunica o valor da sua oferta em segundos',
                  },
                  {
                    title: 'CTA acima da dobra',
                    desc: 'O botão de ação visível antes de rolar a página',
                  },
                  {
                    title: 'Prova social',
                    desc: 'Depoimentos, avaliações e resultados reais que eliminam a hesitação',
                  },
                  {
                    title: 'Seção de benefícios',
                    desc: 'O que o cliente ganha, não o que você oferece',
                  },
                  {
                    title: 'Formulário ou botão WhatsApp',
                    desc: 'Captura de lead simples e sem fricção',
                  },
                  {
                    title: 'Velocidade e SEO',
                    desc: 'Carregamento rápido para não perder o visitante e para aparecer no Google',
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="flex items-start gap-4 p-6 rounded-2xl"
                    style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.04)',
                    }}
                  >
                    <span
                      className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-0.5"
                      style={{ background: 'rgba(250,204,21,0.1)' }}
                    >
                      <CheckIcon />
                    </span>
                    <div>
                      <h3 className="font-semibold text-white mb-1 text-sm">{item.title}</h3>
                      <p className="text-xs text-white/55 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ─── LANDING PAGE VS INSTITUCIONAL ────────────────────────────── */}
          <section className="relative py-24" style={{ background: '#0d0d0d' }}>
            <div className="max-w-5xl mx-auto px-4 sm:px-8">
              <div className="text-center mb-16">
                <span
                  className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest mb-4"
                  style={{
                    background: 'rgba(250,204,21,0.08)',
                    color: '#facc15',
                    border: '1px solid rgba(250,204,21,0.12)',
                  }}
                >
                  Comparativo
                </span>
                <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
                  Landing page vs.{' '}
                  <span
                    style={{
                      background: 'linear-gradient(135deg, #facc15, #f59e0b)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    site institucional
                  </span>
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Landing page */}
                <div
                  className="p-8 rounded-2xl"
                  style={{
                    background: 'rgba(250,204,21,0.04)',
                    border: '1px solid rgba(250,204,21,0.12)',
                  }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <span
                      className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest"
                      style={{ background: 'rgba(250,204,21,0.12)', color: '#facc15' }}
                    >
                      Landing Page
                    </span>
                  </div>
                  <p
                    className="text-sm font-semibold uppercase tracking-wider mb-4"
                    style={{ color: 'rgba(255,255,255,0.4)' }}
                  >
                    Use quando:
                  </p>
                  <ul className="space-y-3">
                    {[
                      'Tiver uma campanha específica',
                      'Um produto ou serviço único para promover',
                      'Estiver rodando anúncios pagos',
                      'Precisar de uma taxa de conversão alta em uma única ação',
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-3 text-sm text-white/70">
                        <span className="mt-0.5" style={{ color: '#facc15' }}>
                          ✓
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Institucional */}
                <div
                  className="p-8 rounded-2xl"
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <span
                      className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest"
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        color: 'rgba(255,255,255,0.5)',
                      }}
                    >
                      Site Institucional
                    </span>
                  </div>
                  <p
                    className="text-sm font-semibold uppercase tracking-wider mb-4"
                    style={{ color: 'rgba(255,255,255,0.4)' }}
                  >
                    Use quando:
                  </p>
                  <ul className="space-y-3">
                    {[
                      'Quiser uma presença digital completa',
                      'Tiver vários serviços',
                      'Precisar de credibilidade institucional',
                      'Quiser aparecer no Google para múltiplas buscas',
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-3 text-sm text-white/60">
                        <span className="mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
                          ✓
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8 pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <Link
                      href="/site-institucional"
                      className="text-sm font-medium transition-colors hover:opacity-80"
                      style={{ color: '#facc15' }}
                    >
                      Ver Site Institucional →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ─── FAQ ──────────────────────────────────────────────────────── */}
          <section className="relative py-24" style={{ background: '#0a0a0a' }}>
            <div className="max-w-3xl mx-auto px-4 sm:px-8">
              <div className="text-center mb-16">
                <span
                  className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest mb-4"
                  style={{
                    background: 'rgba(250,204,21,0.08)',
                    color: '#facc15',
                    border: '1px solid rgba(250,204,21,0.12)',
                  }}
                >
                  Dúvidas
                </span>
                <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
                  Perguntas{' '}
                  <span
                    style={{
                      background: 'linear-gradient(135deg, #facc15, #f59e0b)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    frequentes
                  </span>
                </h2>
              </div>

              <div className="space-y-3">
                {[
                  {
                    q: 'Posso usar a landing page com meus anúncios do Instagram?',
                    a: 'Sim! Nossa landing page é otimizada para receber tráfego de anúncios pagos. O carregamento rápido reduz o custo por clique e aumenta sua taxa de conversão.',
                  },
                  {
                    q: 'A landing page aparece no Google?',
                    a: 'Sim. Mesmo com foco em conversão, incluímos SEO básico para que sua página também receba tráfego orgânico, além dos anúncios.',
                  },
                  {
                    q: 'Posso ter uma landing page e um site institucional?',
                    a: 'Sim, e é muito comum. O site institucional é sua presença permanente. A landing page é criada para campanhas específicas.',
                  },
                ].map((faq, i) => (
                  <details
                    key={i}
                    className="group rounded-2xl transition-all duration-300"
                    style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.04)',
                    }}
                  >
                    <summary className="flex items-center justify-between cursor-pointer list-none p-6">
                      <span className="font-medium text-white/80 text-sm">{faq.q}</span>
                      <span className="text-white/45 text-sm transition-transform duration-300 group-open:rotate-180 ml-4 flex-shrink-0">
                        ▾
                      </span>
                    </summary>
                    <div className="px-6 pb-6">
                      <p className="text-sm text-white/55 leading-relaxed">{faq.a}</p>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* ─── CTA FINAL ────────────────────────────────────────────────── */}
          <section className="relative py-32 overflow-hidden" style={{ background: '#080808' }}>
            <div
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(250,204,21,0.04) 0%, transparent 60%)',
              }}
            />
            <div className="relative max-w-3xl mx-auto px-4 sm:px-8 text-center">
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
                Sua landing page em{' '}
                <span
                  style={{
                    background: 'linear-gradient(135deg, #facc15, #f59e0b)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  7 dias úteis
                </span>
              </h2>
              <p className="text-white/65 text-lg mb-10">
                Atendimento rápido pelo WhatsApp. Sem compromisso.
              </p>

              <a
                href={wa()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-sm font-bold text-black"
                style={{
                  background: 'linear-gradient(135deg, #facc15, #f59e0b)',
                  boxShadow: '0 4px 24px rgba(250,204,21,0.3)',
                }}
              >
                <WAIcon />
                Falar no WhatsApp
              </a>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-white/45">
                <span>✓ Pronta em 7 dias úteis</span>
                <span className="w-px h-4 bg-white/10" />
                <span>✓ R$197 pagamento único</span>
                <span className="w-px h-4 bg-white/10" />
                <span>✓ Sem compromisso</span>
              </div>
            </div>
          </section>

        </main>

        <MarketingFooter />
      </div>

      {/* Botão flutuante WhatsApp */}
      <a
        href={wa()}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Falar no WhatsApp"
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-2xl"
        style={{ background: '#25d366' }}
      >
        <span
          className="absolute inset-0 rounded-full animate-ping"
          style={{ background: 'rgba(37,211,102,0.4)' }}
        />
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-7 h-7 text-white relative z-10"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
        <span className="sr-only">Falar no WhatsApp</span>
      </a>
    </>
  )
}
