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
  title: 'Criação de Site Profissional por R$197 — TOP SITE',
  description:
    'Criamos seu site profissional em 7 dias úteis por R$197. Design exclusivo, SEO incluso e responsivo. Atendemos todo o Brasil. Fale no WhatsApp.',
  keywords:
    'criação de site profissional, criar site, site profissional por R$197, site barato profissional, site personalizado, desenvolvimento de site, site com SEO',
  alternates: {
    canonical: `${BASE_URL}/criacao-de-sites`,
  },
  openGraph: {
    type: 'website',
    url: `${BASE_URL}/criacao-de-sites`,
    title: 'Criação de Site Profissional por R$197 — TOP SITE',
    description:
      'Criamos seu site profissional em 7 dias úteis por R$197. Design exclusivo, SEO incluso e responsivo.',
    siteName: 'TOP SITE',
    locale: 'pt_BR',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'TOP SITE — Sites profissionais para o seu negócio' }],
  },
}

/* ─── JSON-LD ────────────────────────────────────────────────────────────── */

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Criação de Site Profissional',
  description:
    'Criamos sites profissionais com design exclusivo, SEO técnico e responsividade em 7 dias úteis por R$197.',
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
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-4 h-4 shrink-0"
    >
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

const INCLUSIONS = [
  {
    title: 'Design personalizado e exclusivo',
    desc: 'Não usamos templates prontos. Cada site é desenvolvido do zero para o seu negócio, com identidade visual própria e diferenciada.',
  },
  {
    title: 'Responsivo em todos os dispositivos',
    desc: 'Celular, tablet e computador. Mais de 70% dos seus clientes acessam pelo celular — seu site precisa funcionar perfeitamente em telas de todos os tamanhos.',
  },
  {
    title: 'SEO técnico incluso',
    desc: 'Meta tags otimizadas, Schema markup, sitemap, velocidade de carregamento e estrutura ideal para indexação. Seu site já nasce preparado para aparecer no Google.',
  },
  {
    title: 'Entrega em 7 dias úteis',
    desc: 'Do briefing ao site pronto. Você recebe para revisar antes de publicar — ajustamos o que for necessário até a aprovação final.',
  },
  {
    title: 'Código limpo e rápido',
    desc: 'Carregamento em milissegundos, sem dependência de plataformas lentas. Performance é parte do SEO e da experiência do usuário.',
  },
  {
    title: 'Suporte via WhatsApp',
    desc: 'Tire dúvidas direto pelo WhatsApp durante todo o processo de criação. Sem fila de chamados, sem burocracia.',
  },
]

const STEPS = [
  {
    number: '01',
    title: 'Você nos conta sobre seu negócio',
    desc: 'Preenchimento de um briefing simples. Nos conta o que faz, quem é seu cliente ideal e o que quer mostrar no site. Leva menos de 10 minutos.',
  },
  {
    number: '02',
    title: 'Desenvolvemos o design',
    desc: 'Criamos um layout personalizado com as cores, estilo e identidade do seu negócio. Nenhum template genérico — é feito para você.',
  },
  {
    number: '03',
    title: 'Você revisa e aprova',
    desc: 'Apresentamos o site completo. Você analisa, pede ajustes se necessário e aprova. Só publicamos quando você estiver satisfeito.',
  },
  {
    number: '04',
    title: 'Site no ar em 7 dias úteis',
    desc: 'Publicamos com hospedagem, SSL e domínio. E o seu negócio começa a aparecer no Google para quem está procurando o que você oferece.',
  },
]

