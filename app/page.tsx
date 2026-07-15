import type { Metadata } from 'next'
import Image from 'next/image'

/* ─── WhatsApp ───────────────────────────────────────────────────────────── */

const WA_NUMBER = '5518996742364'
function wa(msg: string) {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`
}
const MSG_MAIN  = 'Olá! Quero criar meu site profissional por R$97. Pode me dar mais informações?'
const MSG_START = 'Olá! Quero começar meu site agora! Como funciona?'
const MSG_FAQ   = 'Olá! Tenho dúvidas sobre o site de R$97. Pode me ajudar?'

/* ─── SEO Metadata ───────────────────────────────────────────────────────── */

export const metadata: Metadata = {
  title: 'Site Profissional por R$97 — Pronto em 3 Dias | TOP SITE',
  description:
    'Site profissional para sua empresa por apenas R$97. Design personalizado, entrega em até 3 dias úteis e você só paga se aprovar. Ideal para MEI, restaurante, salão de beleza, clínica e pequenas empresas.',
  keywords:
    'site profissional, criar site empresa, site barato, site para MEI, site pequena empresa, site R$97, criação de site profissional, site para negócio, site para restaurante, site para salão de beleza, site para clínica, presença online, site profissional preço',
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
    title: 'Site Profissional por R$97 — Pronto em 3 Dias | TOP SITE',
    description:
      'Site profissional para sua empresa por R$97. Design personalizado, 3 dias de prazo, você só paga se aprovar.',
    siteName: 'TOP SITE',
    locale: 'pt_BR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Site Profissional por R$97 | TOP SITE',
    description: 'Site profissional para sua empresa por R$97. Design personalizado, pronto em 3 dias.',
  },
}

/* ─── JSON-LD Structured Data ────────────────────────────────────────────── */

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': '#organization',
      name: 'TOP SITE',
      description: 'Criação de sites profissionais para pequenas empresas e MEIs por R$97',
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
      description: 'Site profissional por R$97 — Pronto em 3 Dias',
      publisher: { '@id': '#organization' },
      inLanguage: 'pt-BR',
    },
    {
      '@type': 'Service',
      name: 'Criação de Site Profissional por R$97',
      description:
        'Site profissional com design personalizado para o seu negócio. Desenvolvido com IA, 100% responsivo, com integração WhatsApp e SEO básico. Entregamos em até 3 dias e você só paga após aprovação.',
      provider: { '@id': '#organization' },
      serviceType: 'Criação de Sites Profissionais',
      areaServed: { '@type': 'Country', name: 'Brazil' },
      offers: {
        '@type': 'Offer',
        price: '97.00',
        priceCurrency: 'BRL',
        availability: 'https://schema.org/InStock',
        priceValidUntil: '2026-12-31',
      },
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'O que está incluído no site de R$97?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Inclui: design personalizado para o seu segmento, site 100% responsivo (celular e computador), integração com botão do WhatsApp, SEO on-page básico para aparecer no Google, 1 página completa com todas as seções do seu negócio e os arquivos do site entregues para você.',
          },
        },
        {
          '@type': 'Question',
          name: 'Quanto tempo leva para o site ficar pronto?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'O protótipo é entregue em até 24 horas após você nos contar sobre o negócio. O site final, após sua aprovação, fica pronto em até 3 dias úteis.',
          },
        },
        {
          '@type': 'Question',
          name: 'E se eu não gostar do resultado?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Você vê o site antes de pagar qualquer coisa. Se não gostar, fazemos ajustes sem custo extra. Só cobramos os R$97 quando você estiver satisfeito.',
          },
        },
        {
          '@type': 'Question',
          name: 'Posso usar meu próprio domínio?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Sim! Se você tem um domínio (.com.br, .com etc.), usamos ele. Se não tiver, subimos o site em um endereço alternativo gratuito. Domínio personalizado pode ser contratado à parte quando quiser.',
          },
        },
        {
          '@type': 'Question',
          name: 'O site funciona bem no celular?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Sim, todos os sites são 100% responsivos. Funcionam perfeitamente em celulares, tablets e computadores. O design mobile é nossa prioridade, pois mais de 70% das buscas são feitas pelo celular.',
          },
        },
        {
          '@type': 'Question',
          name: 'Como funciona o pagamento?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Você só paga R$97 após aprovar o site. O pagamento é feito via Pix, cartão de crédito ou boleto. Não há cobrança antecipada.',
          },
        },
        {
          '@type': 'Question',
          name: 'Vocês fazem sites para qualquer tipo de negócio?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Sim! MEI, autônomo, restaurante, lanchonete, salão de beleza, barbearia, clínica, consultório, loja física, academia, personal trainer, fotógrafo e qualquer prestador de serviço.',
          },
        },
        {
          '@type': 'Question',
          name: 'Preciso saber de tecnologia para ter um site?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Não. Você nos conta sobre seu negócio pelo WhatsApp e cuidamos de todo o resto. Nome da empresa, o que faz, horário de funcionamento e formas de contato — é o suficiente.',
          },
        },
      ],
    },
  ],
}

/* ─── Inline SVG helpers ─────────────────────────────────────────────────── */

function Check({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  )
}

function WAIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

/* icon grid for features */
function IconPalette() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>
}
function IconPhone() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
}
function IconSearch() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
}
function IconShield() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
}
function IconDownload() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
}
function IconZap() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
}
function IconStar() {
  return <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-[#FFD100]"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
}
function UserIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
}

/* ─── Static data ────────────────────────────────────────────────────────── */

const STATS = [
  { value: '+50', label: 'Sites entregues' },
  { value: '< 24h', label: 'Primeiro protótipo' },
  { value: '100%', label: 'Mobile-first' },
  { value: 'R$0', label: 'Antes de aprovar' },
]

const INCLUDES = [
  { Icon: IconPalette, title: 'Design personalizado para o seu negócio', desc: 'Desenvolvido do zero para o seu segmento. Não é template genérico — cada detalhe é pensado para transmitir a identidade da sua empresa.' },
  { Icon: IconPhone, title: 'Site 100% responsivo (celular e desktop)', desc: 'Funciona perfeitamente em qualquer dispositivo. Mais de 70% dos seus futuros clientes vão acessar pelo celular.' },
  { Icon: WAIcon, title: 'Botão do WhatsApp integrado', desc: 'Qualquer visitante entra em contato direto com você em um clique. A forma mais rápida de converter visita em cliente.' },
  { Icon: IconSearch, title: 'SEO on-page para o Google', desc: 'Title, meta description, headings e estrutura otimizados. Seu site aparece quando alguém busca pelo seu serviço na sua cidade.' },
  { Icon: IconShield, title: 'Você aprova antes de pagar', desc: 'Vê o site pronto, pede ajustes se quiser e só paga os R$97 quando estiver 100% satisfeito. Risco zero.' },
  { Icon: IconDownload, title: 'Arquivos do site entregues para você', desc: 'Todos os arquivos HTML, CSS e imagens são seus. Pode hospedar em qualquer lugar agora ou no futuro.' },
]

const STEPS = [
  {
    title: 'Fale no WhatsApp — 2 minutos',
    desc: 'Conta sobre o seu negócio: nome da empresa, o que faz, como as pessoas te contratam e uma foto ou logo, se tiver. Nada técnico.',
  },
  {
    title: 'Receba o protótipo em até 24 horas',
    desc: 'Enviamos o link do site para você avaliar. Não gostou de algo? Pedimos ajustes até você aprovar — sem custo extra.',
  },
  {
    title: 'Aprove, pague R$97 e publique',
    desc: 'Com o site aprovado, o pagamento é feito via Pix, cartão ou boleto. Publicamos em até 3 dias úteis — ou entregamos os arquivos para você hospedar onde quiser.',
  },
]

const SEGMENTS = [
  'MEI e autônomo', 'Restaurante e pizzaria', 'Salão de beleza', 'Barbearia',
  'Clínica e consultório', 'Dentista', 'Psicólogo', 'Personal trainer',
  'Loja física', 'Academia', 'Confeitaria', 'Pet shop',
  'Fotógrafo', 'Advogado', 'Arquiteto', 'E muito mais',
]

const TESTIMONIALS = [
  {
    text: 'Em 2 dias tinha meu site no ar. Minha confeitaria apareceu no Google na primeira semana e já vieram clientes novos. Valeu demais os R$97.',
    name: 'Patrícia M.',
    role: 'Confeitaria Doce Sabor · SP',
    color: '#7c3aed',
  },
  {
    text: 'Não entendia nada de site. Só contei o que faço e eles criaram tudo. Hoje meus clientes encontram meu número direto pelo Google.',
    name: 'Carlos R.',
    role: 'Eletricista Autônomo · RJ',
    color: '#0891b2',
  },
  {
    text: 'Super profissional e muito rápido. Fiz no sábado e na segunda-feira o site já estava pronto para eu ver. Aprovei e publicou no mesmo dia.',
    name: 'Fernanda L.',
    role: 'Studio de Beleza · BH',
    color: '#be185d',
  },
]

const COMPARISON = [
  { label: 'Investimento',     us: 'R$97',             freelancer: 'R$800–R$3.000',      agency: 'R$2.500–R$10.000',   wix: 'R$60–150/mês*' },
  { label: 'Prazo',           us: 'Até 3 dias',        freelancer: '2–8 semanas',         agency: '4–12 semanas',        wix: 'Você mesmo configura' },
  { label: 'Design',          us: 'Personalizado',     freelancer: 'Personalizado',       agency: 'Personalizado',       wix: 'Template' },
  { label: 'Mobile-ready',    us: 'Sim',               freelancer: 'Depende',             agency: 'Sim',                 wix: 'Sim' },
  { label: 'SEO básico',      us: 'Incluído',          freelancer: 'Cobrado à parte',     agency: 'Cobrado à parte',     wix: 'Limitado' },
  { label: 'Você aprova antes de pagar', us: 'Sim',   freelancer: 'Raro',                agency: 'Raro',                wix: '—' },
  { label: 'Suporte',         us: 'Via WhatsApp',      freelancer: 'Eventual',            agency: 'Pago',                wix: 'Ticket / fórum' },
]

const FAQ = [
  {
    q: 'O que está incluído nos R$97?',
    a: 'Design personalizado para o seu segmento, site 100% responsivo, integração com WhatsApp, SEO on-page básico para aparecer no Google, página completa com todas as seções do seu negócio e os arquivos do site entregues para você. Tudo isso por um pagamento único.',
  },
  {
    q: 'Quanto tempo leva para o site ficar pronto?',
    a: 'O protótipo (primeiro rascunho do site) é entregue em até 24 horas após você nos contar sobre o negócio. Com ajustes e aprovação, o site final fica pronto em até 3 dias úteis.',
  },
  {
    q: 'E se eu não gostar do resultado?',
    a: 'Você vê o site antes de pagar qualquer coisa. Pedimos ajustes até você aprovar sem custo adicional. Só cobramos os R$97 quando você estiver 100% satisfeito. Se não quiser seguir em frente, não há nenhuma cobrança.',
  },
  {
    q: 'Posso usar meu próprio domínio (.com.br)?',
    a: 'Sim! Se você já tem um domínio, usamos ele. Se não tiver, subimos o site em um endereço alternativo gratuito. Você pode contratar um domínio personalizado à parte quando quiser.',
  },
  {
    q: 'O site vai aparecer no Google?',
    a: 'Sim. Todos os sites são entregues com SEO on-page básico: title, meta description, headings e estrutura semântica otimizados. Para aparecer nos primeiros resultados, o tempo depende da concorrência na sua região — mas a base técnica já está correta.',
  },
  {
    q: 'Preciso saber de tecnologia ou programação?',
    a: 'Não. Você nos conta sobre o seu negócio pelo WhatsApp — nome da empresa, o que faz, horário, fotos e como as pessoas te contratam. Cuidamos de tudo o mais.',
  },
  {
    q: 'Como funciona o pagamento?',
    a: 'Você só paga após aprovar o site. O pagamento de R$97 é feito via Pix, cartão de crédito ou boleto bancário. Não há cobrança antecipada.',
  },
  {
    q: 'Vocês fazem sites para qualquer tipo de negócio?',
    a: 'Sim! MEI, autônomo, restaurante, salão de beleza, barbearia, clínica, consultório, loja física, academia, personal trainer, fotógrafo, advogado e qualquer prestador de serviço. Se você tem um negócio, temos um site para você.',
  },
]

/* ─── CTA Button ─────────────────────────────────────────────────────────── */

function CTAButton({
  href,
  children,
  size = 'md',
}: {
  href: string
  children: React.ReactNode
  size?: 'md' | 'lg'
}) {
  const base =
    'inline-flex items-center justify-center gap-2.5 bg-green-500 hover:bg-green-400 text-white font-bold rounded-2xl transition-all shadow-lg shadow-green-500/20 hover:shadow-green-500/30 hover:scale-[1.02] active:scale-[0.99]'
  const sizes = { md: 'px-7 py-3.5 text-sm', lg: 'px-10 py-5 text-base' }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={`${base} ${sizes[size]}`}>
      {children}
    </a>
  )
}

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default function LandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="bg-black text-white antialiased">

        {/* ── NAV ── */}
        <header className="sticky top-0 z-50 border-b border-zinc-900 bg-black/95 backdrop-blur-sm">
          <nav
            className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between"
            aria-label="Navegação principal"
          >
            <a href="/" aria-label="TOP SITE — página inicial">
              <Image src="/logo.png" alt="TOP SITE" width={120} height={40} className="h-8 w-auto" priority />
            </a>
            <div className="flex items-center gap-3">
              <a
                href="/login"
                className="flex items-center gap-1.5 border border-zinc-800 hover:border-zinc-600 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-medium px-3.5 py-2 rounded-xl transition-all"
                aria-label="Acessar painel do cliente"
              >
                <UserIcon />
                <span className="hidden sm:inline">Acessar painel</span>
                <span className="sm:hidden">Entrar</span>
              </a>
              <CTAButton href={wa(MSG_MAIN)} size="md">
                <WAIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Quero meu site</span>
                <span className="sm:hidden">WhatsApp</span>
              </CTAButton>
            </div>
          </nav>
        </header>

        {/* ── HERO ── */}
        <section
          id="hero"
          aria-labelledby="hero-heading"
          className="relative overflow-hidden py-20 sm:py-28 lg:py-36"
        >
          {/* radial glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(255,209,0,0.08) 0%, transparent 70%)' }}
            aria-hidden="true"
          />

          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-full px-4 py-1.5 text-xs font-medium text-zinc-400 mb-8">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0" aria-hidden="true" />
              Vagas abertas — atendemos por ordem de chegada
            </div>

            {/* H1 */}
            <h1
              id="hero-heading"
              className="text-4xl sm:text-5xl lg:text-[3.75rem] font-black leading-[1.08] tracking-tight text-white mb-6"
            >
              Seu negócio no Google com um{' '}
              <span className="text-[#FFD100]">site profissional</span>{' '}
              por apenas{' '}
              <span className="relative whitespace-nowrap">
                <span className="relative z-10">R$97</span>
                <span
                  className="absolute inset-x-0 -bottom-1 h-3 rounded-sm -rotate-1 opacity-20 bg-[#FFD100]"
                  aria-hidden="true"
                />
              </span>
            </h1>

            {/* Sub */}
            <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-4 leading-relaxed">
              Design personalizado para o seu negócio, pronto em até{' '}
              <strong className="text-white font-semibold">3 dias úteis</strong>.
              {' '}Você aprova antes de pagar — sem nenhum risco.
            </p>

            {/* Trust pills */}
            <ul
              className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-10 text-sm text-zinc-500 list-none"
              aria-label="Diferenciais"
            >
              {[
                'Só paga se aprovar',
                '100% no celular',
                'Sem saber tecnologia',
                'Pagamento único',
              ].map((t) => (
                <li key={t} className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-green-500 shrink-0" />
                  {t}
                </li>
              ))}
            </ul>

            {/* CTA group */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <CTAButton href={wa(MSG_START)} size="lg">
                <WAIcon className="w-5 h-5" />
                Criar meu site por R$97
              </CTAButton>
              <a
                href="#como-funciona"
                className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors px-2 py-4 underline-offset-2"
              >
                Como funciona? →
              </a>
            </div>

            {/* Stats bar */}
            <div className="mt-14 pt-10 border-t border-zinc-900 grid grid-cols-2 sm:grid-cols-4 gap-6">
              {STATS.map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-2xl sm:text-3xl font-black text-[#FFD100]">{s.value}</p>
                  <p className="text-xs text-zinc-500 mt-1 leading-snug">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── INCLUDES ── */}
        <section
          id="o-que-inclui"
          aria-labelledby="includes-heading"
          className="bg-white text-gray-900 py-20 sm:py-24"
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <p className="text-[11px] font-bold uppercase tracking-widest text-[#A08900] mb-3">
                O que está incluído
              </p>
              <h2
                id="includes-heading"
                className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight"
              >
                Tudo que sua empresa precisa<br className="hidden sm:block" />
                para ter presença online real
              </h2>
              <p className="text-gray-500 mt-4 max-w-xl mx-auto text-sm sm:text-base">
                Por R$97 você recebe um site completo e profissional — nada genérico,
                nada escondido.
              </p>
            </div>

            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 list-none">
              {INCLUDES.map((item) => (
                <li
                  key={item.title}
                  className="flex items-start gap-4 p-5 rounded-2xl border border-gray-100 hover:border-yellow-200 hover:shadow-md transition-all bg-white"
                >
                  <div className="w-10 h-10 rounded-xl bg-yellow-50 border border-yellow-100 flex items-center justify-center shrink-0 text-[#A08900]">
                    <item.Icon />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm mb-1 leading-snug">{item.title}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section
          id="como-funciona"
          aria-labelledby="steps-heading"
          className="bg-zinc-950 py-20 sm:py-24"
        >
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-14">
              <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-3">
                Do zero ao site publicado
              </p>
              <h2
                id="steps-heading"
                className="text-3xl sm:text-4xl font-black text-white leading-tight"
              >
                Simples assim — 3 passos<br />e seu site está no ar
              </h2>
            </div>

            <ol className="space-y-8" aria-label="Como funciona a criação do site">
              {STEPS.map((step, i) => (
                <li key={step.title} className="flex items-start gap-5">
                  <div
                    className="w-12 h-12 rounded-2xl bg-[#FFD100] flex items-center justify-center shrink-0 font-black text-black text-xl"
                    aria-hidden="true"
                  >
                    {i + 1}
                  </div>
                  <div className="pt-1.5 flex-1">
                    <h3 className="font-bold text-white text-base sm:text-lg mb-1.5">{step.title}</h3>
                    <p className="text-zinc-400 text-sm leading-relaxed">{step.desc}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-12 text-center">
              <CTAButton href={wa(MSG_START)} size="lg">
                <WAIcon className="w-5 h-5" />
                Começar agora — ver o protótipo é grátis
              </CTAButton>
            </div>
          </div>
        </section>

        {/* ── FOR WHO ── */}
        <section
          id="para-quem"
          aria-labelledby="segments-heading"
          className="bg-white text-gray-900 py-20 sm:py-24"
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <p className="text-[11px] font-bold uppercase tracking-widest text-[#A08900] mb-3">
                Para quem é
              </p>
              <h2
                id="segments-heading"
                className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight"
              >
                Se você tem um negócio,<br />você precisa estar na internet
              </h2>
              <p className="text-gray-500 mt-4 max-w-lg mx-auto text-sm sm:text-base">
                Da MEI ao prestador de serviço, criamos sites que aparecem no Google
                e convertem visitantes em clientes.
              </p>
            </div>

            <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 list-none">
              {SEGMENTS.map((s) => (
                <li
                  key={s}
                  className="flex items-center gap-2 px-3.5 py-3 rounded-xl border border-gray-100 bg-gray-50 text-sm text-gray-700 font-medium"
                >
                  <Check className="w-3.5 h-3.5 text-green-500 shrink-0" />
                  {s}
                </li>
              ))}
            </ul>

            <p className="text-center text-sm text-gray-400 mt-6">
              Não encontrou seu segmento?{' '}
              <a
                href={wa(MSG_FAQ)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#A08900] hover:underline font-medium"
              >
                Pergunte no WhatsApp →
              </a>
            </p>
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section
          id="depoimentos"
          aria-labelledby="reviews-heading"
          className="bg-zinc-950 py-20 sm:py-24"
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-3">
                Depoimentos
              </p>
              <h2
                id="reviews-heading"
                className="text-3xl sm:text-4xl font-black text-white leading-tight"
              >
                Quem tem o site<br />tem resultado
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {TESTIMONIALS.map((t) => (
                <article
                  key={t.name}
                  className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col"
                  itemScope
                  itemType="https://schema.org/Review"
                >
                  <div className="flex gap-0.5 mb-4" aria-label="Avaliação 5 estrelas">
                    {[...Array(5)].map((_, i) => <IconStar key={i} />)}
                  </div>
                  <blockquote
                    className="text-sm text-zinc-300 leading-relaxed mb-6 flex-1"
                    itemProp="reviewBody"
                  >
                    &ldquo;{t.text}&rdquo;
                  </blockquote>
                  <div
                    className="flex items-center gap-3"
                    itemProp="author"
                    itemScope
                    itemType="https://schema.org/Person"
                  >
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                      style={{ backgroundColor: t.color }}
                      aria-hidden="true"
                    >
                      {t.name[0]}
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

        {/* ── COMPARISON ── */}
        <section
          id="comparativo"
          aria-labelledby="comparison-heading"
          className="bg-black py-20 sm:py-24"
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-3">
                Comparativo
              </p>
              <h2
                id="comparison-heading"
                className="text-3xl sm:text-4xl font-black text-white leading-tight"
              >
                Por que R$97 faz<br />todo o sentido
              </h2>
              <p className="text-zinc-500 mt-4 text-sm max-w-md mx-auto">
                Compare com as alternativas e veja o que você recebe pelo investimento.
              </p>
            </div>

            <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
              <table
                className="w-full min-w-[600px] text-sm border-separate border-spacing-0"
                aria-label="Comparativo de serviços de criação de sites"
              >
                <thead>
                  <tr>
                    <th className="text-left py-4 px-4 text-zinc-500 font-medium w-[26%]"></th>
                    <th className="py-4 px-4 text-center bg-[#FFD100] text-black font-black rounded-tl-2xl rounded-tr-2xl text-sm">
                      TOP SITE
                      <span className="block text-xs font-bold opacity-70">você está aqui</span>
                    </th>
                    <th className="py-4 px-4 text-center text-zinc-500 font-semibold">Freelancer</th>
                    <th className="py-4 px-4 text-center text-zinc-500 font-semibold">Agência</th>
                    <th className="py-4 px-4 text-center text-zinc-500 font-semibold">Wix / Webflow</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON.map((row, idx) => {
                    const isLast = idx === COMPARISON.length - 1
                    return (
                      <tr key={row.label}>
                        <td className={`py-3.5 px-4 text-zinc-400 font-medium ${idx % 2 === 0 ? 'bg-zinc-950/60' : ''} ${isLast ? 'rounded-bl-2xl' : ''}`}>
                          {row.label}
                        </td>
                        <td className={`py-3.5 px-4 text-center font-bold text-black bg-[#FFD100]/90 ${isLast ? 'rounded-bl-2xl rounded-br-2xl' : ''}`}>
                          {row.us}
                        </td>
                        <td className={`py-3.5 px-4 text-center text-zinc-500 ${idx % 2 === 0 ? 'bg-zinc-950/60' : ''}`}>{row.freelancer}</td>
                        <td className={`py-3.5 px-4 text-center text-zinc-500 ${idx % 2 === 0 ? 'bg-zinc-950/60' : ''}`}>{row.agency}</td>
                        <td className={`py-3.5 px-4 text-center text-zinc-500 ${idx % 2 === 0 ? 'bg-zinc-950/60' : ''} ${isLast ? 'rounded-br-2xl' : ''}`}>{row.wix}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              <p className="text-xs text-zinc-600 mt-3 text-center">
                * Wix/Webflow: planos com contrato anual. Você mesmo configura o site.
              </p>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section
          id="perguntas-frequentes"
          aria-labelledby="faq-heading"
          className="bg-white text-gray-900 py-20 sm:py-24"
        >
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <p className="text-[11px] font-bold uppercase tracking-widest text-[#A08900] mb-3">FAQ</p>
              <h2
                id="faq-heading"
                className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight"
              >
                Perguntas frequentes
              </h2>
              <p className="text-gray-500 mt-4 text-sm">Tudo que você precisa saber antes de começar</p>
            </div>

            <dl className="space-y-3">
              {FAQ.map((item) => (
                <div
                  key={item.q}
                  className="rounded-2xl border border-gray-200 overflow-hidden"
                >
                  <dt className="px-6 py-5">
                    <h3 className="font-semibold text-gray-900 text-base leading-snug">{item.q}</h3>
                  </dt>
                  <dd className="px-6 pb-5 -mt-1 border-t border-gray-100 pt-4 text-sm text-gray-600 leading-relaxed">
                    {item.a}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-10 text-center">
              <p className="text-gray-500 text-sm mb-3">Ainda tem dúvida?</p>
              <a
                href={wa(MSG_FAQ)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold text-green-600 hover:text-green-500 transition-colors"
                aria-label="Tirar dúvidas no WhatsApp"
              >
                <WAIcon className="w-4 h-4" />
                Perguntar no WhatsApp
              </a>
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section
          id="comecar"
          aria-labelledby="cta-heading"
          className="bg-black py-24 sm:py-32 relative overflow-hidden"
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 110%, rgba(255,209,0,0.07) 0%, transparent 65%)' }}
            aria-hidden="true"
          />
          <div className="relative max-w-2xl mx-auto px-4 sm:px-6 text-center">
            <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-4">
              Pronto para começar?
            </p>
            <h2
              id="cta-heading"
              className="text-4xl sm:text-5xl font-black text-white leading-[1.08] mb-5"
            >
              Seu negócio merece<br />
              <span className="text-[#FFD100]">estar na internet</span>
            </h2>
            <p className="text-zinc-400 text-base mb-3 max-w-md mx-auto leading-relaxed">
              Fale no WhatsApp, conte sobre seu negócio e receba o protótipo do seu
              site — sem pagar nada antes de aprovar.
            </p>
            <p className="text-zinc-600 text-sm mb-10">
              Site profissional por{' '}
              <strong className="text-white">R$97</strong>
              {' '}· Pagamento só após aprovação
            </p>

            <CTAButton href={wa(MSG_MAIN)} size="lg">
              <WAIcon className="w-6 h-6" />
              Quero meu site por R$97
            </CTAButton>

            <p className="text-zinc-600 text-xs mt-6">
              Atendemos via WhatsApp · Seg a Sáb · +55 18 99674-2364
            </p>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer
          className="bg-zinc-950 border-t border-zinc-900 py-10"
          aria-label="Rodapé"
          itemScope
          itemType="https://schema.org/WPFooter"
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-5">
            <a href="/" aria-label="TOP SITE — página inicial">
              <Image src="/logo.png" alt="TOP SITE" width={100} height={34} className="h-7 w-auto" />
            </a>
            <p className="text-xs text-zinc-600 text-center order-last sm:order-none">
              © {new Date().getFullYear()} TOP SITE &middot; Criação de sites profissionais &middot;{' '}
              <a href="/login" className="hover:text-zinc-400 transition-colors">
                Área do cliente
              </a>
            </p>
            <a
              href={wa(MSG_MAIN)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-zinc-500 hover:text-white transition-colors"
              aria-label="Contato via WhatsApp — +55 18 99674-2364"
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
