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

function Icon({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <span className={`inline-flex items-center justify-center ${className}`}>{children}</span>
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

function LayersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  )
}

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

function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.15 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.62.24 2.85.12 3.15.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  )
}

function TwitterIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function LinkedinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
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

function CTASecondary({
  href,
  children,
  className = '',
}: {
  href: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-2 px-6 py-3.5 text-sm font-medium transition-all duration-300 rounded-xl border hover:bg-white/10 ${className}`}
      style={{
        color: 'rgba(255,255,255,0.7)',
        borderColor: 'rgba(255,255,255,0.15)',
      }}
    >
      {children}
      <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
    </Link>
  )
}

function GlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl backdrop-blur-xl transition-all duration-300 hover:shadow-2xl ${className}`}
      style={{
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <div
        className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: 'radial-gradient(circle at 50% 0%, rgba(250,204,21,0.03), transparent 60%)',
        }}
      />
      {children}
    </div>
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

const NAV_LINKS = [
  { label: 'Tecnologia', href: '#tech' },
  { label: 'Cases', href: '#portfolio' },
  { label: 'Processo', href: '#process' },
  { label: 'Depoimentos', href: '#testimonials' },
  { label: 'Planos', href: '#pricing' },
]

const TECH_FEATURES = [
  { icon: CodeIcon, label: 'Código limpo e otimizado', desc: 'Desenvolvimento com boas práticas, semântica e performance' },
  { icon: ZapIcon, label: 'Performance extrema', desc: 'Carregamento em milissegundos com otimização avançada' },
  { icon: ShieldIcon, label: 'Segurança enterprise', desc: 'SSL, firewall, proteção contra ataques e backups' },
  { icon: CpuIcon, label: 'SEO técnico avançado', desc: 'Schema markup, meta tags, sitemaps e estrutura ideal' },
]

const METRICS = [
  { value: '50+', label: 'Negócios atendidos' },
  { value: '4.9', label: 'Avaliação média' },
  { value: '100%', label: 'Satisfação garantida' },
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
            <a href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #facc15, #f59e0b)' }}>
                <span className="text-black font-bold text-sm">TS</span>
              </div>
              <span className="text-lg font-bold tracking-tight">TOP SITE</span>
            </a>

            <ul className="hidden lg:flex items-center gap-8 text-sm">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="text-white/40 hover:text-white/80 transition-colors duration-200">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-3">
              <a
                href="/login"
                className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm text-white/40 hover:text-white/70 transition-colors duration-200 rounded-xl hover:bg-white/5"
              >
                <span className="w-4 h-4 rounded-full border border-white/20 flex items-center justify-center text-[10px]">👤</span>
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
          {/* Background complex */}
          <div className="absolute inset-0">
            {/* Gradiente principal */}
            <div
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(ellipse 60% 50% at 30% 20%, rgba(250,204,21,0.08) 0%, transparent 50%), radial-gradient(ellipse 40% 40% at 70% 80%, rgba(180,83,9,0.05) 0%, transparent 50%), radial-gradient(ellipse 50% 60% at 50% 100%, rgba(0,0,0,0.4) 0%, transparent 50%)',
              }}
            />
            {/* Grid pattern */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.02) 1px, transparent 1px)',
                backgroundSize: '40px 40px',
              }}
            />
          </div>

          {/* Animated particles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full animate-float"
                style={{
                  width: Math.random() * 4 + 2,
                  height: Math.random() * 4 + 2,
                  background: `rgba(250,204,21,${Math.random() * 0.1 + 0.02})`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${Math.random() * 10 + 10}s`,
                }}
              />
            ))}
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
                  <span className="block text-transparent bg-clip-text" style={{ background: 'linear-gradient(135deg, #facc15, #f59e0b, #d97706)' }}>
                    vendem por você
                  </span>
                </h1>

                <p className="text-lg text-white/50 leading-relaxed mb-8 max-w-lg">
                  Desenvolvemos sites de alta performance com foco em conversão e SEO avançado.
                  Tecnologia de ponta, design estratégico e resultados reais.
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
                    <span className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center">
                      ▶
                    </span>
                    Ver tecnologias
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

              {/* Right - Tech showcase */}
              <div className="relative">
                <div className="relative">
                  {/* Glow */}
                  <div
                    className="absolute -inset-10 blur-3xl"
                    style={{
                      background: 'radial-gradient(ellipse, rgba(250,204,21,0.06) 0%, transparent 60%)',
                    }}
                  />

                  <GlassCard className="p-8 relative">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="flex gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                        <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                      </div>
                      <span className="text-xs text-white/20 ml-2">code.tsx</span>
                    </div>

                    <div className="space-y-3 font-mono text-sm">
                      <div className="flex items-start gap-3">
                        <span className="text-white/10">1</span>
                        <div>
                          <span className="text-purple-400">import</span>
                          <span className="text-white/60"> {'{ '}</span>
                          <span className="text-blue-400">Strategy</span>
                          <span className="text-white/60">, </span>
                          <span className="text-blue-400">SEO</span>
                          <span className="text-white/60"> from '</span>
                          <span className="text-green-400">@topsite/core</span>
                          <span className="text-white/60">'</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-white/10">2</span>
                        <div>
                          <span className="text-purple-400">const</span>
                          <span className="text-white/60"> {'{ '}</span>
                          <span className="text-yellow-400">site</span>
                          <span className="text-white/60"> = </span>
                          <span className="text-blue-400">new</span>
                          <span className="text-white/60"> </span>
                          <span className="text-pink-400">SiteStrategy</span>
                          <span className="text-white/60">(</span>
                          <span className="text-green-400">'meu-negocio'</span>
                          <span className="text-white/60">)</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-white/10">3</span>
                        <div>
                          <span className="text-white/60">  .</span>
                          <span className="text-yellow-400">withConversion</span>
                          <span className="text-white/60">(</span>
                          <span className="text-pink-400">true</span>
                          <span className="text-white/60">)</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-white/10">4</span>
                        <div>
                          <span className="text-white/60">  .</span>
                          <span className="text-yellow-400">withSEO</span>
                          <span className="text-white/60">(</span>
                          <span className="text-pink-400">'advanced'</span>
                          <span className="text-white/60">)</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-white/10">5</span>
                        <div>
                          <span className="text-white/60">  .</span>
                          <span className="text-yellow-400">deploy</span>
                          <span className="text-white/60">()</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 pt-3 border-t border-white/5">
                        <span className="text-white/10">6</span>
                        <div className="text-green-400 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                          <span>Site vendendo em 30 dias</span>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </div>

                {/* Floating stats */}
                <div className="absolute -bottom-6 -right-6 bg-black/80 backdrop-blur-xl rounded-xl px-6 py-4 border border-white/5">
                  <div className="flex gap-8">
                    {METRICS.map((m) => (
                      <div key={m.label} className="text-center">
                        <p className="text-2xl font-bold text-white">{m.value}</p>
                        <p className="text-xs text-white/30">{m.label}</p>
                      </div>
                    ))}
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
        <section id="tech" className="relative py-24">
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #0a0a0a 0%, #0d0d0d 100%)' }} />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-8">
            <div className="text-center mb-16">
              <Badge className="mb-4">Tecnologia</Badge>
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
                Feito com as melhores
                <span className="block text-transparent bg-clip-text" style={{ background: 'linear-gradient(135deg, #facc15, #f59e0b)' }}>
                  ferramentas do mercado
                </span>
              </h2>
              <p className="text-white/40 max-w-lg mx-auto">
                Desenvolvimento profissional com as tecnologias mais modernas e eficientes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {TECH_FEATURES.map((feature, i) => (
                <GlassCard
                  key={i}
                  className="group p-8 text-center hover:-translate-y-2 transition-all duration-500"
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
                </GlassCard>
              ))}
            </div>

            <div className="mt-12 flex flex-wrap items-center justify-center gap-8">
              {['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Node.js', 'Vercel'].map((tech) => (
                <span
                  key={tech}
                  className="px-4 py-2 text-xs font-medium rounded-full"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.06)',
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
        <section id="portfolio" className="relative py-24" style={{ background: '#0d0d0d' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <div className="text-center mb-16">
              <Badge className="mb-4">Cases</Badge>
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
                Projetos que
                <span className="block text-transparent bg-clip-text" style={{ background: 'linear-gradient(135deg, #facc15, #f59e0b)' }}>
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

        {/* ─── PROCESS ─────────────────────────────────────────────────────── */}
        <section id="process" className="relative py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <div className="text-center mb-16">
              <Badge className="mb-4">Processo</Badge>
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
                Do zero ao site que
                <span className="block text-transparent bg-clip-text" style={{ background: 'linear-gradient(135deg, #facc15, #f59e0b)' }}>
                  vende em 4 passos
                </span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
              {[
                { num: '01', title: 'Estratégia', desc: 'Analisamos seu mercado, concorrentes e público-alvo.' },
                { num: '02', title: 'Design', desc: 'Criamos uma interface que converte visitantes em clientes.' },
                { num: '03', title: 'Desenvolvimento', desc: 'Codificamos com as melhores práticas e performance.' },
                { num: '04', title: 'Lançamento', desc: 'Colocamos no ar com SEO, monitoramento e suporte.' },
              ].map((step, i) => (
                <div key={i} className="relative">
                  <GlassCard className="p-8 text-center h-full">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-bold"
                      style={{
                        background: 'linear-gradient(135deg, rgba(250,204,21,0.1), rgba(245,158,11,0.05))',
                        color: '#facc15',
                      }}
                    >
                      {step.num}
                    </div>
                    <h3 className="font-semibold text-white mb-2">{step.title}</h3>
                    <p className="text-sm text-white/30 leading-relaxed">{step.desc}</p>
                  </GlassCard>
                  {i < 3 && (
                    <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 text-white/10 text-2xl">
                      →
                    </div>
                  )}
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
                <span className="block text-transparent bg-clip-text" style={{ background: 'linear-gradient(135deg, #facc15, #f59e0b)' }}>
                  clientes dizem
                </span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {TESTIMONIALS.map((t, i) => (
                <GlassCard key={i} className="p-8 flex flex-col h-full">
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
                </GlassCard>
              ))}
            </div>
          </div>
        </section>

        {/* ─── PRICING ──────────────────────────────────────────────────────── */}
        <section id="pricing" className="relative py-24">
          <div className="max-w-5xl mx-auto px-4 sm:px-8">
            <div className="text-center mb-16">
              <Badge className="mb-4">Investimento</Badge>
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
                Preço justo para
                <span className="block text-transparent bg-clip-text" style={{ background: 'linear-gradient(135deg, #facc15, #f59e0b)' }}>
                  resultado de verdade
                </span>
              </h2>
            </div>

            <GlassCard className="p-12 max-w-2xl mx-auto relative">
              <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{
                  background: 'linear-gradient(90deg, #facc15, #f59e0b, #facc15)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 3s ease-in-out infinite',
                }}
              />

              <div className="text-center mb-8">
                <p className="text-sm text-white/30 mb-2">A partir de</p>
                <p className="text-7xl font-bold" style={{ color: '#facc15' }}>R$497</p>
                <p className="text-sm text-white/30 mt-2">parcelado em até 2× sem juros</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
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

              <CTAPrimary href="/orcamento" className="w-full justify-center !py-4 !text-base">
                Começar projeto
                <ArrowIcon />
              </CTAPrimary>
              <p className="text-center text-xs text-white/20 mt-3">Sem compromisso · Orçamento em 24h</p>
            </GlassCard>
          </div>
        </section>

        {/* ─── FAQ ──────────────────────────────────────────────────────────── */}
        <section className="relative py-24" style={{ background: '#0d0d0d' }}>
          <div className="max-w-3xl mx-auto px-4 sm:px-8">
            <div className="text-center mb-16">
              <Badge className="mb-4">Dúvidas</Badge>
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
                Perguntas
                <span className="block text-transparent bg-clip-text" style={{ background: 'linear-gradient(135deg, #facc15, #f59e0b)' }}>
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
        <section className="relative py-32 overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(250,204,21,0.05) 0%, transparent 60%)',
            }}
          />

          <div className="relative max-w-3xl mx-auto px-4 sm:px-8 text-center">
            <h2 className="text-4xl sm:text-6xl font-bold tracking-tight mb-6">
              Pronto para ter um site
              <span className="block text-transparent bg-clip-text" style={{ background: 'linear-gradient(135deg, #facc15, #f59e0b)' }}>
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
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #facc15, #f59e0b)' }}>
                <span className="text-black font-bold text-sm">TS</span>
              </div>
              <span className="text-sm font-bold">TOP SITE</span>
            </div>

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
              <span className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 text-xs">💬</span>
              Falar no WhatsApp
            </a>
          </div>
        </footer>

      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes shimmer {
            0%, 100% { background-position: 200% 0; }
            50% { background-position: -200% 0; }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px) translateX(0px); }
            50% { transform: translateY(-20px) translateX(10px); }
          }
          .animate-float {
            animation: float linear infinite;
          }
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