const COMPARISON_ROWS = [
  {
    label: 'Preço',
    diy: 'Grátis (mas limitado)',
    agency: 'R$2.000–R$8.000',
    topsite: 'R$197',
  },
  {
    label: 'Prazo',
    diy: 'Você faz — leva semanas',
    agency: '30–90 dias',
    topsite: '7 dias úteis',
  },
  {
    label: 'Design',
    diy: 'Template genérico',
    agency: 'Personalizado',
    topsite: 'Personalizado',
  },
  {
    label: 'SEO',
    diy: 'Básico',
    agency: 'Incluso',
    topsite: 'Incluso',
  },
  {
    label: 'Suporte',
    diy: 'Fórum da plataforma',
    agency: 'Pago após entrega',
    topsite: 'WhatsApp incluso',
  },
]

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default function CriacaoDeSitesPage() {
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
            {/* Glow de fundo */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(250,204,21,0.07) 0%, transparent 60%)',
              }}
            />

            <div className="relative max-w-4xl mx-auto px-4 sm:px-8 text-center">
              <Badge>Criação de Sites</Badge>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
                Criação de Site Profissional
                <span
                  className="block mt-1"
                  style={{
                    background: 'linear-gradient(135deg, #facc15, #f59e0b)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  por R$197
                </span>
              </h1>

              <p className="text-lg text-white/70 leading-relaxed max-w-2xl mx-auto mb-10">
                Ter um site profissional não precisa custar caro nem demorar meses.
                Criamos o seu em 7 dias úteis, com design exclusivo, responsivo e
                pronto para aparecer no Google.
              </p>

              {/* Preço destaque */}
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
                    style={{ color: 'rgba(255,255,255,0.45)', borderColor: 'rgba(255,255,255,0.1)' }}
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

          {/* ─── O QUE ESTÁ INCLUSO ────────────────────────────────────────── */}
          <section className="py-20" style={{ background: '#0d0d0d' }}>
            <div className="max-w-5xl mx-auto px-4 sm:px-8">
              <div className="text-center mb-14">
                <Badge>O que está incluso</Badge>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                  Tudo que seu site precisa,
                  <span
                    className="block"
                    style={{
                      background: 'linear-gradient(135deg, #facc15, #f59e0b)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    sem custo adicional
                  </span>
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {INCLUSIONS.map((item, i) => (
                  <div
                    key={i}
                    className="flex gap-4 p-6 rounded-2xl"
                    style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.05)',
                    }}
                  >
                    <div
                      className="mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        background: 'rgba(250,204,21,0.08)',
                        border: '1px solid rgba(250,204,21,0.12)',
                        color: '#facc15',
                      }}
                    >
                      <CheckIcon />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">{item.title}</h3>
                      <p className="text-sm text-white/55 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ─── COMO FUNCIONA ──────────────────────────────────────────────── */}
          <section className="py-20" style={{ background: '#0a0a0a' }}>
            <div className="max-w-5xl mx-auto px-4 sm:px-8">
              <div className="text-center mb-14">
                <Badge>Como funciona</Badge>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                  Do contato ao site no ar
                  <span
                    className="block"
                    style={{
                      background: 'linear-gradient(135deg, #facc15, #f59e0b)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    em 4 etapas simples
                  </span>
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {STEPS.map((step, i) => (
                  <div
                    key={i}
                    className="relative p-8 rounded-2xl"
                    style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.05)',
                    }}
                  >
                    <span
                      className="text-5xl font-black leading-none mb-4 block"
                      style={{ color: 'rgba(250,204,21,0.15)' }}
                    >
                      {step.number}
                    </span>
                    <h3 className="font-semibold text-white text-lg mb-2">{step.title}</h3>
                    <p className="text-sm text-white/55 leading-relaxed">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ─── COMPARATIVO ───────────────────────────────────────────────── */}
          <section className="py-20" style={{ background: '#0d0d0d' }}>
            <div className="max-w-5xl mx-auto px-4 sm:px-8">
              <div className="text-center mb-14">
                <Badge>Comparativo</Badge>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                  Por que não usar Wix
                  <span
                    className="block"
                    style={{
                      background: 'linear-gradient(135deg, #facc15, #f59e0b)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    ou WordPress?
                  </span>
                </h2>
                <p className="text-white/55 mt-4 max-w-xl mx-auto text-sm">
                  Plataformas DIY parecem fáceis no começo — mas o tempo que você
                  gasta montando um site amador poderia estar sendo usado no seu
                  negócio.
                </p>
              </div>

              <div
                className="rounded-2xl overflow-hidden"
                style={{ border: '1px solid rgba(255,255,255,0.06)' }}
              >
                {/* Header */}
                <div
                  className="grid grid-cols-4 text-xs font-semibold uppercase tracking-widest"
                  style={{ background: 'rgba(255,255,255,0.03)' }}
                >
                  <div className="px-5 py-4 text-white/40"></div>
                  <div className="px-5 py-4 text-white/40">Plataformas DIY</div>
                  <div className="px-5 py-4 text-white/40">Agência Tradicional</div>
                  <div className="px-5 py-4" style={{ color: '#facc15' }}>
                    TOP SITE
                  </div>
                </div>

                {/* Rows */}
                {COMPARISON_ROWS.map((row, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-4 text-sm"
                    style={{
                      borderTop: '1px solid rgba(255,255,255,0.04)',
                      background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)',
                    }}
                  >
                    <div className="px-5 py-4 font-medium text-white/70">{row.label}</div>
                    <div className="px-5 py-4 text-white/45">{row.diy}</div>
                    <div className="px-5 py-4 text-white/45">{row.agency}</div>
                    <div
                      className="px-5 py-4 font-semibold"
                      style={{ color: '#facc15' }}
                    >
                      {row.topsite}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ─── CTA FINAL ──────────────────────────────────────────────────── */}
          <section className="py-24 overflow-hidden" style={{ background: '#0a0a0a' }}>
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
                Pronto para ter seu
                <span
                  className="block"
                  style={{
                    background: 'linear-gradient(135deg, #facc15, #f59e0b)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  site profissional?
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
