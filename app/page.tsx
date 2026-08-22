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
  title: 'Site que Vende — Conversão + SEO Avançado | TOP SITE',
  description:
    'Criamos sites personalizados e avançados, focados em conversão e SEO. Não é template de IA — é site estratégico feito à mão para transformar visitante em cliente e aparecer no Google. A partir de R$497.',
  keywords:
    'site que vende, site profissional avançado, site com SEO, criação de site para empresa, site focado em conversão, site personalizado, site para pequenas empresas, aparecer no Google, site estratégico',
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
    title: 'Site que Vende — Conversão + SEO Avançado | TOP SITE',
    description:
      'Sites personalizados e estratégicos, feitos à mão para converter visitante em cliente e aparecer no Google. A partir de R$497.',
    siteName: 'TOP SITE',
    locale: 'pt_BR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Site que Vende | TOP SITE',
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
        'Site personalizado e avançado, feito à mão sob medida, focado em conversão (CTA estratégicos, jornada de compra, gatilhos) e SEO avançado para aparecer no Google quando procuram pelo seu serviço.',
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

function WAIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function IconStar() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5" style={{ color: '#b45309' }} aria-hidden="true">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

function IconHand() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true"><path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" /><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" /></svg>
}

function IconTarget() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>
}

function IconSearch() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
}

function IconZap() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
}

function IconCheck() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5" aria-hidden="true"><path d="M20 6L9 17l-5-5" /></svg>
}

function IconArrow() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
}

function IconSparkle() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5" aria-hidden="true">
      <path d="M12 2L12 7M12 17L12 22M2 12L7 12M17 12L22 12M4.93 4.93L8.46 8.46M15.54 15.54L19.07 19.07M4.93 19.07L8.46 15.54M15.54 8.46L19.07 4.93" />
    </svg>
  )
}

function IconShield() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )
}

function IconClock() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

/* ─── Shared components ──────────────────────────────────────────────────── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 mb-4">
      <span className="w-8 h-0.5 rounded-full" style={{ background: 'linear-gradient(90deg, #facc15, #b45309)' }} />
      <p className="text-[10px] font-medium tracking-[0.2em] uppercase" style={{ color: '#b45309' }}>
        {children}
      </p>
      <span className="w-8 h-0.5 rounded-full" style={{ background: 'linear-gradient(90deg, #b45309, #facc15)' }} />
    </div>
  )
}

function CTAPrimary({
  href,
  children,
  size = 'md',
  className = '',
}: {
  href: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}) {
  const sizes = {
    sm: 'px-4 py-2 text-[12px]',
    md: 'px-5 py-2.5 text-[13px]',
    lg: 'px-7 py-3.5 text-[14px]',
    xl: 'px-8 py-4 text-[15px]',
  }
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center gap-2 text-black font-semibold rounded-xl transition-all duration-300 relative overflow-hidden group ${sizes[size]} ${className}`}
      style={{
        background: 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)',
        boxShadow: '0 4px 20px rgba(250, 204, 21, 0.3)',
      }}
    >
      <span className="relative z-10 flex items-center gap-2">{children}</span>
      <span
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        }}
      />
    </Link>
  )
}

function CTAGhost({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 text-[13px] transition-all duration-300 px-4 py-3 rounded-xl hover:bg-black/5"
      style={{ color: '#555' }}
    >
      {children}
    </Link>
  )
}

function GlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`backdrop-blur-sm rounded-2xl transition-all duration-300 ${className}`}
      style={{
        background: 'rgba(255, 255, 255, 0.7)',
        border: '1px solid rgba(255, 255, 255, 0.8)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.04)',
      }}
    >
      {children}
    </div>
  )
}

/* ─── Static data ────────────────────────────────────────────────────────── */

const NAV_LINKS = [
  { label: 'Diferenciais', href: '#diferenciais' },
  { label: 'Portfólio', href: '#portfolio' },
  { label: 'Processo', href: '#como-funciona' },
  { label: 'Depoimentos', href: '#depoimentos' },
  { label: 'Preço', href: '#oferta' },
]

