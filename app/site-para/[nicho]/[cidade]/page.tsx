import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { niches, getNicheBySlug } from '@/lib/seo/niches'
import { cities, getCityBySlug } from '@/lib/seo/cities'
import { SITE_URL, marketingMetadata, organizationSchema } from '@/lib/marketing'
import { MarketingLayout, ProjectCTA, ProcessSteps } from '@/components/marketing/MarketingSections'
import { MarketingIcon } from '@/components/marketing/MarketingIcon'

export const dynamicParams = false

export function generateStaticParams() {
  return niches.flatMap((niche) =>
    cities.map((city) => ({ nicho: niche.slug, cidade: city.slug }))
  )
}

export async function generateMetadata({ params }: { params: Promise<{ nicho: string; cidade: string }> }): Promise<Metadata> {
  const { nicho, cidade } = await params
  const niche = getNicheBySlug(nicho)
  const city = getCityBySlug(cidade)
  if (!niche || !city) return marketingMetadata('Página não encontrada', 'Página não encontrada', '/site-para/' + nicho + '/' + cidade)
  const title = `Site para ${niche.name} em ${city.name} | TopSite`
  const description = `Criamos sites profissionais para ${niche.plural.toLowerCase()} em ${city.name} (${city.stateAbbr}). ${niche.description}`
  return marketingMetadata(title, description, '/site-para/' + niche.slug + '/' + city.slug)
}

export default async function Page({ params }: { params: Promise<{ nicho: string; cidade: string }> }) {
  const { nicho, cidade } = await params
  const niche = getNicheBySlug(nicho)
  const city = getCityBySlug(cidade)
  if (!niche || !city) notFound()

  const url = `${SITE_URL}/site-para/${niche.slug}/${city.slug}`
  const ctaMessage = `Olá! Tenho uma ${niche.name.toLowerCase()} em ${city.name} e quero criar um site com a TopSite.`
  const economyText = city.economy.slice(0, -1).join(', ') + ' e ' + city.economy[city.economy.length - 1]
  const intro = `Desenvolvemos sites para ${niche.plural.toLowerCase()} em ${city.name} e região. ${city.context} Com forte atividade em ${economyText}, o mercado local é competitivo — e ${niche.plural.toLowerCase()} que aparecem quando o cliente busca saem na frente. ${niche.intro}`

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      organizationSchema,
      {
        '@type': 'Service',
        '@id': url + '/#service',
        name: `Site para ${niche.name} em ${city.name}`,
        description: `Criação de site profissional para ${niche.plural.toLowerCase()} em ${city.name} (${city.stateAbbr}).`,
        url,
        provider: { '@id': SITE_URL + '/#organization' },
        areaServed: { '@type': 'City', name: city.name },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Início', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: niche.name, item: SITE_URL + '/site-para/' + niche.slug },
          { '@type': 'ListItem', position: 3, name: city.name, item: url },
        ],
      },
    ],
  }

  const faqs = [
    {
      q: `Quanto custa um site para ${niche.name.toLowerCase()} em ${city.name}?`,
      a: `O investimento depende do escopo, número de páginas e funcionalidades. Após entender o que sua ${niche.name.toLowerCase()} em ${city.name} precisa, apresentamos uma proposta com valor, prazo e tudo que será entregue.`,
    },
    {
      q: `O site vai aparecer para quem busca ${niche.name.toLowerCase()} em ${city.name}?`,
      a: `Configuramos o site com informações de localização e especialidade para ajudar os buscadores a entender que você atende em ${city.name} (${city.stateAbbr}). Isso aumenta a chance de aparecer para quem procura ${niche.name.toLowerCase()} na região.`,
    },
    ...niche.faqs.slice(0, 2),
  ]

  return (
    <MarketingLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />
      <section className="px-4 py-12 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <nav aria-label="Caminho da página" className="mb-12 flex flex-wrap gap-3 text-sm text-white/55">
            <Link href="/" className="hover:text-yellow-400">Início</Link><span aria-hidden="true">/</span>
            <Link href={`/site-para/${niche.slug}`} className="hover:text-yellow-400">{niche.name}</Link><span aria-hidden="true">/</span>
            <span aria-current="page">{city.name}</span>
          </nav>
          <div className="grid items-center gap-12 lg:grid-cols-[1.3fr_1fr]">
            <div>
              <p className="mb-5 text-xs font-semibold uppercase tracking-widest text-yellow-400">{niche.sector} · {city.name} — {city.stateAbbr}</p>
              <h1 className="mb-6 text-4xl font-semibold leading-[1.12] tracking-tight sm:text-5xl lg:text-6xl">Site para {niche.name} em {city.name}</h1>
              <p className="mb-8 max-w-2xl text-lg leading-relaxed text-white/70">{intro}</p>
              <ProjectCTA message={ctaMessage} />
              <p className="mt-5 text-sm text-white/50">Projeto sob orçamento · Atendimento remoto em {city.name} e todo o Brasil</p>
            </div>
            <aside className="rounded-3xl border border-yellow-400/20 bg-yellow-400/[0.04] p-7 sm:p-10">
              <p className="mb-5 text-xs uppercase tracking-widest text-yellow-400">Feito para {niche.plural.toLowerCase()}</p>
              <h2 className="mb-4 text-2xl font-semibold">{niche.focus}</h2>
              <p className="mb-8 leading-relaxed text-white/65">{niche.audience}</p>
              <ul className="space-y-4">
                {niche.deliverables.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-relaxed text-white/80">
                    <MarketingIcon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-yellow-400" />{item}
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#101010] px-4 py-20 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-10 text-3xl font-semibold tracking-tight sm:text-4xl">O que o site da sua {niche.name.toLowerCase()} em {city.name} pode ter</h2>
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
              Se você nos encontrou buscando site para {niche.name.toLowerCase()} em {city.name}, já viu o método funcionar.
            </h2>
            <p className="max-w-2xl leading-relaxed text-white/70">
              {niche.plural} em {city.name} nos encontram da mesma forma que seus clientes vão te encontrar.
              Não entregamos um site e sumimos: posicionamos sua {niche.name.toLowerCase()} para ser encontrada
              por quem já busca o que você oferece em {city.name} e região.
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
            {faqs.map(({ q, a }) => (
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

      <section className="px-4 py-20 text-center sm:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-5 text-3xl font-semibold sm:text-4xl">Pronto para sua {niche.name.toLowerCase()} em {city.name} ser encontrada por quem já busca?</h2>
          <p className="mb-8 text-lg text-white/65">A conversa é gratuita. Entendemos o seu negócio e mostramos como fazer sua {niche.name.toLowerCase()} aparecer para quem já procura em {city.name} e região.</p>
          <ProjectCTA message={ctaMessage} label="Agendar uma conversa" />
          <nav aria-label="Ver mais" className="mt-12 flex flex-wrap justify-center gap-x-6 gap-y-4 text-sm text-white/65">
            <Link href={`/site-para/${niche.slug}`} className="underline decoration-white/25 underline-offset-4 hover:text-yellow-400">Site para {niche.name} — Brasil</Link>
            <Link href={`/criacao-de-sites/${city.slug}`} className="underline decoration-white/25 underline-offset-4 hover:text-yellow-400">Criação de sites em {city.name}</Link>
          </nav>
        </div>
      </section>
    </MarketingLayout>
  )
}
