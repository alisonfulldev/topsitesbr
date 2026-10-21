import Link from 'next/link'
import { BRAND_DESCRIPTION, SITE_URL, marketingMetadata, organizationSchema, marketingServices } from '@/lib/marketing'
import { MarketingLayout } from '@/components/marketing/MarketingSections'
import { WhySection, ServicesSection, ProcessSection, LandingPricingSection, FaqSection, ContactFormSection } from '@/components/marketing/HomeSections'
import { AnimatedHero } from '@/components/marketing/AnimatedHero'

export const metadata = marketingMetadata(
  'Criação de Site Profissional por R$ 97/mês | TopSite',
  'Site profissional com a Top Site: página de captura por R$ 97/mês, com a primeira parcela só após 30 dias, configuração de SEO e Google Meu Negócio. Fale pelo WhatsApp.',
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
      <LandingPricingSection />
      <FaqSection />
      <ContactFormSection />

      {/* Links para os hubs — crawling do Google */}
      <section className="border-t border-black/[0.06] bg-white px-4 py-14 text-black sm:px-8">
        <div className="mx-auto w-full max-w-6xl">
          <div className="grid gap-10 text-center sm:grid-cols-2">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-black">Criação de sites por cidade</p>
              <p className="mx-auto mb-4 max-w-sm text-sm text-black/65">Atendemos todo o Brasil. Veja como desenvolvemos sites para empresas em cada cidade.</p>
              <Link href="/criacao-de-sites" className="text-sm font-semibold text-black underline decoration-[#FDD900] decoration-2 underline-offset-4 hover:decoration-black">
                Ver todas as cidades →
              </Link>
            </div>
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-black">Sites por segmento de negócio</p>
              <p className="mx-auto mb-4 max-w-sm text-sm text-black/65">Desenvolvemos sites para mais de 150 tipos de negócio — clínicas, restaurantes, advogados e muito mais.</p>
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
