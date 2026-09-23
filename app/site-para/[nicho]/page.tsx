import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { niches, getNicheBySlug, getNichesBySector } from '@/lib/seo/niches'
import { cities } from '@/lib/seo/cities'
import { SITE_URL, marketingMetadata, marketingServices, organizationSchema } from '@/lib/marketing'
import { MarketingLayout, ProjectCTA, ProcessSteps } from '@/components/marketing/MarketingSections'
import { MarketingIcon } from '@/components/marketing/MarketingIcon'
import { RelatedLinksSection } from '@/components/marketing/RelatedLinksSection'

export const dynamicParams = false

export function generateStaticParams() {
  return niches.map((niche) => ({ nicho: niche.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ nicho: string }> }): Promise<Metadata> {
  const { nicho } = await params
  const niche = getNicheBySlug(nicho)
  if (!niche) return marketingMetadata('Página não encontrada', 'Página não encontrada', '/site-para/' + nicho)
  const title = niche.heading + ' | TopSite'
  return marketingMetadata(title, niche.description, '/site-para/' + niche.slug)
}

export default async function Page({ params }: { params: Promise<{ nicho: string }> }) {
  const { nicho } = await params
  const niche = getNicheBySlug(nicho)
  if (!niche) notFound()

  const url = SITE_URL + '/site-para/' + niche.slug

  const sectorNiches = getNichesBySector(niche.sector, niche.slug, 8)
  const topCities = cities.slice(0, 8)
  const relatedGroups = [
    {
      heading: 'Outros segmentos em ' + niche.sector,
      links: sectorNiches.map((n) => ({ label: n.heading, href: '/site-para/' + n.slug })),
    },
    {
      heading: 'Site para ' + niche.name + ' nas principais cidades',
      links: topCities.map((c) => ({ label: niche.name + ' em ' + c.name, href: '/site-para/' + niche.slug + '/' + c.slug })),
    },
  ]

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      organizationSchema,
      {
        '@type': 'Service',
        '@id': url + '/#service',
        name: niche.heading,
        description: niche.description,
        url,
        provider: { '@id': SITE_URL + '/#organization' },
        areaServed: { '@type': 'Country', name: 'Brazil' },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Início', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: niche.name, item: url },
        ],
      },
    ],
  }

  return (
    <MarketingLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />
      <section className="px-4 py-12 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <nav aria-label="Caminho da página" className="mb-12 flex flex-wrap gap-3 text-sm text-white/55">
            <Link href="/" className="hover:text-yellow-400">Início</Link><span aria-hidden="true">/</span>
            <span aria-current="page">{niche.name}</span>
          </nav>
          <div className="grid items-center gap-12 lg:grid-cols-[1.3fr_1fr]">
            <div>
              <p className="mb-5 text-xs font-semibold uppercase tracking-widest text-yellow-400">{niche.sector}</p>
              <h1 className="mb-6 text-4xl font-semibold leading-[1.12] tracking-tight sm:text-5xl lg:text-6xl">{niche.heading}</h1>
              <p className="mb-8 max-w-2xl text-lg leading-relaxed text-white/70">{niche.intro}</p>
              <ProjectCTA message={niche.ctaMessage} />
              <p className="mt-5 text-sm text-white/50">Projeto sob orçamento · Atendimento em todo o Brasil</p>
            </div>
            <aside className="rounded-3xl border border-yellow-400/20 bg-yellow-400/[0.04] p-7 sm:p-10">
              <p className="mb-5 text-xs uppercase tracking-widest text-yellow-400">Feito para {niche.plural.toLowerCase()}</p>
              <h2 className="mb-4 text-2xl font-semibold">{niche.focus}</h2>
              <p className="mb-8 leading-relaxed text-white/65">{niche.audience}</p>
              <ul className="space-y-4">
                {niche.deliverables.map((item) => <li key={item} className="flex gap-3 text-sm leading-relaxed text-white/80"><MarketingIcon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-yellow-400" />{item}</li>)}
              </ul>
            </aside>
          </div>
        </div>
      </section>
      <section className="border-y border-white/10 bg-[#101010] px-4 py-20 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-10 text-3xl font-semibold tracking-tight sm:text-4xl">O que um site para {niche.name} pode ter</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {niche.features.map(({ title, text }, index) => (
              <article key={title} className="rounded-2xl border border-white/10 p-7 sm:p-8">
                <span className="mb-5 block text-sm font-semibold text-yellow-400">0{index + 1}</span>
                <h3 className="mb-3 text-xl font-semibold">{title}</h3>
                <p className="leading-relaxed text-white/65">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="px-4 py-16 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-3xl border border-yellow-400/20 bg-yellow-400/[0.04] p-8 sm:p-12">
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-yellow-400">Por que a TopSite</p>
            <h2 className="mb-4 max-w-2xl text-2xl font-semibold sm:text-3xl">
              Você nos encontrou da mesma forma que seus clientes vão te encontrar.
            </h2>
            <p className="max-w-2xl leading-relaxed text-white/70">
              Você buscou e chegou até aqui. Seus clientes fazem o mesmo quando procuram por {niche.name.toLowerCase()} —
              e o nosso trabalho é garantir que sua empresa esteja no caminho deles nessa busca.
              Não entregamos um site e sumimos: posicionamos seu negócio para ser encontrado.
            </p>
          </div>
        </div>
      </section>
      <section className="border-t border-white/10 bg-[#101010] px-4 py-20 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-10 text-3xl font-semibold sm:text-4xl">Como trabalhamos</h2>
          <ProcessSteps />
        </div>
      </section>
      <section className="bg-[#101010] px-4 py-20 sm:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-8 text-3xl font-semibold">Perguntas frequentes</h2>
          <div className="space-y-4">
            {niche.faqs.map(({ q, a }) => (
              <details key={q} className="group/faq rounded-xl border border-white/10 p-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-5 font-semibold [&::-webkit-details-marker]:hidden">
                  <span>{q}</span>
                  <MarketingIcon name="plus" className="h-5 w-5 shrink-0 text-yellow-400 transition-transform group-open/faq:rotate-45" />
                </summary>
                <p className="mt-4 leading-relaxed text-white/65">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
      <RelatedLinksSection groups={relatedGroups} />
      <section className="px-4 py-20 text-center sm:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-5 text-3xl font-semibold sm:text-4xl">Pronto para {niche.name} aparecer para quem já busca?</h2>
          <p className="mb-8 text-lg text-white/65">A conversa é gratuita. Entendemos o seu negócio e mostramos como fazer sua empresa aparecer para quem já procura o que você oferece.</p>
          <ProjectCTA message={niche.ctaMessage} label="Agendar uma conversa" />
          <nav aria-label="Outros serviços" className="mt-12 flex flex-wrap justify-center gap-x-6 gap-y-4 text-sm text-white/65">
            {marketingServices.map(({ href, label }) => (
              <Link key={href} href={href} className="underline decoration-white/25 underline-offset-4 hover:text-yellow-400">{label}</Link>
            ))}
          </nav>
        </div>
      </section>
    </MarketingLayout>
  )
}
