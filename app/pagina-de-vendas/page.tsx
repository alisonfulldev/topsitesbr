import Link from 'next/link'
import { marketingMetadata } from '@/lib/marketing'
import { serviceContent } from '@/lib/marketing-services'
import { niches } from '@/lib/seo/niches'
import { ServicePage } from '@/components/marketing/ServicePage'

const content = serviceContent['pagina-de-vendas']
export const metadata = marketingMetadata(content.title, content.description, '/' + content.slug)

const bySector = niches.reduce<Record<string, typeof niches>>((acc, n) => {
  ;(acc[n.sector] ??= []).push(n)
  return acc
}, {})

const nichesSection = (
  <section className="border-t border-white/10 bg-[#101010] px-4 py-16 sm:px-8">
    <div className="mx-auto max-w-7xl">
      <h2 className="mb-3 text-2xl font-semibold">Página de vendas por segmento</h2>
      <p className="mb-10 max-w-2xl text-white/65">Escolha o seu tipo de negócio e veja ideias para a sua página — todas por R$ 165.</p>
      <div className="space-y-10">
        {Object.entries(bySector).map(([sector, sectorNiches]) => (
          <div key={sector}>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-yellow-400">{sector}</h3>
            <ul className="flex flex-wrap gap-3">
              {sectorNiches.map((n) => (
                <li key={n.slug}>
                  <Link href={'/pagina-de-vendas/' + n.slug} className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/75 transition-colors hover:border-yellow-400/40 hover:text-yellow-400">
                    {n.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  </section>
)

export default function Page() {
  return <ServicePage content={content} bottomSection={nichesSection} />
}
