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
  title: 'Site Institucional para Empresas — TOP SITE',
  description:
    'Site institucional profissional por R$197. Apresente sua empresa, serviços e contato de forma completa no Google. Entrega em 7 dias úteis.',
  keywords:
    'site institucional, site para empresa, site institucional profissional, site para negócio, site completo para empresa, criar site institucional',
  alternates: {
    canonical: `${BASE_URL}/site-institucional`,
  },
  openGraph: {
    type: 'website',
    url: `${BASE_URL}/site-institucional`,
    title: 'Site Institucional para Empresas — TOP SITE',
    description:
      'Site institucional profissional por R$197. Apresente sua empresa com credibilidade e apareça no Google.',
    siteName: 'TOP SITE',
    locale: 'pt_BR',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'TOP SITE — Sites profissionais para o seu negócio' }],
  },
}

/* ─── JSON-LD ────────────────────────────────────────────────────────────── */

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Site Institucional',
  description:
    'Criamos sites institucionais para empresas de qualquer segmento: design personalizado, múltiplas páginas, SEO técnico e entrega em 7 dias úteis por R$197.',
  provider: {
    '@type': 'Organization',
    name: 'TopSite',
    url: BASE_URL,
  },
  areaServed: {
    '@type': 'Country',
    name: 'Brazil',
  },
  offers: {
    '@type': 'Offer',
    price: '197',
    priceCurrency: 'BRL',
    availability: 'https://schema.org/InStock',
  },
}

/* ─── Icons ──────────────────────────────────────────────────────────────── */

function WAIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 shrink-0">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  )
}

function WAIconLg() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-white">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  )
}

/* ─── Sub-components ─────────────────────────────────────────────────────── */

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest mb-4"
      style={{
        background: 'rgba(250,204,21,0.08)',
        color: '#facc15',
        border: '1px solid rgba(250,204,21,0.12)',
      }}
    >
      {children}
    </span>
  )
}

