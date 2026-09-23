import Link from 'next/link'
import type { Metadata } from 'next'
import { cities } from '@/lib/seo/cities'
import { SITE_URL, marketingMetadata, marketingServices, organizationSchema } from '@/lib/marketing'
import { MarketingLayout } from '@/components/marketing/MarketingSections'

export const metadata: Metadata = marketingMetadata(
  'Mapa do Site | TopSite',
  'Índice completo do site da TopSite. Encontre rapidamente páginas por cidade, segmento de negócio ou tipo de serviço.',
  '/mapa-do-site'
)

const byRegion = cities.reduce<Record<string, typeof cities>>((acc, c) => {
  ;(acc[c.region] ??= []).push(c)
  return acc
}, {})

const regionEntries = Object.entries(byRegion)

export default function Page() {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      organizationSchema,
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Início', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Mapa do site', item: SITE_URL + '/mapa-do-site' },
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
            <span aria-current="page">Mapa do site</span>
          </nav>
          <p className="mb-5 text-xs font-semibold uppercase tracking-widest text-yellow-400">Índice completo</p>
          <h1 className="mb-6 text-4xl font-semibold leading-[1.12] tracking-tight sm:text-5xl">Mapa do site</h1>
          <p className="max-w-2xl text-lg leading-relaxed text-white/70">
            Índice completo das páginas da TopSite — serviços, cidades atendidas e segmentos de negócio.
            Use esta página para navegar diretamente ao conteúdo que procura.
          </p>
        </div>
      </section>

      <section className="border-t border-white/10 bg-[#101010] px-4 pb-20 pt-14 sm:px-8">
        <div className="mx-auto max-w-7xl space-y-16">

          {/* Serviços principais */}
          <div>
            <h2 className="mb-6 border-b border-white/10 pb-3 text-xl font-semibold">Serviços</h2>
            <ul className="flex flex-wrap gap-3">
              {marketingServices.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/75 transition-colors hover:border-yellow-400/40 hover:text-yellow-400">
                    {label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/sobre" className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/75 transition-colors hover:border-yellow-400/40 hover:text-yellow-400">
                  Sobre a TopSite
                </Link>
              </li>
            </ul>
          </div>

          {/* Índices hub */}
          <div>
            <h2 className="mb-3 border-b border-white/10 pb-3 text-xl font-semibold">Índices de conteúdo</h2>
            <p className="mb-6 text-sm text-white/55">Páginas que agrupam todo o conteúdo por cidade ou por segmento.</p>
            <ul className="flex flex-wrap gap-3">
              <li>
                <Link
                  href="/criacao-de-sites"
                  className="rounded-xl border border-yellow-400/30 px-4 py-2 text-sm text-yellow-400 transition-colors hover:bg-yellow-400/10"
                >
                  Criação de sites — todas as {cities.length} cidades
                </Link>
              </li>
              <li>
                <Link
                  href="/site-para"
                  className="rounded-xl border border-yellow-400/30 px-4 py-2 text-sm text-yellow-400 transition-colors hover:bg-yellow-400/10"
                >
                  Sites por segmento — todos os nichos
                </Link>
              </li>
            </ul>
          </div>

          {/* Hubs por cidade, agrupados por região */}
          <div>
            <h2 className="mb-3 border-b border-white/10 pb-3 text-xl font-semibold">Todos os segmentos por cidade</h2>
            <p className="mb-8 text-sm text-white/55">
              Cada página lista os 150+ segmentos de negócio disponíveis naquela cidade.
            </p>
            <div className="space-y-10">
              {regionEntries.map(([region, regionCities]) => (
                <div key={region}>
                  <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-yellow-400">{region}</h3>
                  <ul className="flex flex-wrap gap-3">
                    {regionCities.map((c) => (
                      <li key={c.slug}>
                        <Link
                          href={`/servicos/${c.slug}`}
                          className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/75 transition-colors hover:border-yellow-400/40 hover:text-yellow-400"
                        >
                          Serviços em {c.name} ({c.stateAbbr})
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>
    </MarketingLayout>
  )
}
