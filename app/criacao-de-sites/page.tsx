import Link from 'next/link'
import { marketingMetadata } from '@/lib/marketing'
import { serviceContent } from '@/lib/marketing-services'
import { ServicePage } from '@/components/marketing/ServicePage'
import { cities } from '@/lib/seo/cities'

const content = serviceContent['criacao-de-sites']
export const metadata = marketingMetadata(content.title, content.description, '/' + content.slug)

const byRegion = cities.reduce<Record<string, typeof cities>>((acc, c) => {
  ;(acc[c.region] ??= []).push(c)
  return acc
}, {})

const citiesSection = (
  <section className="border-t border-white/10 bg-[#101010] px-4 py-16 sm:px-8">
    <div className="mx-auto max-w-7xl">
      <h2 className="mb-3 text-2xl font-semibold">Criação de sites por cidade</h2>
      <p className="mb-10 max-w-2xl text-white/65">
        Atendemos todo o Brasil de forma remota. Veja as principais cidades onde desenvolvemos sites profissionais.
      </p>
      <div className="space-y-10">
        {Object.entries(byRegion).map(([region, regionCities]) => (
          <div key={region}>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-yellow-400">{region}</h3>
            <ul className="flex flex-wrap gap-3">
              {regionCities.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/criacao-de-sites/${c.slug}`}
                    className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/75 transition-colors hover:border-yellow-400/40 hover:text-yellow-400"
                  >
                    {c.name} ({c.stateAbbr})
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
  return <ServicePage content={content} bottomSection={citiesSection} />
}
