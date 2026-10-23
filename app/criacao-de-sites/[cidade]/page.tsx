import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { cities, getCityBySlug, getCitiesByRegion } from '@/lib/seo/cities'
import { niches } from '@/lib/seo/niches'
import { SITE_URL, marketingMetadata, marketingServices, organizationSchema, projectContact, offerPriceAnswer, monthlyOfferSchema } from '@/lib/marketing'
import { MarketingLayout, ProjectCTA, PriceTag, ProcessSteps, CTABand, PricingSection } from '@/components/marketing/MarketingSections'
import { MarketingIcon } from '@/components/marketing/MarketingIcon'
import { RelatedLinksSection } from '@/components/marketing/RelatedLinksSection'

export const dynamicParams = false

export function generateStaticParams() {
  return cities.map((city) => ({ cidade: city.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ cidade: string }> }): Promise<Metadata> {
  const { cidade } = await params
  const city = getCityBySlug(cidade)
  if (!city) return marketingMetadata('Página não encontrada', 'Página não encontrada', '/criacao-de-sites/' + cidade)
  const title = 'Site Barato em ' + city.name + ' por R$ 97/mês | Criação de Sites | TopSite'
  const description = 'Criação de sites em ' + city.name + ' (' + city.stateAbbr + ') por apenas R$ 97/mês: site institucional one page com serviços, fotos, contatos e WhatsApp, adaptado ao celular. Peça pelo WhatsApp.'
  return marketingMetadata(title, description, '/criacao-de-sites/' + city.slug)
}

const cityDeliverables = [
  'Site institucional one page',
  'Design adaptado ao celular e ao computador',
  'Botão de WhatsApp em destaque',
  'Revisão e ajustes antes de ficar pronto',
]

const cityFeatures = [
  { title: 'Preço que cabe no bolso', text: 'Site profissional por apenas R$ 97/mês, sem orçamento complicado. Você já sabe quanto vai pagar antes de chamar.' },
  { title: 'Design adaptado ao celular', text: 'A maioria dos acessos vem do celular. Cores, tipografia e navegação são desenhadas para ler bem e agir rápido em qualquer tela.' },
  { title: 'Contato ao alcance', text: 'WhatsApp, formulários e telefone posicionados nos pontos certos para que o visitante inicie a conversa sem procurar.' },
  { title: 'Autoridade local', text: 'Informações da empresa organizadas para transmitir credibilidade e diferenciar sua marca dentro da concorrência da região.' },
]

const POPULAR_NICHE_SLUGS = [
  'restaurante', 'clinica-de-estetica', 'dentista', 'advogado', 'contador',
  'oficina-mecanica', 'eletricista', 'pet-shop', 'escola', 'loja-de-roupas',
]

export default async function Page({ params }: { params: Promise<{ cidade: string }> }) {
  const { cidade } = await params
  const city = getCityBySlug(cidade)
  if (!city) notFound()

  const url = SITE_URL + '/criacao-de-sites/' + city.slug
  const economyText = city.economy.slice(0, -1).join(', ') + ' e ' + city.economy[city.economy.length - 1]
  const intro = 'Criamos sites profissionais para empresas de ' + city.name + ' e região por apenas R$ 97/mês. ' + city.context + ' Em um mercado forte em ' + economyText + ', ter um site bonito e com WhatsApp em destaque passa confiança para quem procura a sua empresa.'
  const message = 'Olá! Tenho uma empresa em ' + city.name + ' e quero meu site por R$ 97/mês.'

  const nearbyCities = getCitiesByRegion(city.region, city.slug, 8)
  const popularNiches = POPULAR_NICHE_SLUGS
    .map((slug) => niches.find((n) => n.slug === slug))
    .filter(Boolean) as NonNullable<(typeof niches)[number]>[]
  const relatedGroups = [
    {
      heading: 'Criação de sites em outras cidades do ' + city.region,
      links: nearbyCities.map((c) => ({ label: 'Sites em ' + c.name, href: '/criacao-de-sites/' + c.slug })),
    },
    {
      heading: 'Sites por segmento em ' + city.name,
      links: popularNiches.map((n) => ({ label: 'Site para ' + n.name + ' em ' + city.name, href: '/site-para/' + n.slug + '/' + city.slug })),
    },
  ]

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      organizationSchema,
      {
        '@type': 'Service',
        '@id': url + '/#service',
        name: 'Criação de sites em ' + city.name,
        description: 'Criação de sites profissionais para empresas de ' + city.name + ' (' + city.stateAbbr + ') por R$ 97/mês.',
        url,
        offers: monthlyOfferSchema,
        provider: { '@id': SITE_URL + '/#organization' },
        areaServed: { '@type': 'City', name: city.name },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Início', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Criação de Sites', item: SITE_URL + '/criacao-de-sites' },
          { '@type': 'ListItem', position: 3, name: city.name, item: url },
        ],
      },
    ],
  }

  const faqs = [
    {
      q: 'Quanto custa um site em ' + city.name + '?',
      a: offerPriceAnswer,
    },
    {
      q: 'Vocês atendem empresas de ' + city.name + ' presencialmente?',
      a: 'Atendemos todo o Brasil de forma remota, com reuniões por videoconferência e comunicação por WhatsApp e e-mail. Empresas de ' + city.name + ' e região são atendidas com o mesmo cuidado e agilidade de um atendimento local.',
    },
    {
      q: 'O site vai aparecer para quem busca em ' + city.name + '?',
      a: 'Configuramos as informações do site (localização, cidade, região) para ajudar os buscadores a entender que sua empresa atende ' + city.name + '/' + city.stateAbbr + '. Isso melhora a chance de aparecer para o público local, embora a posição exata dependa também da concorrência.',
    },
    {
      q: 'Quanto tempo leva para o site ir ao ar?',
      a: 'Depende de você enviar as informações da empresa (logo, fotos, serviços e contatos). Com tudo em mãos, montamos o site e você recebe a previsão de entrega já na primeira conversa pelo WhatsApp.',
    },
  ]

  return (
    <MarketingLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />
      <section className="px-4 py-12 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <nav aria-label="Caminho da página" className="mb-12 flex flex-wrap gap-3 text-sm text-black/55">
            <Link href="/" className="hover:text-black">Início</Link><span aria-hidden="true">/</span>
            <Link href="/criacao-de-sites" className="hover:text-black">Criação de sites</Link><span aria-hidden="true">/</span>
            <span aria-current="page">{city.name}</span>
          </nav>
          <div className="grid items-center gap-12 lg:grid-cols-[1.3fr_1fr]">
            <div>
              <p className="mb-5 text-xs font-semibold uppercase tracking-widest text-black/55">Criação de sites em {city.name} — {city.stateAbbr}</p>
              <h1 className="mb-6 text-4xl font-semibold leading-[1.12] tracking-tight sm:text-5xl lg:text-6xl">Site barato em {city.name} por apenas <span className="underline decoration-[#FDD900] decoration-[0.12em] underline-offset-[0.14em] [text-decoration-skip-ink:none]">R$ 97/mês</span></h1>
              <PriceTag className="mb-6" />
              <p className="mb-8 max-w-2xl text-lg leading-relaxed text-black/70">{intro}</p>
              <ProjectCTA message={message} />
              <p className="mt-5 text-sm text-black/55">Resposta rápida no WhatsApp · Atendimento remoto em {city.name} e todo o Brasil</p>
            </div>
            <aside className="rounded-3xl border border-[#FDD900] bg-[#FFFBE0] p-7 sm:p-10">
              <p className="mb-5 text-xs uppercase tracking-widest text-black/55">O que entregamos</p>
              <h2 className="mb-4 text-2xl font-semibold">Tudo isso por R$ 97/mês</h2>
              <p className="mb-8 leading-relaxed text-black/70">Para empresas de {city.name} que querem um site profissional para apresentar seus serviços sem pagar caro.</p>
              <ul className="space-y-4">
                {cityDeliverables.map((item) => <li key={item} className="flex gap-3 text-sm leading-relaxed text-black/80"><MarketingIcon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-black" />{item}</li>)}
              </ul>
            </aside>
          </div>
        </div>
      </section>
      <section className="border-y border-black/10 bg-white px-4 py-20 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-balance text-center mb-10 text-3xl font-semibold tracking-tight sm:text-4xl">O que seu site em {city.name} pode ter</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {cityFeatures.map(({ title, text }, index) => (
              <article key={title} className="rounded-2xl border border-black/10 p-7 sm:p-8">
                <span className="mb-5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#FDD900] text-sm font-semibold tabular-nums text-black">0{index + 1}</span>
                <h3 className="mb-3 text-xl font-semibold">{title}</h3>
                <p className="leading-relaxed text-black/70">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <CTABand message={message} title={'Site profissional em ' + city.name + ' por apenas R$ 97/mês.'} />
      <section className="px-4 py-16 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-3xl border border-[#FDD900] bg-[#FFFBE0] p-8 sm:p-12">
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-black/55">Por que a TopSite</p>
            <h2 className="mb-4 max-w-2xl text-2xl font-semibold sm:text-3xl">
              Site profissional em {city.name} não precisa custar caro.
            </h2>
            <p className="max-w-2xl leading-relaxed text-black/70">
              Muita empresa em {city.name} ainda não tem site porque acha que é caro ou complicado. Aqui você paga
              apenas R$ 97/mês, resolve tudo pelo WhatsApp e recebe um site bonito, adaptado ao celular e com o
              botão de WhatsApp em destaque.
            </p>
          </div>
        </div>
      </section>
      <section className="border-t border-black/10 bg-white px-4 py-20 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-balance text-center mb-10 text-3xl font-semibold sm:text-4xl">Como trabalhamos</h2>
          <ProcessSteps />
          <div className="mt-12 text-center">
            <ProjectCTA message={message} />
          </div>
        </div>
      </section>
      <section className="bg-white px-4 py-20 sm:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-balance text-center mb-8 text-3xl font-semibold">Perguntas de quem contrata em {city.name}</h2>
          <div>
            {faqs.map(({ q, a }) => (
              <details key={q} className="group/faq border-b border-black/15 py-5 first:border-t">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-5 font-semibold [&::-webkit-details-marker]:hidden">
                  <span>{q}</span>
                  <MarketingIcon name="plus" className="h-5 w-5 shrink-0 text-black transition-transform group-open/faq:rotate-45" />
                </summary>
                <p className="mt-4 leading-relaxed text-black/70">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
      <PricingSection message={message} />
      <RelatedLinksSection groups={relatedGroups} />
      <section className="px-4 py-20 text-center sm:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-5 text-3xl font-semibold sm:text-4xl">Seu site em {city.name} por apenas R$ 97/mês</h2>
          <p className="mb-8 text-lg text-black/70">Chame no WhatsApp, conte sobre a sua empresa e a gente monta o seu site.</p>
          <ProjectCTA message={message} />
          <nav aria-label="Outros serviços" className="mt-12 flex flex-wrap justify-center gap-x-6 gap-y-4 text-sm text-black/70">
            {marketingServices.filter(({ href }) => href !== '/criacao-de-sites').map(({ href, label }) => (
              <Link key={href} href={href} className="underline decoration-[#FDD900] decoration-2 underline-offset-4 hover:text-black">{label}</Link>
            ))}
          </nav>
          <p className="mt-8 text-xs text-black/55">
            <a href={projectContact(message)} target="_blank" rel="noopener noreferrer" className="hover:text-black">Atendimento remoto em {city.name} e todo o Brasil</a>
          </p>
        </div>
      </section>
    </MarketingLayout>
  )
}
