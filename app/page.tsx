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

/* ─── SVG Icons ──────────────────────────────────────────────────────────── */

function WAIcon({ className = 'w-5 h-5' }: { className?: string }) {
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
  return <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-yellow-400" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
}

function IconHand() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6" aria-hidden="true"><path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg>
}

function IconTarget() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6" aria-hidden="true"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
}

function IconSearch() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
}

function IconZap() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6" aria-hidden="true"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
}

function IconCheck() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>
}

function IconArrow() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
}

/* ─── CTA Button ─────────────────────────────────────────────────────────── */

function CTAPrimary({ href, children, size = 'md' }: { href: string; children: React.ReactNode; size?: 'md' | 'lg' | 'xl' }) {
  const sizes = {
    md:  'px-6 py-3 text-sm',
    lg:  'px-8 py-4 text-base',
    xl:  'px-10 py-5 text-lg',
  }
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center gap-2.5 bg-yellow-400 hover:bg-yellow-300 text-black font-black rounded-2xl transition-all duration-200 hover:shadow-[0_0_32px_rgba(250,204,21,0.45)] hover:scale-[1.02] active:scale-[0.98] ${sizes[size]}`}
    >
      {children}
    </Link>
  )
}

/* ─── Static data ────────────────────────────────────────────────────────── */

const DIFFERENTIALS = [
  {
    Icon: IconHand,
    title: 'Personalizado e avançado',
    desc: 'Cada site é feito à mão, sob medida para o seu negócio e segmento. Não é template de IA que todo mundo usa — é um projeto exclusivo.',
  },
  {
    Icon: IconTarget,
    title: 'Focado em conversão',
    desc: 'Cada elemento é pensado para transformar visitante em cliente: CTAs estratégicos, jornada de compra clara e gatilhos de decisão no lugar certo.',
  },
  {
    Icon: IconSearch,
    title: 'SEO avançado',
    desc: 'Seu site otimizado de forma técnica para aparecer no Google quando alguém procura pelo seu serviço na sua cidade. Não é SEO básico de template.',
  },
  {
    Icon: IconZap,
    title: 'Performance real',
    desc: 'Sites rápidos convertem mais e ranqueiam melhor. Desenvolvemos com código limpo, imagens otimizadas e carregamento rápido em qualquer dispositivo.',
  },
]

const PROBLEMS = [
  { stat: '90%', text: 'dos sites não aparecem na primeira página do Google — e quem não aparece, não existe para o cliente.' },
  { stat: '3s', text: 'é o tempo máximo que o visitante espera o site carregar. Sites lentos perdem clientes antes mesmo de mostrar o serviço.' },
  { stat: '0', text: 'conversões vêm de sites genéricos de IA — todos iguais, sem personalidade, sem estratégia, sem diferencial.' },
]

const STEPS = [
  {
    num: '01',
    title: 'Entendemos o seu negócio',
    desc: 'Analisamos seu mercado, seus concorrentes e o perfil do seu cliente ideal antes de escrever uma linha de código.',
  },
  {
    num: '02',
    title: 'Planejamos a estratégia',
    desc: 'Mapeamos a jornada do visitante, definimos os CTAs, a estrutura de SEO e a hierarquia visual que vai converter.',
  },
  {
    num: '03',
    title: 'Desenvolvemos personalizado',
    desc: 'Desenvolvemos do zero: design exclusivo, código limpo, SEO técnico e performance. Sem templates. Sem atalhos.',
  },
  {
    num: '04',
    title: 'Seu site vai ao ar vendendo',
    desc: 'Publicamos com hospedagem, SSL e monitoramento. Você começa a receber visitantes e clientes desde o primeiro dia.',
  },
]

const PORTFOLIO = [
  { src: '/portfolio/site1.jpg', segment: 'Restaurante' },
  { src: '/portfolio/site2.jpg', segment: 'Energia Solar' },
  { src: '/portfolio/site3.jpg', segment: 'Direito' },
  { src: '/portfolio/site4.jpg', segment: 'Empresa de Crédito' },
]

const TESTIMONIALS = [
  {
    text: 'Antes eu tinha um site que ninguém achava. Agora apareço no Google e recebo contatos toda semana de clientes novos. Valeu cada centavo.',
    name: 'Marcos A.',
    role: 'Escritório de Advocacia · SP',
    initial: 'M',
    color: '#1d4ed8',
  },
  {
    text: 'Minha clínica triplicou os agendamentos online em dois meses. O site deles não é só bonito — ele realmente converte.',
    name: 'Dra. Renata S.',
    role: 'Clínica Estética · RJ',
    initial: 'R',
    color: '#7c3aed',
  },
  {
    text: 'Já tinha tentado fazer sozinho no Wix. Não funcionou. Com a TopSite, em 30 dias meu site estava ranqueando para termos do meu bairro.',
    name: 'Roberto F.',
    role: 'Empresa de Energia Solar · MG',
    initial: 'R',
    color: '#d97706',
  },
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

      <div className="bg-[#0a0a0a] text-white antialiased">

        {/* ── NAV ─────────────────────────────────────────────────────────── */}
        <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#0a0a0a]/95 backdrop-blur-sm">
          <nav className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between" aria-label="Navegação principal">
            <a href="/" aria-label="TOP SITE — página inicial">
              <Image src="/logo.png" alt="TOP SITE" width={120} height={40} className="h-8 w-auto" priority />
            </a>
            <div className="flex items-center gap-3">
              <a
                href="/login"
                className="flex items-center gap-1.5 border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white text-xs font-medium px-3.5 py-2 rounded-xl transition-all"
                aria-label="Acessar painel do cliente"
              >
                <UserIcon />
                <span className="hidden sm:inline">Acessar painel</span>
                <span className="sm:hidden">Entrar</span>
              </a>
              <CTAPrimary href="/orcamento" size="md">
                <span className="hidden sm:inline">Montar meu orçamento</span>
                <span className="sm:hidden">Orçamento</span>
              </CTAPrimary>
            </div>
          </nav>
        </header>

        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        <section id="hero" aria-labelledby="hero-heading" className="relative overflow-hidden py-24 sm:py-32 lg:py-40">
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% -5%, rgba(250,204,21,0.11) 0%, transparent 65%)' }} aria-hidden="true" />
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '28px 28px' }} aria-hidden="true" />

          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 border border-yellow-400/20 rounded-full px-4 py-1.5 text-xs font-semibold text-yellow-400/80 mb-8" style={{ background: 'rgba(250,204,21,0.05)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse shrink-0" aria-hidden="true" />
              +50 negócios confiam na TopSite
            </div>

            {/* H1 */}
            <h1 id="hero-heading" className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.06] tracking-tight text-white mb-6">
              Seu site deveria estar{' '}
              <span className="text-yellow-400">VENDENDO</span>{' '}
              por você —<br className="hidden sm:block" />
              não só existindo.
            </h1>

            <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-4 leading-relaxed">
              Criamos sites <strong className="text-white font-semibold">personalizados e avançados</strong>, focados em conversão e SEO —
              para transformar visitante em cliente e aparecer no Google.
            </p>

            {/* Seal */}
            <div className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-full px-5 py-2 text-sm text-zinc-300 mb-10 font-medium">
              A partir de
              <span className="text-yellow-400 font-black text-base">R$497</span>
              <span className="text-zinc-600">·</span>
              <span className="text-zinc-400 text-xs">parcele em 2x</span>
            </div>

            {/* Trust pills */}
            <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-10 text-sm text-zinc-500 list-none" aria-label="Diferenciais">
              {['Feito à mão — não é template', 'SEO técnico avançado', 'Focado em converter'].map((t) => (
                <li key={t} className="flex items-center gap-1.5">
                  <span className="text-yellow-400"><IconCheck /></span>
                  {t}
                </li>
              ))}
            </ul>

            {/* CTA group */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <CTAPrimary href="/orcamento" size="lg">
                MONTAR MEU ORÇAMENTO
                <IconArrow />
              </CTAPrimary>
              <a href="#diferenciais" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors px-2 py-4">
                Por que somos diferentes? →
              </a>
            </div>
          </div>
        </section>

        {/* ── PROBLEM ──────────────────────────────────────────────────────── */}
        <section id="o-problema" aria-labelledby="problem-heading" className="py-20 sm:py-24 border-t border-white/[0.04]" style={{ background: '#0d0d0d' }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-14">
              <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-3">O problema</p>
              <h2 id="problem-heading" className="text-3xl sm:text-4xl font-black text-white leading-tight">
                A maioria dos sites são bonitos.<br />
                <span className="text-zinc-400">Mas bonito não paga boleto.</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {PROBLEMS.map((p) => (
                <div
                  key={p.stat}
                  className="rounded-2xl border border-white/[0.06] p-7 text-center"
                  style={{ background: '#111111' }}
                >
                  <p className="text-5xl font-black text-yellow-400 mb-3">{p.stat}</p>
                  <p className="text-sm text-zinc-400 leading-relaxed">{p.text}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-2xl border border-yellow-400/10 px-6 py-5 text-center" style={{ background: 'rgba(250,204,21,0.03)' }}>
              <p className="text-zinc-400 text-base leading-relaxed">
                <strong className="text-white">Sites genéricos de IA são todos iguais</strong> — seu negócio merece algo
                feito estrategicamente para converter. É exatamente isso que a TopSite faz.
              </p>
            </div>
          </div>
        </section>

        {/* ── DIFFERENTIALS ────────────────────────────────────────────────── */}
        <section id="diferenciais" aria-labelledby="diff-heading" className="py-20 sm:py-24 bg-white text-gray-900">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-14">
              <p className="text-[11px] font-bold uppercase tracking-widest text-yellow-600 mb-3">Nosso diferencial</p>
              <h2 id="diff-heading" className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight">
                O que justifica ser premium
              </h2>
              <p className="text-gray-500 mt-4 max-w-xl mx-auto text-sm sm:text-base">
                Não somos mais um serviço de site. Somos uma equipe de estratégia digital que usa
                desenvolvimento e SEO para gerar resultado real.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {DIFFERENTIALS.map((d) => (
                <div
                  key={d.title}
                  className="flex items-start gap-5 p-6 rounded-2xl border border-gray-100 hover:border-yellow-200 hover:shadow-lg transition-all"
                >
                  <div className="w-12 h-12 rounded-2xl bg-yellow-50 border border-yellow-100 flex items-center justify-center shrink-0 text-yellow-700">
                    <d.Icon />
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900 text-base mb-1.5">{d.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{d.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PORTFOLIO ────────────────────────────────────────────────────── */}
        <section id="portfolio" aria-labelledby="portfolio-heading" className="py-20 sm:py-24 border-t border-white/[0.04]" style={{ background: '#0d0d0d' }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-3">Portfólio</p>
              <h2 id="portfolio-heading" className="text-3xl sm:text-4xl font-black text-white leading-tight">
                Sites que já colocamos no ar —<br className="hidden sm:block" />
                feitos para vender
              </h2>
              <p className="text-zinc-500 mt-3 text-sm">Cada um desenvolvido à mão, com estratégia e SEO desde o primeiro dia.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {PORTFOLIO.map((p) => (
                <div key={p.src} className="rounded-2xl overflow-hidden border border-white/[0.06]" style={{ background: '#111111' }}>
                  <div className="aspect-square">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.src} alt={`Site TopSite — ${p.segment}`} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <div className="px-3 py-2.5">
                    <p className="text-zinc-400 text-[11px] font-semibold">{p.segment}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex items-center justify-center gap-3">
              <div className="flex -space-x-2">
                {['#1d4ed8','#7c3aed','#d97706','#15803d'].map((c, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0d0d0d]" style={{ background: c }} />
                ))}
              </div>
              <p className="text-sm text-zinc-400">
                <strong className="text-white">+50 negócios</strong> confiam na TopSite
              </p>
            </div>
          </div>
        </section>

        {/* ── FOR WHOM ─────────────────────────────────────────────────────── */}
        <section id="para-quem" aria-labelledby="forwho-heading" className="py-20 sm:py-24 bg-white text-gray-900">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <p className="text-[11px] font-bold uppercase tracking-widest text-yellow-600 mb-3">Para quem é</p>
            <h2 id="forwho-heading" className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight mb-6">
              Para quem leva o próprio<br />negócio a sério
            </h2>
            <p className="text-gray-500 text-base leading-relaxed mb-10 max-w-xl mx-auto">
              Um site profissional não é custo — é investimento que se paga.{' '}
              <strong className="text-gray-900">Se você entende que presença digital gera clientes</strong>{' '}
              e quer um site estratégico feito para converter, estamos aqui para isso.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left mb-10">
              {[
                { emoji: '🏢', title: 'Pequenas empresas', desc: 'Que querem competir com grandes e aparecer no Google da sua região.' },
                { emoji: '🚀', title: 'Negócios em crescimento', desc: 'Que precisam de um site que acompanhe a expansão e gere demanda.' },
                { emoji: '💼', title: 'Profissionais liberais', desc: 'Advogados, médicos, arquitetos e consultores que querem mais clientes qualificados.' },
              ].map((item) => (
                <div key={item.title} className="p-5 rounded-2xl border border-gray-100 bg-gray-50">
                  <div className="text-2xl mb-3">{item.emoji}</div>
                  <h3 className="font-black text-gray-900 text-sm mb-1">{item.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── OFFER ────────────────────────────────────────────────────────── */}
        <section id="oferta" aria-labelledby="offer-heading" className="py-20 sm:py-24 relative overflow-hidden" style={{ background: '#0a0a0a' }}>
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(250,204,21,0.07) 0%, transparent 65%)' }} aria-hidden="true" />
          <div className="relative max-w-2xl mx-auto px-4 sm:px-6 text-center">
            <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-3">Investimento</p>
            <h2 id="offer-heading" className="text-3xl sm:text-4xl font-black text-white leading-tight mb-4">
              Preço justo para um<br />
              <span className="text-yellow-400">resultado de verdade</span>
            </h2>

            <div className="mt-8 rounded-3xl border border-yellow-400/20 p-8 sm:p-10" style={{ background: 'rgba(250,204,21,0.04)' }}>
              <p className="text-zinc-500 text-sm uppercase tracking-widest font-bold mb-2">Sites a partir de</p>
              <p className="text-6xl sm:text-7xl font-black text-yellow-400 leading-none mb-2">R$497</p>
              <p className="text-zinc-400 text-sm mb-8">O valor varia conforme escopo e complexidade do projeto.</p>

              <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-2xl px-6 py-4 mb-8">
                <p className="text-yellow-300 text-sm font-bold mb-1">Condição exclusiva de pagamento</p>
                <p className="text-zinc-300 text-sm leading-relaxed">
                  Parcele em <strong className="text-white">2x sem juros</strong>: metade na contratação e a outra metade só no mês seguinte.
                  Você começa sem comprometer o fluxo de caixa.
                </p>
              </div>

              <ul className="space-y-2.5 text-left mb-8">
                {[
                  'Site personalizado feito à mão, não é template',
                  'SEO técnico avançado desde o primeiro dia',
                  'Otimizado para converter visitante em cliente',
                  'Hospedagem, SSL e monitoramento incluídos',
                  'Suporte via WhatsApp direto com a equipe',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-zinc-300">
                    <span className="mt-0.5 text-yellow-400 shrink-0"><IconCheck /></span>
                    {item}
                  </li>
                ))}
              </ul>

              <CTAPrimary href="/orcamento" size="xl">
                MONTAR MEU ORÇAMENTO
                <IconArrow />
              </CTAPrimary>
              <p className="text-zinc-600 text-xs mt-4">Sem compromisso. Orçamento gratuito em até 24h.</p>
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
        <section id="como-funciona" aria-labelledby="steps-heading" className="py-20 sm:py-24 bg-white text-gray-900">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-14">
              <p className="text-[11px] font-bold uppercase tracking-widest text-yellow-600 mb-3">Como funciona</p>
              <h2 id="steps-heading" className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight">
                Do briefing ao site<br />vendendo em 4 passos
              </h2>
            </div>

            <ol className="space-y-6" aria-label="Processo de criação do site">
              {STEPS.map((step) => (
                <li key={step.num} className="flex items-start gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-yellow-400 flex items-center justify-center shrink-0 font-black text-black text-sm" aria-hidden="true">
                    {step.num}
                  </div>
                  <div className="flex-1 pt-2">
                    <h3 className="font-black text-gray-900 text-base sm:text-lg mb-1">{step.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── TESTIMONIALS ─────────────────────────────────────────────────── */}
        <section id="depoimentos" aria-labelledby="reviews-heading" className="py-20 sm:py-24" style={{ background: '#0d0d0d' }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-3">Resultados reais</p>
              <h2 id="reviews-heading" className="text-3xl sm:text-4xl font-black text-white leading-tight">
                Negócios que pararam de<br />perder clientes para a concorrência
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {TESTIMONIALS.map((t) => (
                <article key={t.name} className="rounded-2xl border border-white/[0.06] p-6 flex flex-col" style={{ background: '#111111' }} itemScope itemType="https://schema.org/Review">
                  <div className="flex gap-0.5 mb-4" aria-label="Avaliação 5 estrelas">
                    {[...Array(5)].map((_, i) => <IconStar key={i} />)}
                  </div>
                  <blockquote className="text-sm text-zinc-300 leading-relaxed mb-6 flex-1" itemProp="reviewBody">
                    &ldquo;{t.text}&rdquo;
                  </blockquote>
                  <div className="flex items-center gap-3" itemProp="author" itemScope itemType="https://schema.org/Person">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black text-white shrink-0" style={{ background: t.color }} aria-hidden="true">
                      {t.initial}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white" itemProp="name">{t.name}</p>
                      <p className="text-xs text-zinc-500">{t.role}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ────────────────────────────────────────────────────── */}
        <section id="comecar" aria-labelledby="cta-heading" className="py-24 sm:py-32 relative overflow-hidden" style={{ background: '#0a0a0a' }}>
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 100%, rgba(250,204,21,0.09) 0%, transparent 65%)' }} aria-hidden="true" />
          <div className="absolute inset-0 opacity-[0.025] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '28px 28px' }} aria-hidden="true" />

          <div className="relative max-w-2xl mx-auto px-4 sm:px-6 text-center">
            <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-4">Não espere mais</p>
            <h2 id="cta-heading" className="text-4xl sm:text-5xl font-black text-white leading-[1.08] mb-5">
              Pare de perder clientes<br />
              <span className="text-yellow-400">para quem aparece no Google</span>
            </h2>
            <p className="text-zinc-400 text-base leading-relaxed mb-10 max-w-lg mx-auto">
              Cada dia sem um site estratégico é um dia de clientes indo para o concorrente.
              Monte seu orçamento agora — é gratuito e sem compromisso.
            </p>

            <CTAPrimary href="/orcamento" size="xl">
              MONTAR MEU ORÇAMENTO
              <IconArrow />
            </CTAPrimary>

            <p className="text-zinc-600 text-xs mt-5">
              Orçamento gratuito em até 24h · Parcele em 2x · Sem contrato de fidelidade
            </p>

            <div className="mt-10 pt-8 border-t border-white/[0.04]">
              <p className="text-zinc-600 text-xs mb-2">Prefere falar primeiro?</p>
              <a
                href={wa(MSG_DOUBT)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
                aria-label="Tirar dúvidas no WhatsApp"
              >
                <WAIcon className="w-4 h-4 text-green-500" />
                Falar no WhatsApp
              </a>
            </div>
          </div>
        </section>

        {/* ── FOOTER ───────────────────────────────────────────────────────── */}
        <footer className="border-t border-white/[0.06] py-10" style={{ background: '#060606' }} aria-label="Rodapé" itemScope itemType="https://schema.org/WPFooter">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-5">
            <a href="/" aria-label="TOP SITE — página inicial">
              <Image src="/logo.png" alt="TOP SITE" width={100} height={34} className="h-7 w-auto" />
            </a>
            <p className="text-xs text-zinc-600 text-center order-last sm:order-none">
              © {new Date().getFullYear()} TOP SITE &middot;{' '}
              <a href="/termos" className="hover:text-zinc-400 transition-colors">Termos</a>{' '}·{' '}
              <a href="/privacidade" className="hover:text-zinc-400 transition-colors">Privacidade</a>{' '}·{' '}
              <a href="/login" className="hover:text-zinc-400 transition-colors">Área do cliente</a>
            </p>
            <a
              href={wa(MSG_DOUBT)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-zinc-500 hover:text-white transition-colors"
              aria-label="Contato via WhatsApp"
            >
              <WAIcon className="w-4 h-4 text-green-500" />
              +55 18 99674-2364
            </a>
          </div>
        </footer>

      </div>
    </>
  )
}