function WAButton({ size = 'md' }: { size?: 'md' | 'lg' }) {
  const sizeClass =
    size === 'lg'
      ? 'px-10 py-5 text-base font-bold'
      : 'px-8 py-4 text-sm font-bold'
  return (
    <a
      href={wa()}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 rounded-xl text-black transition-opacity hover:opacity-90 ${sizeClass}`}
      style={{
        background: 'linear-gradient(135deg, #facc15, #f59e0b)',
        boxShadow: '0 4px 24px rgba(250,204,21,0.3)',
      }}
    >
      <WAIcon />
      Falar no WhatsApp
    </a>
  )
}

/* ─── Data ───────────────────────────────────────────────────────────────── */

const PAGES_INCLUDED = [
  {
    icon: '🏠',
    title: 'Página Inicial (Home)',
    desc: 'Visão geral do negócio, principais serviços e call-to-action para converter visitantes em contatos.',
  },
  {
    icon: '🏢',
    title: 'Sobre a Empresa',
    desc: 'História, missão, valores, equipe e diferenciais. O que gera credibilidade e humaniza a sua marca.',
  },
  {
    icon: '⚙️',
    title: 'Serviços',
    desc: 'Lista detalhada de tudo que você oferece, com descrição e benefícios para cada serviço.',
  },
  {
    icon: '📞',
    title: 'Contato',
    desc: 'Formulário de contato, botão de WhatsApp, endereço completo e mapa de localização.',
  },
  {
    icon: '🖼️',
    title: 'Galeria / Portfólio',
    desc: 'Fotos dos trabalhos realizados, projetos concluídos ou ambiente da empresa — quando aplicável ao segmento.',
  },
]

const SEGMENTS = [
  {
    title: 'Clínicas e consultórios',
    desc: 'Médicos, dentistas, psicólogos, fisioterapeutas e outros profissionais da saúde que precisam transmitir confiança e facilitar o agendamento.',
  },
  {
    title: 'Escritórios e consultorias',
    desc: 'Advogados, contadores, arquitetos, engenheiros e consultores que precisam de um site que transmita autoridade e credibilidade.',
  },
  {
    title: 'Prestadores de serviço',
    desc: 'Construtoras, empresas de reforma, instalações elétricas, hidráulicas, manutenções em geral — quem precisa mostrar portfólio e receber orçamentos.',
  },
  {
    title: 'Pequenos comércios',
    desc: 'Lojas, restaurantes, estúdios, academias e outros estabelecimentos que querem ampliar a presença digital além do Google Meu Negócio.',
  },
]

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default function SiteInstitucionalPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div
        className="min-h-screen text-white antialiased"
        style={{ background: '#0a0a0a' }}
      >
        <MarketingHeader />

        <main className="pt-20">

          {/* ─── HERO ──────────────────────────────────────────────────────── */}
          <section
            className="relative py-24 overflow-hidden"
            style={{ background: '#030712' }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(250,204,21,0.07) 0%, transparent 60%)',
              }}
            />

            <div className="relative max-w-4xl mx-auto px-4 sm:px-8 text-center">
              <Badge>Site Institucional</Badge>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
                Site Institucional
                <span
                  className="block mt-1"
                  style={{
                    background: 'linear-gradient(135deg, #facc15, #f59e0b)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  para sua Empresa
                </span>
              </h1>

              <p className="text-lg text-white/70 leading-relaxed max-w-2xl mx-auto mb-10">
                Um site institucional é a presença digital completa da sua empresa:
                apresenta quem você é, o que oferece e como entrar em contato —
                tudo organizado para converter visitantes em clientes.
              </p>

              <div className="flex justify-center mb-10">
                <div
                  className="inline-flex flex-wrap items-center justify-center gap-3 px-6 py-3 rounded-2xl"
                  style={{
                    background: 'rgba(250,204,21,0.08)',
                    border: '1px solid rgba(250,204,21,0.18)',
                  }}
                >
                  <span className="text-3xl font-black" style={{ color: '#facc15' }}>
                    R$197
                  </span>
                  <span
                    className="text-xs border-l pl-3"
                    style={{
                      color: 'rgba(255,255,255,0.45)',
                      borderColor: 'rgba(255,255,255,0.1)',
                    }}
                  >
                    pagamento único · hospedagem a partir de R$19/mês
                  </span>
                </div>
              </div>

              <WAButton size="lg" />

              <p className="mt-4 text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Atendimento pelo WhatsApp · Sem compromisso
              </p>
            </div>
          </section>

          {/* ─── O QUE É ──────────────────────────────────────────────────── */}
          <section className="py-20" style={{ background: '#0d0d0d' }}>
            <div className="max-w-5xl mx-auto px-4 sm:px-8">
              <div className="text-center mb-12">
                <Badge>Entenda a diferença</Badge>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                  O que é um site
                  <span
                    className="block"
                    style={{
                      background: 'linear-gradient(135deg, #facc15, #f59e0b)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    institucional?
                  </span>
                </h2>
              </div>

              <div
                className="max-w-3xl mx-auto p-8 sm:p-10 rounded-2xl text-center"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.05)',
                }}
              >
                <p className="text-white/70 text-base sm:text-lg leading-relaxed">
                  O site institucional é diferente de uma landing page ou loja virtual.
                  Ele é a{' '}
                  <strong className="text-white">sede digital da sua empresa</strong>,
                  com múltiplas páginas organizadas para diferentes públicos e objetivos.
                  Enquanto uma landing page foca em uma única ação, o site institucional
                  conta a história completa do seu negócio — gera confiança, aparece no
                  Google para diferentes buscas e funciona como{' '}
                  <strong className="text-white">
                    cartão de visitas 24 horas por dia
                  </strong>
                  , todos os dias do ano.
                </p>
              </div>
            </div>
          </section>

          {/* ─── PÁGINAS INCLUÍDAS ──────────────────────────────────────────── */}
          <section className="py-20" style={{ background: '#0a0a0a' }}>
            <div className="max-w-5xl mx-auto px-4 sm:px-8">
              <div className="text-center mb-14">
                <Badge>Estrutura completa</Badge>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                  Páginas incluídas no
                  <span
                    className="block"
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
                <p className="text-white/50 mt-4 text-sm max-w-lg mx-auto">
                  Cada página tem um papel específico na jornada do visitante até o
                  contato com a sua empresa.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {PAGES_INCLUDED.map((page, i) => (
                  <div
                    key={i}
                    className="p-6 rounded-2xl"
                    style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.05)',
                    }}
                  >
                    <div className="text-3xl mb-4">{page.icon}</div>
                    <h3 className="font-semibold text-white mb-2">{page.title}</h3>
                    <p className="text-sm text-white/50 leading-relaxed">{page.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ─── PARA QUEM É IDEAL ──────────────────────────────────────────── */}
          <section className="py-20" style={{ background: '#0d0d0d' }}>
            <div className="max-w-5xl mx-auto px-4 sm:px-8">
              <div className="text-center mb-14">
                <Badge>Para quem é ideal</Badge>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                  Segmentos que mais
                  <span
                    className="block"
                    style={{
                      background: 'linear-gradient(135deg, #facc15, #f59e0b)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    se beneficiam
                  </span>
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {SEGMENTS.map((seg, i) => (
                  <div
                    key={i}
                    className="flex gap-4 p-6 rounded-2xl"
                    style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.05)',
                    }}
                  >
                    <div
                      className="mt-1 w-2 h-2 rounded-full shrink-0"
                      style={{ background: '#facc15' }}
                    />
                    <div>
                      <h3 className="font-semibold text-white mb-1">{seg.title}</h3>
                      <p className="text-sm text-white/50 leading-relaxed">{seg.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ─── COMPARATIVO SITE INSTITUCIONAL VS LANDING PAGE ─────────────── */}
          <section className="py-20" style={{ background: '#0a0a0a' }}>
            <div className="max-w-5xl mx-auto px-4 sm:px-8">
              <div className="text-center mb-14">
                <Badge>Quando escolher cada um</Badge>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                  Site institucional
                  <span
                    className="block"
                    style={{
                      background: 'linear-gradient(135deg, #facc15, #f59e0b)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    vs. landing page
                  </span>
                </h2>
                <p className="text-white/50 mt-4 text-sm max-w-lg mx-auto">
                  Ambos são poderosos — mas cada um tem o momento certo de uso.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Site institucional */}
                <div
                  className="p-8 rounded-2xl relative"
                  style={{
                    background: 'rgba(250,204,21,0.04)',
                    border: '1px solid rgba(250,204,21,0.15)',
                  }}
                >
                  <div
                    className="absolute top-4 right-4 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest"
                    style={{ background: 'rgba(250,204,21,0.15)', color: '#facc15' }}
                  >
                    Esta página
                  </div>

                  <h3 className="text-xl font-bold text-white mb-5">
                    Site Institucional
                  </h3>

                  <ul className="space-y-3">
                    {[
                      'Empresa com mais de um serviço ou produto',
                      'Público variado com diferentes perfis',
                      'Precisa transmitir credibilidade institucional',
                      'Quer aparecer no Google para várias buscas diferentes',
                      'Tem histórico, equipe ou portfólio para mostrar',
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                        <span
                          className="mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold"
                          style={{ background: 'rgba(250,204,21,0.15)', color: '#facc15' }}
                        >
                          ✓
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Landing page */}
                <div
                  className="p-8 rounded-2xl"
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  <h3 className="text-xl font-bold text-white mb-5">Landing Page</h3>

                  <ul className="space-y-3">
                    {[
                      'Campanha de anúncio com objetivo único',
                      'Produto ou serviço específico para vender',
                      'Anúncios pagos (Meta Ads, Google Ads)',
                      'Meta de conversão clara e única',
                      'Funil de vendas focado em uma ação',
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-white/60">
                        <span className="mt-0.5 text-white/25 shrink-0">—</span>
                        {item}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6 pt-6 border-t border-white/5">
                    <Link
                      href="/landing-page"
                      className="text-sm transition-colors hover:opacity-80"
                      style={{ color: '#facc15' }}
                    >
                      Saiba mais sobre Landing Pages →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ─── CTA FINAL ──────────────────────────────────────────────────── */}
          <section className="py-24 overflow-hidden" style={{ background: '#0d0d0d' }}>
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(250,204,21,0.04) 0%, transparent 60%)',
              }}
            />

            <div className="relative max-w-3xl mx-auto px-4 sm:px-8 text-center">
              <Badge>Comece agora</Badge>

              <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4">
                Leve sua empresa para
                <span
                  className="block"
                  style={{
                    background: 'linear-gradient(135deg, #facc15, #f59e0b)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  o digital com credibilidade
                </span>
              </h2>

              <p className="text-white/60 mb-10">
                Atendimento pelo WhatsApp. Sem compromisso.
              </p>

              <WAButton size="lg" />

              <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-white/40">
                <span>R$197 pagamento único</span>
                <span className="w-px h-4 bg-white/10" />
                <span>Entrega em 7 dias úteis</span>
                <span className="w-px h-4 bg-white/10" />
                <span>SEO incluso</span>
              </div>
            </div>
          </section>

        </main>

        <MarketingFooter />
      </div>

      {/* ─── Botão flutuante WhatsApp ─────────────────────────────────────── */}
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
        <WAIconLg />
        <span className="sr-only">Falar no WhatsApp</span>
      </a>
    </>
  )
}
