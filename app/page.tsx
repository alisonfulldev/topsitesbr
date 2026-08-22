import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import Script from 'next/script'

/* ─── Config ─────────────────────────────────────────────────────────────── */

const WA_NUMBER = '5518996742364'
function wa(msg: string) {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`
}
const MSG_DOUBT = 'Olá! Tenho uma dúvida sobre os sites da TopSite. Pode me ajudar?'

/* ─── SEO ────────────────────────────────────────────────────────────────── */

export const metadata: Metadata = {
  title: 'TOP SITE — Criação de Sites Estratégicos com SEO e Conversão',
  description:
    'Desenvolvemos sites de alta performance com foco em conversão e SEO avançado. Tecnologia, design estratégico e resultados reais para seu negócio.',
  keywords:
    'site profissional, criação de site, SEO avançado, conversão digital, site estratégico, desenvolvimento web, site que vende',
  authors: [{ name: 'TOP SITE' }],
  creator: 'TOP SITE',
  publisher: 'TOP SITE',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  openGraph: {
    type: 'website',
    title: 'TOP SITE — Criação de Sites Estratégicos com SEO e Conversão',
    description: 'Desenvolvemos sites de alta performance com foco em conversão e SEO avançado.',
    siteName: 'TOP SITE',
    locale: 'pt_BR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TOP SITE — Sites que Vendem',
    description: 'Sites estratégicos focados em conversão e SEO. A partir de R$497.',
  },
}

/* ─── JSON-LD ────────────────────────────────────────────────────────────── */

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': '#organization',
      name: 'TOP SITE',
      description: 'Criação de sites personalizados focados em conversão e SEO para empresas brasileiras',
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'sales',
        telephone: '+55-18-99674-2364',
        availableLanguage: 'Portuguese',
      },
    },
    {
      '@type': 'WebSite',
      '@id': '#website',
      name: 'TOP SITE',
      description: 'Sites que vendem — Conversão + SEO Avançado',
      publisher: { '@id': '#organization' },
      inLanguage: 'pt-BR',
    },
    {
      '@type': 'Service',
      name: 'Criação de Site Estratégico — Conversão e SEO',
      description:
        'Site personalizado e avançado, feito à mão sob medida, focado em conversão e SEO avançado.',
      provider: { '@id': '#organization' },
      serviceType: 'Criação de Sites Profissionais e Estratégicos',
      areaServed: { '@type': 'Country', name: 'Brazil' },
      offers: {
        '@type': 'Offer',
        price: '497',
        priceCurrency: 'BRL',
        availability: 'https://schema.org/InStock',
      },
    },
  ],
}

/* ─── Icons ──────────────────────────────────────────────────────────────── */

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  )
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  )
}

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" style={{ color: '#facc15' }}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

function CodeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  )
}

function ZapIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )
}

function CpuIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <rect x="9" y="9" width="6" height="6" />
      <line x1="9" y1="1" x2="9" y2="4" />
      <line x1="15" y1="1" x2="15" y2="4" />
      <line x1="9" y1="20" x2="9" y2="23" />
      <line x1="15" y1="20" x2="15" y2="23" />
      <line x1="20" y1="9" x2="23" y2="9" />
      <line x1="20" y1="14" x2="23" y2="14" />
      <line x1="1" y1="9" x2="4" y2="9" />
      <line x1="1" y1="14" x2="4" y2="14" />
    </svg>
  )
}

/* ─── Shared Components ──────────────────────────────────────────────────── */

function CTAPrimary({
  href,
  children,
  className = '',
  external = false,
}: {
  href: string
  children: React.ReactNode
  className?: string
  external?: boolean
}) {
  const Component = external ? 'a' : Link
  const props = external ? { href, target: '_blank', rel: 'noopener noreferrer' } : { href }

  return (
    <Component
      {...props}
      className={`group relative inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold text-black transition-all duration-300 rounded-xl overflow-hidden ${className}`}
      style={{
        background: 'linear-gradient(135deg, #facc15, #f59e0b)',
        boxShadow: '0 4px 24px rgba(250, 204, 21, 0.3)',
      }}
    >
      <span className="relative z-10 flex items-center gap-2">{children}</span>
      <span
        className="absolute inset-0 transition-all duration-300 opacity-0 group-hover:opacity-100"
        style={{
          background: 'linear-gradient(135deg, #f59e0b, #d97706)',
        }}
      />
    </Component>
  )
}

function Badge({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-medium tracking-wider uppercase rounded-full ${className}`}
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

