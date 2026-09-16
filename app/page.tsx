import Link from 'next/link'
import { MarketingIcon } from '@/components/marketing/MarketingIcon'
import Script from 'next/script'
import { BRAND_DESCRIPTION, SITE_URL, marketingMetadata, organizationSchema, marketingServices } from '@/lib/marketing'
import { MarketingLayout, ProjectCTA, ProcessSteps, ProjectGrid, ContactSection } from '@/components/marketing/MarketingSections'

export const metadata = marketingMetadata('TopSite | Sites Profissionais e Software Sob Medida', BRAND_DESCRIPTION)

const services = [
  { href: '/criacao-de-sites', label: 'Criação de sites', text: 'Presença digital com identidade própria, navegação clara e caminhos para o cliente entrar em contato.' },
  { href: '/site-institucional', label: 'Sites institucionais', text: 'Apresente sua empresa, equipe e serviços em uma estrutura que organiza as informações do negócio.' },
  { href: '/landing-page', label: 'Landing pages', text: 'Páginas focadas em uma oferta, com conteúdo e chamadas para apoiar campanhas e captar interessados.' },
  { href: '/loja-virtual', label: 'Lojas virtuais', text: 'Catálogos e experiências de compra planejados de acordo com os produtos e a operação da empresa.' },
  { href: '/desenvolvimento-de-software', label: 'Software sob medida', text: 'Sistemas web, painéis, automações e integrações desenvolvidos a partir dos processos que sua empresa precisa organizar.' },
]
const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    organizationSchema,
    { '@type': 'WebSite', '@id': SITE_URL + '/#website', name: 'TopSite', url: SITE_URL, description: BRAND_DESCRIPTION, inLanguage: 'pt-BR', publisher: { '@id': SITE_URL + '/#organization' } },
    { '@type': 'ItemList', name: 'Serviços da TopSite', itemListElement: marketingServices.map(({ href, label }, index) => ({ '@type': 'ListItem', position: index + 1, name: label, url: SITE_URL + href })) },
  ],
}

