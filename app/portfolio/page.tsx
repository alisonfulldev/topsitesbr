import { marketingMetadata, portfolioProjects, SITE_URL } from '@/lib/marketing'
import { MarketingLayout, ProjectGrid, ContactSection } from '@/components/marketing/MarketingSections'

export const metadata = marketingMetadata('Portfólio de Projetos | TopSite', 'Conheça projetos de sites desenvolvidos pela TopSite para diferentes segmentos. Explore os trabalhos e converse sobre o próximo projeto da sua empresa.', '/portfolio')

const schema = {
  '@context': 'https://schema.org', '@type': 'ItemList',
  name: 'Projetos de sites da TopSite', url: SITE_URL + '/portfolio',
  itemListElement: portfolioProjects.map((project, index) => ({
    '@type': 'ListItem', position: index + 1, name: project.name, url: 'https://' + project.domain,
  })),
}

export default function PortfolioPage() {
  return (
    <MarketingLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <section className="px-4 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <p className="mb-5 text-xs font-semibold uppercase tracking-widest text-yellow-400">Portfólio</p>
          <h1 className="mb-6 max-w-4xl text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">Conheça projetos desenvolvidos pela TopSite.</h1>
          <p className="max-w-2xl text-lg leading-relaxed text-white/65">Explore alguns sites que criamos para diferentes segmentos. Acesse cada projeto para conhecer a apresentação e navegar pelas páginas.</p>
        </div>
      </section>
      <section className="bg-[#101010] px-4 py-16 sm:px-8">
        <div className="mx-auto max-w-7xl"><h2 className="mb-8 text-3xl font-semibold">Sites para empresas e profissionais</h2><ProjectGrid /></div>
      </section>
      <ContactSection />
    </MarketingLayout>
  )
}
