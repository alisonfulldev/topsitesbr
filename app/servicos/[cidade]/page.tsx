import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { cities, getCityBySlug } from '@/lib/seo/cities'
import { niches } from '@/lib/seo/niches'
import { SITE_URL, marketingMetadata, organizationSchema } from '@/lib/marketing'
import { MarketingLayout } from '@/components/marketing/MarketingSections'

export const dynamicParams = false

export function generateStaticParams() {
  return cities.map((c) => ({ cidade: c.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ cidade: string }> }): Promise<Metadata> {
  const { cidade } = await params
  const city = getCityBySlug(cidade)
  if (!city) return marketingMetadata('Página não encontrada', '', '/servicos/' + cidade)
  return marketingMetadata(
    `Criação de Sites em ${city.name} — Todos os Segmentos | TopSite`,
    `Sites profissionais para mais de 150 segmentos de negócio em ${city.name} (${city.stateAbbr}). Clínicas, restaurantes, advogados, construtoras e muito mais.`,
    `/servicos/${city.slug}`
  )
}

const bySector = niches.reduce<Record<string, typeof niches>>((acc, n) => {
  ;(acc[n.sector] ??= []).push(n)
  return acc
}, {})

const sectorEntries = Object.entries(bySector)

export default async function Page({ params }: { params: Promise<{ cidade: string }> }) {
  const { cidade } = await params
  const city = getCityBySlug(cidade)
  if (!city) notFound()

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      organizationSchema,
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Início', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Mapa do site', item: SITE_URL + '/mapa-do-site' },
          { '@type': 'ListItem', position: 3, name: `Serviços em ${city.name}`, item: `${SITE_URL}/servicos/${city.slug}` },
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
            <Link href="/" className="hover:text-yellow-400">Início</Link>
            <span aria-hidden="true">/</span>
            <Link href="/mapa-do-site" className="hover:text-yellow-400">Mapa do site</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{city.name}</span>
          </nav>
          <p className="mb-5 text-xs font-semibold uppercase tracking-widest text-yellow-400">{city.name} — {city.stateAbbr}</p>
          <h1 className="mb-6 text-4xl font-semibold leading-[1.12] tracking-tight sm:text-5xl">
            Criação de sites para os principais segmentos em {city.name}
          </h1>
          <p className="mb-4 max-w-2xl text-lg leading-relaxed text-white/70">
            Desenvolvemos sites profissionais para empresas de {city.name} e região. {city.context}
          </p>
          <p className="mb-10 max-w-2xl leading-relaxed text-white/55">
            Abaixo, todos os segmentos para os quais criamos sites com foco em aparecer no Google local — para que seus futuros clientes em {city.name} te encontrem quando já estão buscando.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/criacao-de-sites/${city.slug}`}
              className="rounded-xl border border-yellow-400/30 px-4 py-2 text-sm text-yellow-400 transition-colors hover:bg-yellow-400/10"
            >
              Criação de sites em {city.name}
            </Link>
            <Link
              href="/mapa-do-site"
              className="rounded-xl border border-white/15 px-4 py-2 text-sm text-white/65 transition-colors hover:border-white/30 hover:text-white"
            >
              Ver outras cidades
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-[#101010] px-4 pb-20 pt-14 sm:px-8">
        <div className="mx-auto max-w-7xl space-y-14">
          {sectorEntries.map(([sector, nicheList]) => (
            <div key={sector}>
              <h2 className="mb-5 border-b border-white/10 pb-3 text-base font-semibold text-yellow-400">
                {sector} em {city.name}
              </h2>
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {nicheList.map((n) => (
                  <li key={n.slug}>
                    <Link
                      href={`/site-para/${n.slug}/${city.slug}`}
                      className="block rounded-xl border border-white/10 px-4 py-3 text-sm text-white/75 transition-colors hover:border-yellow-400/40 hover:text-yellow-400"
                    >
                      Site para {n.name} em {city.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </MarketingLayout>
  )
}