const DIFFERENTIALS = [
  { Icon: IconHand, title: 'Personalizado e avançado', desc: 'Cada site é feito à mão, sob medida para o seu negócio e segmento. Não é template de IA que todo mundo usa — é um projeto exclusivo.' },
  { Icon: IconTarget, title: 'Focado em conversão', desc: 'Cada elemento é pensado para transformar visitante em cliente: CTAs estratégicos, jornada de compra clara e gatilhos de decisão no lugar certo.' },
  { Icon: IconSearch, title: 'SEO avançado', desc: 'Seu site otimizado de forma técnica para aparecer no Google quando alguém procura pelo seu serviço na sua cidade. Não é SEO básico de template.' },
  { Icon: IconZap, title: 'Performance real', desc: 'Sites rápidos convertem mais e ranqueiam melhor. Desenvolvemos com código limpo, imagens otimizadas e carregamento rápido em qualquer dispositivo.' },
]

const PROBLEMS = [
  { stat: '90%', label: 'não aparecem no Google', desc: 'dos sites não aparecem na primeira página do Google — e quem não aparece, não existe para o cliente.' },
  { stat: '3s', label: 'tempo máximo de espera', desc: 'é o tempo máximo que o visitante espera o site carregar. Sites lentos perdem clientes antes mesmo de mostrar o serviço.' },
  { stat: '0', label: 'conversões de IA', desc: 'conversões vêm de sites genéricos de IA — todos iguais, sem personalidade, sem estratégia, sem diferencial.' },
]

const STEPS = [
  { num: '01', title: 'Entendemos o seu negócio', desc: 'Analisamos seu mercado, seus concorrentes e o perfil do seu cliente ideal antes de escrever uma linha de código.' },
  { num: '02', title: 'Planejamos a estratégia', desc: 'Mapeamos a jornada do visitante, definimos os CTAs, a estrutura de SEO e a hierarquia visual que vai converter.' },
  { num: '03', title: 'Desenvolvemos personalizado', desc: 'Desenvolvemos do zero: design exclusivo, código limpo, SEO técnico e performance. Sem templates. Sem atalhos.' },
  { num: '04', title: 'Seu site vai ao ar vendendo', desc: 'Publicamos com hospedagem, SSL e monitoramento. Você começa a receber visitantes e clientes desde o primeiro dia.' },
]

const PORTFOLIO = [
  { src: '/portfolio/site1.jpg', segment: 'Restaurante', color: '#dc2626' },
  { src: '/portfolio/site2.jpg', segment: 'Energia Solar', color: '#16a34a' },
  { src: '/portfolio/site3.jpg', segment: 'Direito', color: '#2563eb' },
  { src: '/portfolio/site4.jpg', segment: 'Crédito', color: '#7c3aed' },
]

const TESTIMONIALS = [
  { text: 'Antes eu tinha um site que ninguém achava. Agora apareço no Google e recebo contatos toda semana de clientes novos. Valeu cada centavo.', name: 'Marcos A.', role: 'Escritório de Advocacia · SP', initial: 'M', color: '#2563eb' },
  { text: 'Minha clínica triplicou os agendamentos online em dois meses. O site deles não é só bonito — ele realmente converte.', name: 'Dra. Renata S.', role: 'Clínica Estética · RJ', initial: 'R', color: '#7c3aed' },
  { text: 'Já tinha tentado fazer sozinho no Wix. Não funcionou. Com a TopSite, em 30 dias meu site estava ranqueando para termos do meu bairro.', name: 'Roberto F.', role: 'Empresa de Energia Solar · MG', initial: 'R', color: '#d97706' },
]

const FOR_WHOM = [
  { title: 'Pequenas empresas', desc: 'Que querem competir com grandes e aparecer no Google da sua região.', icon: '🏢' },
  { title: 'Negócios em crescimento', desc: 'Que precisam de um site que acompanhe a expansão e gere demanda orgânica.', icon: '📈' },
  { title: 'Profissionais liberais', desc: 'Advogados, médicos, arquitetos e consultores que querem mais clientes qualificados.', icon: '👨‍⚖️' },
]

const CHECKLIST = [
  'Site personalizado feito à mão, não é template',
  'SEO técnico avançado desde o primeiro dia',
  'Otimizado para converter visitante em cliente',
  'Hospedagem, SSL e monitoramento incluídos',
  'Suporte via WhatsApp direto com a equipe',
]

