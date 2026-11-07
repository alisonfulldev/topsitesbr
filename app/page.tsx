import Link from 'next/link'
import { BRAND_DESCRIPTION, SITE_URL, marketingMetadata, organizationSchema, marketingServices } from '@/lib/marketing'
import { MarketingLayout } from '@/components/marketing/MarketingSections'
import { WhySection, ServicesSection, ProcessSection, DiagnosticHomeSection, FaqSection, ContactFormSection } from '@/components/marketing/HomeSections'
import { AnimatedHero } from '@/components/marketing/AnimatedHero'

export const metadata = marketingMetadata(
  'Seu Site no Google e nas IAs | Criação e Otimização de Sites | TopSite',
  'Criamos ou otimizamos seu site para aparecer no Google e nas IAs, como ChatGPT e Gemini, quando seu cliente pesquisar. Peça seu diagnóstico grátis pelo WhatsApp.',
)

const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    organizationSchema,
    { '@type': 'WebSite', '@id': SITE_URL + '/#website', name: 'TopSite', url: SITE_URL, description: BRAND_DESCRIPTION, inLanguage: 'pt-BR', publisher: { '@id': SITE_URL + '/#organization' } },
    { '@type': 'ItemList', name: 'Serviços da TopSite', itemListElement: marketingServices.map(({ href, label }, index) => ({ '@type': 'ListItem', position: index + 1, name: label, url: SITE_URL + href })) },
  ],
}

export default function HomePage() {
  return (
    <MarketingLayout theme="light">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      {/* ── 1. Hero — Animado ───────────────────────────────────────────── */}
      <AnimatedHero />

      <WhySection />
      <ServicesSection />
      <ProcessSection />
      <DiagnosticHomeSection />
      <FaqSection />
      <ContactFormSection />

      {/* Links para os hubs — crawling do Google */}
      <section className="border-t border-black/[0.06] bg-white px-4 py-14 text-black sm:px-8">
        <div className="mx-auto w-full max-w-6xl">
          <div className="grid gap-10 text-center sm:grid-cols-2">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-black">Criação de sites por cidade</p>
              <p className="mx-auto mb-4 max-w-sm text-sm text-black/65">Atendemos todo o Brasil. Veja como ajudamos empresas de cada cidade a aparecer para quem pesquisa na região.</p>
              <Link href="/criacao-de-sites" className="text-sm font-semibold text-black underline decoration-[#FDD900] decoration-2 underline-offset-4 hover:decoration-black">
                Ver todas as cidades →
              </Link>
            </div>
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-black">Sites por segmento de negócio</p>
              <p className="mx-auto mb-4 max-w-sm text-sm text-black/65">Sites feitos para aparecer na busca de mais de 150 tipos de negócio — clínicas, restaurantes, advogados e muito mais.</p>
              <Link href="/site-para" className="text-sm font-semibold text-black underline decoration-[#FDD900] decoration-2 underline-offset-4 hover:decoration-black">
                Ver todos os segmentos →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </MarketingLayout>
  )
}