export default function HomePage() {
  return (
    <MarketingLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <Script src="https://topsitebr.com.br/tracker.js" data-site-id="41442a6b-5fde-405e-a376-3161d0c44572" strategy="afterInteractive" />
      <section className="relative overflow-hidden px-4 py-16 sm:px-8 sm:py-24 lg:py-28">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.035]" style={{ backgroundImage: "linear-gradient(#facc15 1px, transparent 1px), linear-gradient(90deg, #facc15 1px, transparent 1px)", backgroundSize: "64px 64px", maskImage: "linear-gradient(to bottom, black, transparent)" }} />
        <div aria-hidden="true" className="pointer-events-none absolute -right-40 -top-40 h-[600px] w-[600px] rounded-full bg-yellow-400/[0.04] blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.25fr_1fr]">
          <div>
            <p className="mb-6 text-xs font-semibold uppercase tracking-[0.2em] text-yellow-400">Design e desenvolvimento para empresas</p>
            <h1 className="mb-7 text-[2.65rem] font-semibold leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">
              Sites profissionais e <span className="text-yellow-400">software sob medida.</span>
            </h1>
            <p className="mb-9 max-w-xl text-lg leading-relaxed text-white/70">
              Desenvolvemos sites, lojas virtuais e sistemas personalizados para apresentar seu negócio, facilitar processos e atender melhor seus clientes.
            </p>
            <div className="flex flex-wrap items-center gap-6">
              <ProjectCTA />
              <Link href="/portfolio" className="inline-flex items-center gap-2 py-3 text-sm font-semibold text-white/80 hover:text-yellow-400">Ver projetos <MarketingIcon name="arrow" /></Link>
            </div>
            <p className="mt-7 text-sm text-white/50">Da presença digital à operação da sua empresa.</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-[#101010] p-6 sm:p-8">
            <div className="mb-8 flex items-center justify-between gap-4 border-b border-white/10 pb-6">
              <p className="text-sm font-medium text-white/70">O que você quer construir?</p>
              <span aria-hidden="true" className="h-2 w-2 rounded-full bg-yellow-400" />
            </div>
            <Link href="/criacao-de-sites" className="group mb-4 block rounded-2xl border border-white/10 bg-white/[0.02] p-6 transition-colors hover:border-yellow-400/40">
              <div className="mb-6 flex justify-between text-yellow-400">
                <svg aria-hidden="true" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-8 w-8"><rect x="3" y="5" width="26" height="22" rx="3" /><path d="M3 12h26M8 8.5h1M12 8.5h1M8 17h8M8 21h13" /></svg>
                <MarketingIcon name="arrow" />
              </div>
              <h2 className="mb-2 text-2xl font-semibold">Presença digital</h2>
              <p className="text-sm leading-relaxed text-white/65">Sites, landing pages e lojas virtuais para apresentar sua empresa e conectar clientes.</p>
            </Link>
            <Link href="/desenvolvimento-de-software" className="group block rounded-2xl border border-yellow-400/25 bg-yellow-400/[0.05] p-6 transition-colors hover:border-yellow-400/60">
              <div className="mb-6 flex justify-between text-yellow-400">
                <svg aria-hidden="true" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-8 w-8"><rect x="3" y="3" width="9" height="9" rx="2" /><rect x="20" y="20" width="9" height="9" rx="2" /><path d="M12 7.5h12.5V20M7.5 12v12.5H20" /></svg>
                <MarketingIcon name="arrow" />
              </div>
              <h2 className="mb-2 text-2xl font-semibold">Software sob medida</h2>
              <p className="text-sm leading-relaxed text-white/65">Sistemas e integrações para organizar informações e facilitar o trabalho da sua equipe.</p>
            </Link>
          </div>
        </div>
      </section>

      <section id="servicos" className="scroll-mt-24 border-y border-white/10 bg-[#101010] px-4 py-20 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 grid gap-6 md:grid-cols-2 md:items-end">
            <div><p className="mb-4 text-xs font-semibold uppercase tracking-widest text-yellow-400">O que fazemos</p><h2 className="text-3xl font-semibold tracking-tight sm:text-5xl">Cada necessidade,<br />um projeto bem definido.</h2></div>
            <p className="max-w-lg leading-relaxed text-white/65">Escolha o serviço para conhecer as possibilidades. Definimos a solução, o investimento e o cronograma a partir dos objetivos da sua empresa.</p>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {services.map(({ href, label, text }, index) => (
              <Link key={href} href={href} className={'group rounded-2xl border p-7 transition-colors sm:p-8 ' + (index === 4 ? 'border-yellow-400/25 bg-yellow-400/[0.04] hover:border-yellow-400/60 md:col-span-2' : 'border-white/10 bg-white/[0.015] hover:border-white/30')}>
                <div className="mb-5 flex items-center justify-between text-sm text-yellow-400"><span>0{index + 1}</span><MarketingIcon name="arrow" /></div>
                <h3 className="mb-3 text-2xl font-semibold">{label}</h3>
                <p className="max-w-2xl leading-relaxed text-white/65">{text}</p>
                <span className="mt-6 inline-block text-sm font-semibold text-yellow-400">Conhecer o serviço</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 grid gap-6 md:grid-cols-2">
            <div><p className="mb-4 text-xs font-semibold uppercase tracking-widest text-yellow-400">Como trabalhamos</p><h2 className="text-3xl font-semibold tracking-tight sm:text-5xl">Seu negócio orienta<br />o desenvolvimento.</h2></div>
            <p className="max-w-lg leading-relaxed text-white/65">Um site precisa comunicar. Um sistema precisa funcionar na rotina. Em ambos, começamos entendendo quem vai usar e o que precisa ser resolvido.</p>
          </div>
          <ProcessSteps />
        </div>
      </section>

      <section className="border-t border-white/10 bg-[#101010] px-4 py-20 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div><p className="mb-4 text-xs font-semibold uppercase tracking-widest text-yellow-400">Trabalhos realizados</p><h2 className="text-3xl font-semibold tracking-tight sm:text-5xl">Projetos de sites.</h2></div>
            <Link href="/portfolio" className="inline-flex items-center gap-2 text-sm font-semibold text-yellow-400 hover:underline">Conhecer o portfólio <MarketingIcon name="arrow" /></Link>
          </div>
          <ProjectGrid />
        </div>
      </section>
      <ContactSection />
    </MarketingLayout>
  )
}