const FAQS = [
  { q: 'Quanto tempo leva para ficar pronto?', a: 'O prazo médio é de 15 a 30 dias, dependendo da complexidade do projeto e da agilidade no envio de conteúdos.' },
  { q: 'Preciso ter um domínio e hospedagem?', a: 'Não! Cuidamos de tudo: domínio, hospedagem, SSL, e-mail profissional e monitoramento. Você só precisa do conteúdo.' },
  { q: 'Vou conseguir administrar o site depois?', a: 'Sim! Entregamos com um painel de fácil gerenciamento e damos todo o suporte necessário para você atualizar o conteúdo quando quiser.' },
  { q: 'E se eu quiser mudar algo depois?', a: 'Suporte e ajustes finos estão inclusos. Para mudanças maiores, fazemos um orçamento justo e ágil.' },
]

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Script src="https://topsitebr.com.br/tracker.js" data-site-id="41442a6b-5fde-405e-a376-3161d0c44572" strategy="afterInteractive" />

      <div className="text-[#0d0d0d] antialiased" style={{ background: '#fafaf9' }}>

        {/* ── NAV ─────────────────────────────────────────────────────────── */}
        <header
          className="sticky top-0 z-50 backdrop-blur-xl"
          style={{
            background: 'rgba(0, 0, 0, 0.85)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <nav className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between" aria-label="Navegação principal">
            <a href="/" aria-label="TOP SITE — página inicial" className="hover:opacity-80 transition-opacity">
              <Image src="/logo.png" alt="TOP SITE" width={120} height={40} className="h-8 w-auto" priority />
            </a>

            <ul className="hidden md:flex items-center gap-8 text-[13px]">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-white/60 hover:text-white transition-colors duration-200 font-medium"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-3">
              <a
                href="/login"
                className="flex items-center gap-1.5 text-[12px] px-3.5 py-2 rounded-xl transition-all duration-200 text-white/50 hover:text-white/80 hover:bg-white/5"
                aria-label="Acessar painel do cliente"
              >
                <UserIcon />
                <span className="hidden sm:inline">Acessar painel</span>
                <span className="sm:hidden">Entrar</span>
              </a>
              <CTAPrimary href="/orcamento" size="md" className="!shadow-[0_4px_20px_rgba(250,204,21,0.25)]">
                <span className="hidden sm:inline">Montar meu orçamento</span>
                <span className="sm:hidden">Orçamento</span>
              </CTAPrimary>
            </div>
          </nav>
        </header>

        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        <section id="hero" aria-labelledby="hero-heading" className="relative overflow-hidden py-28 sm:py-40 lg:py-48">
          {/* Background gradients */}
          <div
            className="absolute inset-0 pointer-events-none"
            aria-hidden
            style={{
              background: 'radial-gradient(ellipse 80% 60% at 20% 20%, rgba(250,204,21,0.08) 0%, transparent 50%), radial-gradient(ellipse 60% 50% at 80% 80%, rgba(180,83,9,0.06) 0%, transparent 50%)',
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            aria-hidden
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.03) 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />

          {/* Floating orbs */}
          <div
            className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full blur-3xl pointer-events-none animate-pulse"
            style={{ background: 'rgba(250,204,21,0.05)' }}
          />
          <div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none animate-pulse"
            style={{ background: 'rgba(180,83,9,0.04)' }}
            style={{ animationDelay: '1s' }}
          />

          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <div
              className="inline-flex items-center gap-2 rounded-full px-5 py-2 mb-10 backdrop-blur-sm"
              style={{
                border: '1px solid rgba(250,204,21,0.2)',
                background: 'rgba(250,204,21,0.06)',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#facc15' }} aria-hidden />
              <span className="text-[11px] font-medium tracking-wide" style={{ color: 'rgba(250,204,21,0.8)' }}>
                +50 negócios confiam na TopSite
              </span>
              <IconSparkle />
            </div>

            <h1
              id="hero-heading"
              className="text-[44px] sm:text-[62px] lg:text-[76px] font-bold leading-[1.02] tracking-tight text-[#0d0d0d] mb-8"
            >
              Seu site deveria estar{' '}
              <span className="relative">
                <span style={{ color: '#b45309' }}>VENDENDO</span>
                <span
                  className="absolute -bottom-2 left-0 right-0 h-2 rounded-full opacity-40 blur-sm"
                  style={{ background: 'rgba(180,83,9,0.3)' }}
                />
              </span>
              {' '}por você —<br className="hidden sm:block" />
              não só existindo.
            </h1>

            <p className="text-[17px] sm:text-[20px] max-w-2xl mx-auto mb-8 leading-relaxed" style={{ color: '#555' }}>
              Criamos sites{' '}
              <span className="text-[#0d0d0d] font-semibold">personalizados e avançados</span>,
              focados em conversão e SEO — para transformar visitante em cliente e aparecer no Google.
            </p>

            <div
              className="inline-flex items-center gap-3 rounded-full px-6 py-2.5 mb-10 text-[13px] backdrop-blur-sm"
              style={{
                background: 'rgba(255,255,255,0.7)',
                border: '1px solid rgba(0,0,0,0.06)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
              }}
            >
              <span style={{ color: '#555' }}>A partir de</span>
              <span className="font-bold text-xl" style={{ color: '#b45309' }}>R$497</span>
              <span style={{ color: '#999' }}>·</span>
              <span style={{ color: '#777' }}>parcele em 2×</span>
            </div>

            <ul className="flex flex-wrap justify-center gap-x-8 gap-y-3 mb-10 list-none">
              {['Feito à mão — não é template', 'SEO técnico avançado', 'Focado em converter'].map((t) => (
                <li key={t} className="flex items-center gap-2 text-[13px]" style={{ color: '#555' }}>
                  <span className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'rgba(180,83,9,0.1)' }}>
                    <IconCheck />
                  </span>
                  {t}
                </li>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <CTAPrimary href="/orcamento" size="lg" className="!px-10 !py-4 !text-[16px]">
                MONTAR MEU ORÇAMENTO
                <IconArrow />
              </CTAPrimary>
              <CTAGhost href="#diferenciais">
                Por que somos diferentes? →
              </CTAGhost>
            </div>

            <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-[12px]" style={{ color: '#999' }}>
              <span className="flex items-center gap-2">
                <IconShield />
                Orçamento grátis em 24h
              </span>
              <span className="w-px h-4 bg-zinc-200" />
              <span className="flex items-center gap-2">
                <IconClock />
                Sem compromisso
              </span>
              <span className="w-px h-4 bg-zinc-200" />
              <span className="flex items-center gap-2">
                <IconCheck />
                Parcele em 2×
              </span>
            </div>
          </div>
        </section>

        {/* ── PROBLEM ──────────────────────────────────────────────────────── */}
        <section
          id="o-problema"
          aria-labelledby="problem-heading"
          className="py-24 sm:py-32 relative"
          style={{ background: '#f5f5f0' }}
        >
          <div className="absolute inset-0 pointer-events-none" aria-hidden>
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.06), transparent)' }} />
          </div>

          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-16">
              <div className="flex justify-center">
                <SectionLabel>O problema</SectionLabel>
              </div>
              <h2
                id="problem-heading"
                className="text-3xl sm:text-[44px] font-bold text-[#0d0d0d] leading-[1.15] tracking-tight mt-2"
              >
                A maioria dos sites são bonitos.<br />
                <span style={{ color: '#999' }}>Mas bonito não paga boleto.</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {PROBLEMS.map((p, index) => (
                <GlassCard
                  key={p.stat}
                  className="p-8 text-center hover:shadow-xl hover:-translate-y-1"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <p className="text-[60px] font-black mb-2 leading-none" style={{ color: '#b45309' }}>{p.stat}</p>
                  <p className="text-[11px] font-medium uppercase tracking-wider mb-3" style={{ color: '#999' }}>{p.label}</p>
                  <p className="text-[14px] leading-relaxed" style={{ color: '#666' }}>{p.desc}</p>
                </GlassCard>
              ))}
            </div>

            <div
              className="mt-6 rounded-2xl px-8 py-6 text-center backdrop-blur-sm"
              style={{
                background: 'rgba(250,204,21,0.04)',
                border: '1px solid rgba(250,204,21,0.08)',
              }}
            >
              <p className="text-[14px] leading-relaxed" style={{ color: '#666' }}>
                <span className="text-[#0d0d0d] font-semibold">Sites genéricos de IA são todos iguais</span>
                {' '}— seu negócio merece algo feito estrategicamente para converter. É exatamente isso que a TopSite faz.
              </p>
            </div>
          </div>
        </section>

        {/* ── DIFFERENTIALS ────────────────────────────────────────────────── */}
        <section
          id="diferenciais"
          aria-labelledby="diff-heading"
          className="py-24 sm:py-32"
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-16">
              <div className="flex justify-center">
                <SectionLabel>Nosso diferencial</SectionLabel>
              </div>
              <h2
                id="diff-heading"
                className="text-3xl sm:text-[44px] font-bold text-[#0d0d0d] leading-[1.15] tracking-tight mt-2"
              >
                O que justifica ser premium
              </h2>
              <p className="mt-4 max-w-lg mx-auto text-[16px] leading-relaxed" style={{ color: '#666' }}>
                Não somos mais um serviço de site — somos estratégia digital que usa
                desenvolvimento e SEO para gerar resultado real.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {DIFFERENTIALS.map((d, index) => (
                <div
                  key={d.title}
                  className="group flex items-start gap-6 p-7 rounded-2xl transition-all duration-500 hover:shadow-xl hover:-translate-y-1"
                  style={{
                    background: '#ffffff',
                    border: '1px solid rgba(0,0,0,0.05)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110"
                    style={{
                      background: 'linear-gradient(135deg, rgba(250,204,21,0.12), rgba(180,83,9,0.08))',
                      border: '1px solid rgba(250,204,21,0.15)',
                      color: '#b45309',
                    }}
                  >
                    <d.Icon />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#0d0d0d] text-[16px] mb-2">{d.title}</h3>
                    <p className="text-[14px] leading-relaxed" style={{ color: '#666' }}>{d.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PORTFOLIO ────────────────────────────────────────────────────── */}
        <section
          id="portfolio"
          aria-labelledby="portfolio-heading"
          className="py-24 sm:py-32"
          style={{ background: '#f5f5f0' }}
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-16">
              <div className="flex justify-center">
                <SectionLabel>Portfólio</SectionLabel>
              </div>
              <h2
                id="portfolio-heading"
                className="text-3xl sm:text-[44px] font-bold text-[#0d0d0d] leading-[1.15] tracking-tight mt-2"
              >
                Sites que já colocamos no ar
              </h2>
              <p className="mt-3 text-[15px]" style={{ color: '#666' }}>
                Cada um desenvolvido à mão, com estratégia e SEO desde o primeiro dia.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {PORTFOLIO.map((p) => (
                <div
                  key={p.src}
                  className="group rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 cursor-pointer"
                  style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.05)' }}
                >
                  <div className="aspect-square relative overflow-hidden">
                    <img
                      src={p.src}
                      alt={`Site TopSite — ${p.segment}`}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        background: `linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)`,
                      }}
                    />
                    <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                      <span
                        className="inline-block px-3 py-1 rounded-full text-[10px] font-semibold text-white"
                        style={{ background: p.color }}
                      >
                        {p.segment}
                      </span>
                    </div>
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-[12px] font-medium" style={{ color: '#999' }}>{p.segment}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 flex items-center justify-center gap-4">
              <div className="flex -space-x-2">
                {['#2563eb', '#7c3aed', '#d97706', '#16a34a'].map((c, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full ring-2 ring-white"
                    style={{ background: c }}
                  />
                ))}
              </div>
              <p className="text-[14px]" style={{ color: '#666' }}>
                <span className="text-[#0d0d0d] font-semibold">+50 negócios</span> confiam na TopSite
              </p>
            </div>
          </div>
        </section>

        {/* ── FOR WHOM ─────────────────────────────────────────────────────── */}
        <section
          id="para-quem"
          aria-labelledby="forwho-heading"
          className="py-24 sm:py-32"
        >
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <div className="flex justify-center">
              <SectionLabel>Para quem é</SectionLabel>
            </div>
            <h2
              id="forwho-heading"
              className="text-3xl sm:text-[44px] font-bold text-[#0d0d0d] leading-[1.15] tracking-tight mt-2 mb-6"
            >
              Para quem leva o próprio<br />negócio a sério
            </h2>
            <p className="text-[16px] leading-relaxed mb-14 max-w-lg mx-auto" style={{ color: '#666' }}>
              Um site profissional não é custo — é investimento que se paga.{' '}
              <span className="text-[#0d0d0d] font-medium">Se você entende que presença digital gera clientes</span>{' '}
              e quer um site estratégico feito para converter, estamos aqui para isso.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-left">
              {FOR_WHOM.map((item) => (
                <div
                  key={item.title}
                  className="group p-7 rounded-2xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                  style={{
                    background: '#ffffff',
                    border: '1px solid rgba(0,0,0,0.05)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                  }}
                >
                  <div className="text-3xl mb-4">{item.icon}</div>
                  <h3 className="font-semibold text-[#0d0d0d] text-[15px] mb-2">{item.title}</h3>
                  <p className="text-[14px] leading-relaxed" style={{ color: '#666' }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── OFFER ────────────────────────────────────────────────────────── */}
        <section
          id="oferta"
          aria-labelledby="offer-heading"
          className="py-24 sm:py-32 relative overflow-hidden"
          style={{ background: '#f5f5f0' }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            aria-hidden
            style={{
              background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(250,204,21,0.04) 0%, transparent 60%)',
            }}
          />

          <div className="relative max-w-xl mx-auto px-4 sm:px-6 text-center">
            <div className="flex justify-center">
              <SectionLabel>Investimento</SectionLabel>
            </div>
            <h2
              id="offer-heading"
              className="text-3xl sm:text-[44px] font-bold text-[#0d0d0d] leading-[1.15] tracking-tight mt-2 mb-12"
            >
              Preço justo para um<br />
              <span style={{ color: '#b45309' }}>resultado de verdade</span>
            </h2>

            <GlassCard className="p-10 sm:p-12 relative overflow-hidden">
              <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{
                  background: 'linear-gradient(90deg, #facc15, #b45309, #f59e0b)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 3s ease-in-out infinite',
                }}
              />

              <p className="text-[10px] tracking-[0.2em] uppercase mb-4" style={{ color: '#999' }}>
                Sites a partir de
              </p>
              <p className="text-[80px] sm:text-[100px] font-black leading-none mb-4" style={{ color: '#b45309' }}>
                R$497
              </p>
              <p className="text-[14px] mb-10" style={{ color: '#666' }}>
                O valor varia conforme escopo e complexidade do projeto.
              </p>

              <div
                className="inline-flex items-center gap-3 rounded-full px-5 py-2.5 mb-10 text-[13px]"
                style={{
                  background: 'rgba(250,204,21,0.06)',
                  border: '1px solid rgba(250,204,21,0.12)',
                }}
              >
                <span className="font-medium" style={{ color: '#b45309' }}>
                  Pagamento em 2× sem juros
                </span>
                <span style={{ color: '#ccc' }}>—</span>
                <span style={{ color: '#888' }}>metade agora, metade no próximo mês</span>
              </div>

              <ul className="space-y-3.5 text-left mb-10">
                {CHECKLIST.map((item) => (
                  <li key={item} className="flex items-start gap-3.5 text-[14px]" style={{ color: '#555' }}>
                    <span className="mt-0.5 shrink-0 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'rgba(180,83,9,0.08)' }}>
                      <IconCheck />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>

              <CTAPrimary href="/orcamento" size="xl" className="!px-12 !py-5 !text-[16px] w-full sm:w-auto">
                MONTAR MEU ORÇAMENTO
                <IconArrow />
              </CTAPrimary>
              <p className="text-[12px] mt-5" style={{ color: '#aaa' }}>
                Sem compromisso · Orçamento gratuito em até 24h
              </p>
            </GlassCard>
          </div>
        </section>

        {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
        <section
          id="como-funciona"
          aria-labelledby="steps-heading"
          className="py-24 sm:py-32"
        >
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-16">
              <div className="flex justify-center">
                <SectionLabel>Como funciona</SectionLabel>
              </div>
              <h2
                id="steps-heading"
                className="text-3xl sm:text-[44px] font-bold text-[#0d0d0d] leading-[1.15] tracking-tight mt-2"
              >
                Do briefing ao site<br />vendendo em 4 passos
              </h2>
            </div>

            <div className="relative">
              {/* Connecting line */}
              <div
                className="absolute left-[19px] top-12 bottom-12 w-0.5 hidden sm:block"
                style={{ background: 'linear-gradient(to bottom, #facc15, #b45309)' }}
              />

              <ol className="space-y-4" aria-label="Processo de criação do site">
                {STEPS.map((step, index) => (
                  <li
                    key={step.num}
                    className="group flex items-start gap-6 p-6 rounded-2xl transition-all duration-300 hover:shadow-lg"
                    style={{
                      background: '#ffffff',
                      border: '1px solid rgba(0,0,0,0.04)',
                    }}
                  >
                    <div
                      className="relative z-10 w-10 h-10 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0 transition-all duration-300 group-hover:scale-110"
                      style={{
                        background: index === 0 ? 'linear-gradient(135deg, #facc15, #f59e0b)' : '#f5f5f0',
                        color: index === 0 ? '#000' : '#999',
                        border: index === 0 ? 'none' : '1px solid rgba(0,0,0,0.06)',
                      }}
                      aria-hidden="true"
                    >
                      {step.num}
                    </div>
                    <div className="flex-1 pt-0.5">
                      <h3 className="font-semibold text-[#0d0d0d] text-[16px] mb-1.5">{step.title}</h3>
                      <p className="text-[14px] leading-relaxed" style={{ color: '#666' }}>{step.desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ─────────────────────────────────────────────────── */}
        <section
          id="depoimentos"
          aria-labelledby="reviews-heading"
          className="py-24 sm:py-32"
          style={{ background: '#f5f5f0' }}
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-16">
              <div className="flex justify-center">
                <SectionLabel>Resultados reais</SectionLabel>
              </div>
              <h2
                id="reviews-heading"
                className="text-3xl sm:text-[44px] font-bold text-[#0d0d0d] leading-[1.15] tracking-tight mt-2"
              >
                Negócios que pararam de perder<br />clientes para a concorrência
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {TESTIMONIALS.map((t) => (
                <article
                  key={t.name}
                  className="group p-7 rounded-2xl flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                  style={{
                    background: '#ffffff',
                    border: '1px solid rgba(0,0,0,0.04)',
                  }}
                  itemScope
                  itemType="https://schema.org/Review"
                >
                  <div className="flex gap-0.5 mb-5" aria-label="Avaliação 5 estrelas">
                    {[...Array(5)].map((_, i) => <IconStar key={i} />)}
                  </div>
                  <blockquote
                    className="text-[14px] leading-relaxed mb-6 flex-1"
                    style={{ color: '#555' }}
                    itemProp="reviewBody"
                  >
                    &ldquo;{t.text}&rdquo;
                  </blockquote>
                  <div className="flex items-center gap-3 pt-4 border-t" style={{ borderColor: 'rgba(0,0,0,0.04)' }}>
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-bold text-white shrink-0"
                      style={{ background: t.color }}
                      aria-hidden="true"
                    >
                      {t.initial}
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-[#0d0d0d]" itemProp="name">{t.name}</p>
                      <p className="text-[12px]" style={{ color: '#999' }}>{t.role}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ───────────────────────────────────────────────────────────── */}
        <section
          id="faq"
          aria-labelledby="faq-heading"
          className="py-24 sm:py-32"
        >
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-16">
              <div className="flex justify-center">
                <SectionLabel>Dúvidas</SectionLabel>
              </div>
              <h2
                id="faq-heading"
                className="text-3xl sm:text-[44px] font-bold text-[#0d0d0d] leading-[1.15] tracking-tight mt-2"
              >
                Perguntas frequentes
              </h2>
            </div>

            <div className="space-y-3">
              {FAQS.map((faq, index) => (
                <details
                  key={faq.q}
                  className="group rounded-2xl transition-all duration-300 hover:shadow-md"
                  style={{
                    background: '#ffffff',
                    border: '1px solid rgba(0,0,0,0.04)',
                  }}
                  open={index === 0}
                >
                  <summary className="flex items-center justify-between cursor-pointer list-none p-6">
                    <span className="font-semibold text-[#0d0d0d] text-[15px] pr-4">{faq.q}</span>
                    <span
                      className="text-[#b45309] text-sm transition-transform duration-300 group-open:rotate-180"
                      style={{ fontSize: '18px' }}
                    >
                      ▾
                    </span>
                  </summary>
                  <div className="px-6 pb-6">
                    <p className="text-[14px] leading-relaxed" style={{ color: '#666' }}>
                      {faq.a}
                    </p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ────────────────────────────────────────────────────── */}
        <section
          id="comecar"
          aria-labelledby="cta-heading"
          className="py-32 sm:py-44 relative overflow-hidden"
          style={{ background: '#0d0d0d' }}
        >
          {/* Animated background */}
          <div
            className="absolute inset-0 pointer-events-none"
            aria-hidden
            style={{
              background: 'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(250,204,21,0.06) 0%, transparent 60%)',
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            aria-hidden
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.02) 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />

          <div className="relative max-w-2xl mx-auto px-4 sm:px-6 text-center">
            <div className="flex justify-center">
              <SectionLabel>Não espere mais</SectionLabel>
            </div>
            <h2
              id="cta-heading"
              className="text-[40px] sm:text-[56px] font-bold text-white leading-[1.1] tracking-tight mt-4 mb-6"
            >
              Pare de perder clientes<br />
              <span style={{ color: '#facc15' }}>para quem aparece no Google</span>
            </h2>
            <p className="text-[16px] leading-relaxed mb-12 max-w-lg mx-auto" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Cada dia sem um site estratégico é um dia de clientes indo para o concorrente.
              Monte seu orçamento agora — é gratuito e sem compromisso.
            </p>

            <CTAPrimary href="/orcamento" size="xl" className="!px-12 !py-5 !text-[17px] !shadow-[0_8px_40px_rgba(250,204,21,0.3)]">
              MONTAR MEU ORÇAMENTO
              <IconArrow />
            </CTAPrimary>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-[12px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
              <span className="flex items-center gap-2">
                <IconShield />
                Orçamento gratuito em 24h
              </span>
              <span className="w-px h-3 bg-white/10" />
              <span className="flex items-center gap-2">
                <IconClock />
                Parcele em 2× sem juros
              </span>
              <span className="w-px h-3 bg-white/10" />
              <span className="flex items-center gap-2">
                <IconCheck />
                Sem contrato
              </span>
            </div>

            <div className="mt-12 pt-8" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-[12px] mb-3" style={{ color: 'rgba(255,255,255,0.3)' }}>Prefere falar primeiro?</p>
              <a
                href={wa(MSG_DOUBT)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 text-[14px] transition-colors hover:text-white/60"
                style={{ color: 'rgba(255,255,255,0.4)' }}
                aria-label="Tirar dúvidas no WhatsApp"
              >
                <WAIcon className="w-5 h-5 text-green-500" />
                Falar no WhatsApp
              </a>
            </div>
          </div>
        </section>

        {/* ── FOOTER ───────────────────────────────────────────────────────── */}
        <footer
          className="py-12"
          style={{ background: '#0a0a0a', borderTop: '1px solid rgba(255,255,255,0.04)' }}
          aria-label="Rodapé"
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
            <a href="/" aria-label="TOP SITE — página inicial" className="hover:opacity-70 transition-opacity">
              <Image src="/logo.png" alt="TOP SITE" width={100} height={34} className="h-7 w-auto brightness-0 invert" />
            </a>
            <p className="text-[12px] text-center order-last sm:order-none" style={{ color: 'rgba(255,255,255,0.2)' }}>
              © {new Date().getFullYear()} TOP SITE &middot;{' '}
              <a href="/termos" className="hover:text-white/40 transition-colors">Termos</a>
              {' '}·{' '}
              <a href="/privacidade" className="hover:text-white/40 transition-colors">Privacidade</a>
              {' '}·{' '}
              <a href="/login" className="hover:text-white/40 transition-colors">Área do cliente</a>
            </p>
            <a
              href={wa(MSG_DOUBT)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[12px] transition-colors hover:text-white/40"
              style={{ color: 'rgba(255,255,255,0.2)' }}
              aria-label="Contato via WhatsApp"
            >
              <WAIcon className="w-4 h-4 text-green-500" />
              +55 18 99674-2364
            </a>
          </div>
        </footer>

      </div>

      {/* ─── Global styles ────────────────────────────────────────────────── */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
          ::selection {
            background: #facc15;
            color: #0d0d0d;
          }
        `
      }} />
    </>
  )
}