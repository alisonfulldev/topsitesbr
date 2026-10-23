import Link from 'next/link'
import { marketingMetadata } from '@/lib/marketing'
import { serviceContent } from '@/lib/marketing-services'
import { niches } from '@/lib/seo/niches'
import { ServicePage } from '@/components/marketing/ServicePage'

const content = serviceContent['pagina-de-lancamento']
export const metadata = marketingMetadata(content.title, content.description, '/' + content.slug)

const bySector = niches.reduce<Record<string, typeof niches>>((acc, n) => {
  ;(acc[n.sector] ??= []).push(n)
  return acc
}, {})

const nichesSection = (
  <section className="border-t border-black/10 bg-white px-4 py-16 sm:px-8">
    <div className="mx-auto max-w-7xl">
      <h2 className="text-balance text-center mb-3 text-2xl font-semibold">Página de lançamento por segmento</h2>
      <p className="mx-auto mb-10 max-w-2xl text-center text-black/70">Escolha o seu tipo de negócio e veja ideias para a sua página — todas por R$ 97/mês.</p>
      <div className="space-y-10">
        {Object.entries(bySector).map(([sector, sectorNiches]) => (
          <div key={sector}>
            <h3 className="mb-4 text-center text-sm font-semibold uppercase tracking-widest text-black/55">{sector}</h3>
            <ul className="flex flex-wrap justify-center gap-3">
              {sectorNiches.map((n) => (
                <li key={n.slug}>
                  <Link href={'/pagina-de-lancamento/' + n.slug} className="rounded-xl border border-black/10 px-4 py-2 text-sm text-black/80 transition-colors hover:border-black/30 hover:bg-[#FAFAF7] hover:text-black">
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
