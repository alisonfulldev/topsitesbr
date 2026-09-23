import Link from 'next/link'
import type { Metadata } from 'next'
import { niches } from '@/lib/seo/niches'
import { SITE_URL, marketingMetadata, organizationSchema } from '@/lib/marketing'
import { MarketingLayout } from '@/components/marketing/MarketingSections'

export const metadata: Metadata = marketingMetadata(
  'Sites por Segmento de Negócio | TopSite',
  'Sites profissionais para mais de 150 tipos de negócio em todo o Brasil. Clínicas, restaurantes, advogados, construtoras e muito mais. Encontre o segmento da sua empresa.',
  '/site-para'
)

const bySector = niches.reduce<Record<string, typeof niches>>((acc, n) => {
  ;(acc[n.sector] ??= []).push(n)
  return acc
}, {})

const sectorEntries = Object.entries(bySector)

export default function Page() {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      organizationSchema,
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Início', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Sites por segmento', item: SITE_URL + '/site-para' },
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
            <span aria-current="page">Sites por segmento</span>
          </nav>
          <p className="mb-5 text-xs font-semibold uppercase tracking-widest text-yellow-400">Todos os segmentos</p>
          <h1 className="mb-6 text-4xl font-semibold leading-[1.12] tracking-tight sm:text-5xl lg:text-6xl">
            Sites profissionais por segmento de negócio
          </h1>
          <p className="mb-4 max-w-2xl text-lg leading-relaxed text-white/70">
            Desenvolvemos sites para mais de 150 tipos de negócio em todo o Brasil. Cada projeto é planejado com o conteúdo, estrutura e visual que fazem sentido para o público do segmento — para aparecer quando o cliente certo busca.
          </p>
          <p className="max-w-2xl leading-relaxed text-white/55">
            Encontre o segmento da sua empresa abaixo e veja como a TopSite pode ajudar seu negócio a ser encontrado no Google.
          </p>
        </div>
      </section>

      <section className="border-t border-white/10 bg-[#101010] px-4 pb-20 pt-14 sm:px-8">
        <div className="mx-auto max-w-7xl space-y-16">
          {sectorEntries.map(([sector, nicheList]) => (
            <div key={sector}>
              <h2 className="mb-6 border-b border-white/10 pb-3 text-lg font-semibold text-yellow-400">{sector}</h2>
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {nicheList.map((n) => (
                  <li key={n.slug}>
                    <Link
                      href={`/site-para/${n.slug}`}
                      className="block rounded-xl border border-white/10 px-4 py-3 text-sm text-white/75 transition-colors hover:border-yellow-400/40 hover:text-yellow-400"
                    >
                      {n.heading}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 py-12 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <nav aria-label="Páginas relacionadas" className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/55">
            <Link href="/criacao-de-sites" className="underline decoration-white/25 underline-offset-4 hover:text-yellow-400">Criação de sites por cidade</Link>
            <Link href="/mapa-do-site" className="underline decoration-white/25 underline-offset-4 hover:text-yellow-400">Mapa do site</Link>
          </nav>
        </div>
      </section>
    </MarketingLayout>
  )
}