/* ─── Static Data ────────────────────────────────────────────────────────── */

const TECH_FEATURES = [
  { icon: CodeIcon, label: 'Código limpo e otimizado', desc: 'Desenvolvimento com boas práticas, semântica e performance' },
  { icon: ZapIcon, label: 'Performance extrema', desc: 'Carregamento em milissegundos com otimização avançada' },
  { icon: ShieldIcon, label: 'Segurança enterprise', desc: 'SSL, firewall, proteção contra ataques e backups' },
  { icon: CpuIcon, label: 'SEO técnico avançado', desc: 'Schema markup, meta tags, sitemaps e estrutura ideal' },
]

const PORTFOLIO = [
  { src: '/portfolio/site1.jpg', segment: 'Restaurante' },
  { src: '/portfolio/site2.jpg', segment: 'Energia Solar' },
  { src: '/portfolio/site3.jpg', segment: 'Direito' },
  { src: '/portfolio/site4.jpg', segment: 'Crédito' },
]

const TESTIMONIALS = [
  {
    text: 'A TopSite transformou completamente nossa presença digital. Em menos de 30 dias, estávamos na primeira página do Google.',
    name: 'Marcos A.',
    role: 'Escritório de Advocacia',
    initial: 'M',
    color: '#2563eb',
  },
  {
    text: 'O site deles não é só bonito — ele gera resultado. Minha clínica triplicou os agendamentos online.',
    name: 'Dra. Renata S.',
    role: 'Clínica Estética',
    initial: 'R',
    color: '#7c3aed',
  },
  {
    text: 'Tentei Wix, WordPress, tudo. Nada funcionou como a abordagem estratégica da TopSite. Melhor investimento do ano.',
    name: 'Roberto F.',
    role: 'Energia Solar',
    initial: 'R',
    color: '#d97706',
  },
]

const FAQS = [
  { q: 'Quanto tempo leva para ficar pronto?', a: 'O prazo médio é de 15 a 30 dias, dependendo da complexidade do projeto.' },
  { q: 'Preciso ter um domínio e hospedagem?', a: 'Não! Cuidamos de tudo: domínio, hospedagem, SSL, e-mail e monitoramento.' },
  { q: 'Vou conseguir administrar o site depois?', a: 'Sim! Entregamos com um painel fácil e damos todo o suporte necessário.' },
  { q: 'E se eu quiser mudar algo depois?', a: 'Suporte e ajustes finos estão inclusos. Mudanças maiores têm orçamento ágil.' },
]

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Script src="https://topsitebr.com.br/tracker.js" data-site-id="41442a6b-5fde-405e-a376-3161d0c44572" strategy="afterInteractive" />

      <div className="min-h-screen text-white antialiased" style={{ background: '#0a0a0a' }}>

        {/* ─── NAV ────────────────────────────────────────────────────────── */}
        <header
          className="fixed top-0 left-0 right-0 z-50 backdrop-blur-2xl"
          style={{
            background: 'rgba(10,10,10,0.7)',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
          }}
        >
          <nav className="max-w-7xl mx-auto px-4 sm:px-8 h-16 sm:h-20 flex items-center justify-between">
            <a href="/" className="flex items-center gap-3">
              <Image src="/logo.png" alt="TOP SITE" width={140} height={45} className="h-9 w-auto" priority />
            </a>

            <div className="flex items-center gap-4">
              <a
                href="/login"
                className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm text-white/40 hover:text-white/70 transition-colors duration-200 rounded-xl hover:bg-white/5"
              >
                Área do cliente
              </a>
              <CTAPrimary href="/orcamento" className="!px-5 !py-2.5 !text-xs">
                Orçamento grátis
              </CTAPrimary>
            </div>
          </nav>
        </header>

        {/* ─── HERO ────────────────────────────────────────────────────────── */}
        <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
          {/* Background */}
          <div className="absolute inset-0">
            <div
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(ellipse 60% 50% at 30% 20%, rgba(250,204,21,0.06) 0%, transparent 50%), radial-gradient(ellipse 40% 40% at 70% 80%, rgba(180,83,9,0.04) 0%, transparent 50%)',
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.015) 1px, transparent 1px)',
                backgroundSize: '40px 40px',
              }}
            />
          </div>

          {/* Content */}
          <div className="relative max-w-7xl mx-auto px-4 sm:px-8 w-full py-20">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Left */}
              <div>
                <Badge className="mb-6">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  +50 negócios confiam
                </Badge>

                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] mb-6">
                  Sites que
                  <span className="block" style={{ background: 'linear-gradient(135deg, #facc15, #f59e0b, #d97706)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                    vendem por você
                  </span>
                </h1>

                <p className="text-lg text-white/60 leading-relaxed mb-8 max-w-lg">
                  Desenvolvemos sites de alta performance com foco em conversão e SEO avançado.
                  Tecnologia de ponta, design estratégico e resultados reais para seu negócio.
                </p>

                <div className="flex flex-wrap items-center gap-4 mb-10">
                  <CTAPrimary href="/orcamento" className="!px-8 !py-4 !text-base">
                    Começar agora
                    <ArrowIcon />
                  </CTAPrimary>
                  <a
                    href="#tech"
                    className="flex items-center gap-2 px-4 py-3 text-sm text-white/40 hover:text-white/70 transition-colors duration-200"
                  >
                    <span className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-xs">
                      ▶
                    </span>
                    Ver tecnologia
                  </a>
                </div>

                <div className="flex flex-wrap items-center gap-6">
                  <div className="flex -space-x-2">
                    {['#2563eb', '#7c3aed', '#d97706', '#16a34a'].map((c, i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full ring-2 ring-[#0a0a0a]"
                        style={{ background: c }}
                      />
                    ))}
                  </div>
                  <div>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon key={i} />
                      ))}
                    </div>
                    <p className="text-sm text-white/30">4.9 de média · 50+ clientes</p>
                  </div>
                </div>
              </div>

              {/* Right - Laptop Mockup */}
              <div className="relative">
                {/* Glow */}
                <div
                  className="absolute -inset-10 blur-3xl"
                  style={{
                    background: 'radial-gradient(ellipse, rgba(250,204,21,0.04) 0%, transparent 60%)',
                  }}
                />

                {/* Laptop */}
                <div className="relative">
                  {/* Screen */}
                  <div
                    className="rounded-t-2xl overflow-hidden"
                    style={{
                      background: '#0d0d0d',
                      border: '1px solid rgba(255,255,255,0.06)',
                      boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
                    }}
                  >
                    {/* Browser Chrome */}
                    <div className="flex items-center gap-2 px-4 py-3" style={{ background: '#f1f3f4' }}>
                      <div className="flex gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                        <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                      </div>
                      <div className="flex-1 mx-4">
                        <div className="max-w-xs mx-auto px-3 py-1 rounded flex items-center gap-2 text-xs" style={{ background: '#fff', border: '1px solid #dadce0', color: '#202124', fontSize: 10 }}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" fill="#5f6368"/></svg>
                          google.com.br/search?q=melhor+clínica+estética+SP
                        </div>
                      </div>
                    </div>

                    {/* Google SERP */}
                    <div className="aspect-[16/10] relative overflow-hidden" style={{ background: '#fff' }}>
                      <div className="absolute inset-0 flex flex-col" style={{ padding: '12px 16px', fontFamily: 'Arial, sans-serif' }}>

                        {/* Google logo + search bar */}
                        <div className="flex items-center gap-3 mb-2">
                          <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: -0.5, lineHeight: 1 }}>
                            <span style={{ color: '#4285f4' }}>G</span>
                            <span style={{ color: '#ea4335' }}>o</span>
                            <span style={{ color: '#fbbc04' }}>o</span>
                            <span style={{ color: '#4285f4' }}>g</span>
                            <span style={{ color: '#34a853' }}>l</span>
                            <span style={{ color: '#ea4335' }}>e</span>
                          </span>
                          <div className="flex-1 flex items-center gap-2 px-3" style={{ height: 26, border: '1px solid #dfe1e5', borderRadius: 14, boxShadow: '0 1px 6px rgba(32,33,36,.1)', background: '#fff' }}>
                            <span style={{ fontSize: 9, color: '#202124', flex: 1 }}>melhor clínica estética SP</span>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#4285f4" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                          </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex items-center gap-4 mb-1.5 pb-1" style={{ borderBottom: '1px solid #ebebeb' }}>
                          {[['Tudo', true], ['Imagens', false], ['Notícias', false], ['Maps', false], ['Mais', false]].map(([label, active]) => (
                            <span key={label as string} style={{ fontSize: 9, color: active ? '#1a73e8' : '#5f6368', borderBottom: active ? '2px solid #1a73e8' : 'none', paddingBottom: 3, fontWeight: active ? 500 : 400 }}>
                              {label as string}
                            </span>
                          ))}
                        </div>

                        {/* Result count */}
                        <p style={{ fontSize: 7.5, color: '#70757a', marginBottom: 8 }}>Cerca de 3.840.000 resultados (0,38 segundos)</p>

                        {/* #1 Result — highlighted */}
                        <div style={{ marginBottom: 10, padding: '8px 10px', borderRadius: 8, border: '1px solid #e8f0fe', background: '#f8fbff' }}>
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <div className="w-4 h-4 rounded-sm flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #facc15, #f59e0b)' }}>
                              <span style={{ fontSize: 6, fontWeight: 700, color: '#000' }}>1</span>
                            </div>
                            <span style={{ fontSize: 8, color: '#188038' }}>clinicaestética.com.br › inicio › serviços</span>
                          </div>
                          <div style={{ fontSize: 11, color: '#1a0dab', fontWeight: 500, lineHeight: 1.3, marginBottom: 3 }}>
                            Clínica Estética SP — Tratamentos Exclusivos | Agende Online
                          </div>
                          <div style={{ fontSize: 8.5, color: '#4d5156', lineHeight: 1.5 }}>
                            Líder em estética avançada em São Paulo. Botox, preenchimento, limpeza de pele e muito mais. ⭐⭐⭐⭐⭐ Mais de 500 avaliações 5 estrelas.
                          </div>
                          {/* Sitelinks */}
                          <div className="flex gap-4 mt-2 pt-2" style={{ borderTop: '1px solid #e8f0fe' }}>
                            {['Agendar Consulta', 'Serviços', 'Contato', 'Localização'].map(l => (
                              <span key={l} style={{ fontSize: 8, color: '#1a0dab' }}>{l}</span>
                            ))}
                          </div>
                        </div>

                        {/* #2 e #3 — concorrentes desbotados */}
                        <div style={{ opacity: 0.55, marginBottom: 7 }}>
                          <div style={{ fontSize: 7.5, color: '#188038' }}>outraclínica.com.br</div>
                          <div style={{ fontSize: 10, color: '#1a0dab' }}>Clínica Estética — Tratamentos Faciais e Corporais</div>
                          <div style={{ fontSize: 8, color: '#4d5156' }}>Procedimentos estéticos com agendamento online. Confira nossos planos...</div>
                        </div>
                        <div style={{ opacity: 0.28 }}>
                          <div style={{ fontSize: 7.5, color: '#188038' }}>esteticaonline.com.br</div>
                          <div style={{ fontSize: 10, color: '#1a0dab' }}>Estética SP — Resultados Comprovados</div>
                          <div style={{ fontSize: 8, color: '#4d5156' }}>Tratamentos a partir de R$80. Agende sua avaliação gratuita...</div>
                        </div>

                      </div>
                    </div>
                  </div>

                  {/* Laptop Base */}
                  <div
                    className="mx-auto h-2 rounded-b-2xl"
                    style={{
                      width: '95%',
                      background: 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
                      border: '1px solid rgba(255,255,255,0.04)',
                      borderTop: 'none',
                    }}
                  />
                  <div
                    className="mx-auto h-1"
                    style={{
                      width: '60%',
                      background: 'rgba(255,255,255,0.02)',
                      borderBottom: '1px solid rgba(255,255,255,0.02)',
                    }}
                  />

                  {/* Badge overlay */}
                  <div
                    className="absolute -top-2 -right-2 px-3 py-1 rounded-full text-[10px] font-bold"
                    style={{
                      background: 'linear-gradient(135deg, #facc15, #f59e0b)',
                      color: '#000',
                      boxShadow: '0 4px 16px rgba(250,204,21,0.3)',
                    }}
                  >
                    #1 Google
                  </div>
                </div>
              </div>
            </div>

            {/* Scroll indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
              <span className="text-xs text-white/20">ROLE PARA EXPLORAR</span>
              <div className="w-5 h-8 rounded-full border border-white/10 flex items-start justify-center p-1">
                <div className="w-0.5 h-2 rounded-full bg-white/30" />
              </div>
            </div>
          </div>
        </section>

        {/* ─── TECH ────────────────────────────────────────────────────────── */}
        <section id="tech" className="relative py-24" style={{ background: '#0d0d0d' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <div className="text-center mb-16">
              <Badge className="mb-4">Tecnologia</Badge>
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
                Feito com as melhores
                <span className="block" style={{ background: 'linear-gradient(135deg, #facc15, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  ferramentas do mercado
                </span>
              </h2>
              <p className="text-white/40 max-w-lg mx-auto">
                Desenvolvimento profissional com as tecnologias mais modernas e eficientes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {TECH_FEATURES.map((feature, i) => (
                <div
                  key={i}
                  className="group p-8 text-center rounded-2xl transition-all duration-500 hover:-translate-y-2"
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.04)',
                  }}
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all duration-300 group-hover:scale-110"
                    style={{
                      background: 'rgba(250,204,21,0.05)',
                      border: '1px solid rgba(250,204,21,0.08)',
                    }}
                  >
                    <feature.icon />
                  </div>
                  <h3 className="font-semibold text-white mb-2">{feature.label}</h3>
                  <p className="text-sm text-white/30 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 flex flex-wrap items-center justify-center gap-8">
              {['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Node.js', 'Vercel'].map((tech) => (
                <span
                  key={tech}
                  className="px-4 py-2 text-xs font-medium rounded-full"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.04)',
                    color: 'rgba(255,255,255,0.3)',
                  }}
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ─── PORTFOLIO ────────────────────────────────────────────────────── */}
        <section id="portfolio" className="relative py-24" style={{ background: '#080808' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <div className="text-center mb-16">
              <Badge className="mb-4">Cases</Badge>
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
                Projetos que
                <span className="block" style={{ background: 'linear-gradient(135deg, #facc15, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  transformaram negócios
                </span>
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {PORTFOLIO.map((p, i) => (
                <div
                  key={i}
                  className="group relative overflow-hidden rounded-2xl aspect-[3/4] cursor-pointer"
                  style={{ background: 'rgba(255,255,255,0.02)' }}
                >
                  <img
                    src={p.src}
                    alt={`${p.segment} - TOP SITE`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500"
                    style={{
                      background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 50%)',
                    }}
                  >
                    <div className="absolute bottom-4 left-4 right-4">
                      <p className="text-white/80 font-medium text-sm">{p.segment}</p>
                      <p className="text-white/30 text-xs">Ver case →</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── TESTIMONIALS ────────────────────────────────────────────────── */}
        <section id="testimonials" className="relative py-24" style={{ background: '#0d0d0d' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <div className="text-center mb-16">
              <Badge className="mb-4">Depoimentos</Badge>
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
                O que nossos
                <span className="block" style={{ background: 'linear-gradient(135deg, #facc15, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  clientes dizem
                </span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {TESTIMONIALS.map((t, i) => (
                <div
                  key={i}
                  className="p-8 rounded-2xl flex flex-col h-full"
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.04)',
                  }}
                >
                  <div className="flex gap-0.5 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <StarIcon key={j} />
                    ))}
                  </div>
                  <p className="text-white/60 text-sm leading-relaxed flex-1 mb-6">“{t.text}”</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                      style={{ background: t.color }}
                    >
                      {t.initial}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{t.name}</p>
                      <p className="text-xs text-white/30">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── PRICING ──────────────────────────────────────────────────────── */}
        <section id="pricing" className="relative py-24" style={{ background: '#080808' }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-8">
            <div className="text-center mb-16">
              <Badge className="mb-4">Investimento</Badge>
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
                Preço justo para
                <span className="block" style={{ background: 'linear-gradient(135deg, #facc15, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  resultado de verdade
                </span>
              </h2>
            </div>

            <div
              className="max-w-2xl mx-auto p-12 rounded-2xl text-center"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.04)',
              }}
            >
              <p className="text-sm text-white/30 mb-2">A partir de</p>
              <p className="text-7xl font-bold" style={{ color: '#facc15' }}>R$497</p>
              <p className="text-sm text-white/30 mt-2">parcelado em até 2× sem juros</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-10 text-left">
                {[
                  'Site personalizado e exclusivo',
                  'SEO técnico avançado',
                  'Otimizado para conversão',
                  'Hospedagem e SSL incluídos',
                  'Painel de gerenciamento',
                  'Suporte via WhatsApp',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 text-sm text-white/60">
                    <span className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'rgba(250,204,21,0.1)' }}>
                      <CheckIcon />
                    </span>
                    {item}
                  </div>
                ))}
              </div>

              <CTAPrimary href="/orcamento" className="!px-12 !py-4 !text-base">
                Começar projeto
                <ArrowIcon />
              </CTAPrimary>
              <p className="text-center text-xs text-white/20 mt-3">Sem compromisso · Orçamento em 24h</p>
            </div>
          </div>
        </section>

        {/* ─── FAQ ──────────────────────────────────────────────────────────── */}
        <section className="relative py-24" style={{ background: '#0d0d0d' }}>
          <div className="max-w-3xl mx-auto px-4 sm:px-8">
            <div className="text-center mb-16">
              <Badge className="mb-4">Dúvidas</Badge>
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
                Perguntas
                <span className="block" style={{ background: 'linear-gradient(135deg, #facc15, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  frequentes
                </span>
              </h2>
            </div>

            <div className="space-y-3">
              {FAQS.map((faq, i) => (
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
                    <span className="text-white/20 text-sm transition-transform duration-300 group-open:rotate-180">
                      ▾
                    </span>
                  </summary>
                  <div className="px-6 pb-6">
                    <p className="text-sm text-white/30 leading-relaxed">{faq.a}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ─── FINAL CTA ────────────────────────────────────────────────────── */}
        <section className="relative py-32 overflow-hidden" style={{ background: '#080808' }}>
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(250,204,21,0.04) 0%, transparent 60%)',
            }}
          />

          <div className="relative max-w-3xl mx-auto px-4 sm:px-8 text-center">
            <h2 className="text-4xl sm:text-6xl font-bold tracking-tight mb-6">
              Pronto para ter um site
              <span className="block" style={{ background: 'linear-gradient(135deg, #facc15, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                que realmente vende?
              </span>
            </h2>
            <p className="text-white/40 text-lg mb-10">
              Comece agora. Orçamento gratuito em até 24h. Sem compromisso.
            </p>

            <CTAPrimary href="/orcamento" className="!px-12 !py-5 !text-lg">
              Quero meu orçamento
              <ArrowIcon />
            </CTAPrimary>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-white/20">
              <span className="flex items-center gap-2">✓ Orçamento gratuito</span>
              <span className="w-px h-4 bg-white/10" />
              <span className="flex items-center gap-2">✓ Parcele em 2×</span>
              <span className="w-px h-4 bg-white/10" />
              <span className="flex items-center gap-2">✓ Sem contrato</span>
            </div>
          </div>
        </section>

        {/* ─── FOOTER ───────────────────────────────────────────────────────── */}
        <footer className="relative py-12" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <a href="/">
              <Image src="/logo.png" alt="TOP SITE" width={120} height={35} className="h-8 w-auto" />
            </a>

            <p className="text-xs text-white/20 text-center">
              © {new Date().getFullYear()} TOP SITE ·{' '}
              <a href="/termos" className="hover:text-white/40 transition-colors">Termos</a>
              {' · '}
              <a href="/privacidade" className="hover:text-white/40 transition-colors">Privacidade</a>
              {' · '}
              <a href="/login" className="hover:text-white/40 transition-colors">Área do cliente</a>
            </p>

            <a
              href={wa(MSG_DOUBT)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-white/20 hover:text-white/40 transition-colors"
            >
              💬 Falar no WhatsApp
            </a>
          </div>
        </footer>

      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          ::selection {
            background: #facc15;
            color: #0a0a0a;
          }
          * {
            scroll-behavior: smooth;
          }
        `
      }} />
    </>
  )
}