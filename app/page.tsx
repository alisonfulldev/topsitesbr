import Link from 'next/link'
import { MarketingIcon } from '@/components/marketing/MarketingIcon'
import { BRAND_DESCRIPTION, SITE_URL, marketingMetadata, organizationSchema, marketingServices } from '@/lib/marketing'
import { MarketingLayout, ProjectCTA, ProcessSteps, ContactSection, CTABand, PricingSection } from '@/components/marketing/MarketingSections'
import { AnimatedHero } from '@/components/marketing/AnimatedHero'

export const metadata = marketingMetadata(
  'Site Barato por R$ 165 | Criação de Site Profissional | TopSite',
  'Site profissional por apenas R$ 165: site institucional one page com serviços, fotos, contatos e botão de WhatsApp, adaptado ao celular. Peça o seu pelo WhatsApp.',
)

const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    organizationSchema,
    { '@type': 'WebSite', '@id': SITE_URL + '/#website', name: 'TopSite', url: SITE_URL, description: BRAND_DESCRIPTION, inLanguage: 'pt-BR', publisher: { '@id': SITE_URL + '/#organization' } },
    { '@type': 'ItemList', name: 'Serviços da TopSite', itemListElement: marketingServices.map(({ href, label }, index) => ({ '@type': 'ListItem', position: index + 1, name: label, url: SITE_URL + href })) },
  ],
}

const diferentials = [
  {
    title: 'Preço que cabe no bolso',
    text: 'Site profissional por apenas R$ 165. Sem orçamento complicado e sem surpresa: você já sabe quanto vai pagar antes de chamar.',
  },
  {
    title: 'Feito para o celular',
    text: 'A maioria dos seus clientes vai abrir o site pelo celular. Ele fica bonito e fácil de usar em qualquer tela.',
  },
  {
    title: 'WhatsApp em um clique',
    text: 'Botão de WhatsApp em destaque para quem visita o site falar com você na hora, sem procurar telefone.',
  },
  {
    title: 'Sem mensalidade obrigatória',
    text: 'Hospedagem e manutenção são opcionais, por R$ 29/mês. Você escolhe se quer que a gente cuide de tudo.',
  },
]

export default function HomePage() {
  return (
    <MarketingLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      {/* ── 1. Hero — Animado ───────────────────────────────────────────── */}
      <AnimatedHero />

      {/* ── 2. O que muda com um site que funciona ───────────────────────── */}
      <section className="border-y border-white/10 bg-[#101010] px-4 py-20 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 grid gap-6 md:grid-cols-2 md:items-end">
            <div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-yellow-400">Por que a TopSite</p>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-5xl">
                Site profissional<br />sem pagar caro.
              </h2>
            </div>
            <p className="max-w-lg leading-relaxed text-white/65">
              Sua empresa merece estar na internet com um site bonito e profissional — e isso não
              precisa custar caro. Por R$ 165 você tem tudo o que precisa para começar.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {diferentials.map(({ title, text }, index) => (
              <article key={title} className="rounded-2xl border border-white/10 bg-white/[0.015] p-7 sm:p-8">
                <span className="mb-5 block text-sm font-semibold text-yellow-400">0{index + 1}</span>
                <h3 className="mb-3 text-xl font-semibold">{title}</h3>
                <p className="leading-relaxed text-white/65">{text}</p>
              </article>
            ))}
          </div>
          <div className="mt-12 text-center">
            <ProjectCTA />
          </div>
        </div>
      </section>

      {/* ── 3. Serviços ──────────────────────────────────────────────────── */}
      <section id="servicos" className="scroll-mt-24 px-4 py-20 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 grid gap-6 md:grid-cols-2 md:items-end">
            <div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-yellow-400">O que entregamos</p>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-5xl">
                Cada projeto tem<br />um objetivo claro.
              </h2>
            </div>
            <p className="max-w-lg leading-relaxed text-white/65">
              Site institucional e landing page por apenas R$ 165. Precisa de algo maior, como uma loja
              virtual? Também fazemos — é só chamar no WhatsApp.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {marketingServices.map(({ href, label }, index) => {
              const descriptions: Record<string, string> = {
                '/criacao-de-sites': 'Presença digital completa, construída para que seus clientes te encontrem quando buscam no Google.',
                '/site-institucional': 'Apresente sua empresa com credibilidade e apareça para quem procura o que você oferece.',
                '/landing-page': 'Página focada em uma oferta específica — para converter quem já está procurando.',
                '/loja-virtual': 'Catálogo e jornada de compra para quem quer vender para quem já busca o produto.',
              }
              return (
                <Link key={href} href={href} className="group rounded-2xl border border-white/10 bg-white/[0.015] p-7 transition-colors hover:border-white/30 sm:p-8">
                  <div className="mb-5 flex items-center justify-between text-sm text-yellow-400">
                    <span>0{index + 1}</span>
                    <MarketingIcon name="arrow" />
                  </div>
                  <h3 className="mb-3 text-2xl font-semibold">{label}</h3>
                  <p className="max-w-2xl leading-relaxed text-white/65">{descriptions[href]}</p>
                  <span className="mt-6 inline-block text-sm font-semibold text-yellow-400">Conhecer o serviço</span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      <CTABand />

      {/* ── 4. Como trabalhamos ──────────────────────────────────────────── */}
      <section className="border-y border-white/10 bg-[#101010] px-4 py-20 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 grid gap-6 md:grid-cols-2">
            <div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-yellow-400">Como trabalhamos</p>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-5xl">
                Simples, rápido<br />e sem burocracia.
              </h2>
            </div>
            <p className="max-w-lg leading-relaxed text-white/65">
              Tudo acontece pelo WhatsApp. Você manda as informações da sua empresa, a gente monta o
              site e você só aprova.
            </p>
          </div>
          <ProcessSteps />
          <div className="mt-12 text-center">
            <ProjectCTA />
          </div>
        </div>
      </section>

      {/* ── 5. Nossa história — Prova reforçada ──────────────────────────── */}
      <section className="px-4 py-20 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-yellow-400">Por que confiar em nós</p>
              <h2 className="mb-6 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                Há 5 anos, a TopSite surgiu do mesmo problema que você tem.
              </h2>
              <p className="mb-6 text-lg leading-relaxed text-white/70">
                Precisávamos vender mais na internet. Desenvolvemos nosso próprio método, começamos a ser
                encontrados por clientes reais — sem depender só de anúncios.
              </p>
              <p className="mb-8 leading-relaxed text-white/65">
                O resultado foi tão bom que passamos a aplicar o mesmo em outras empresas. O que nos
                trouxe até aqui é o que entregamos para cada cliente — e você já viu funcionar: chegou
                até nós pela internet, sem que precisássemos pagar para te alcançar.
              </p>
              <Link href="/sobre" className="inline-flex items-center gap-2 text-sm font-semibold text-yellow-400 hover:underline">
                Conhecer a história da TopSite <MarketingIcon name="arrow" />
              </Link>
            </div>
            <div className="rounded-3xl border border-yellow-400/20 bg-yellow-400/[0.04] p-8 sm:p-12">
              <div className="mb-8 text-4xl text-yellow-400">"</div>
              <blockquote className="mb-8 text-xl font-semibold leading-relaxed">
                Nosso maior case somos nós mesmos. O que usamos para crescer e ser encontrados,
                aplicamos no seu negócio. Não entregamos um site e sumimos.
              </blockquote>
              <div className="flex items-center gap-4 border-t border-yellow-400/20 pt-6">
                <div>
                  <p className="font-semibold">TopSite</p>
                  <p className="text-sm text-white/55">Há 5 anos fazendo empresas serem encontradas</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PricingSection />

      <ContactSection />

      {/* Links para os hubs — crawling do Google */}
      <section className="border-t border-white/10 bg-[#060606] px-4 py-12 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 sm:grid-cols-2">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-yellow-400">Criação de sites por cidade</p>
              <p className="mb-4 text-sm text-white/55">Atendemos todo o Brasil. Veja como desenvolvemos sites para empresas em cada cidade.</p>
              <Link href="/criacao-de-sites" className="text-sm font-semibold text-white/75 underline decoration-white/25 underline-offset-4 hover:text-yellow-400">
                Ver todas as cidades →
              </Link>
            </div>
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-yellow-400">Sites por segmento de negócio</p>
              <p className="mb-4 text-sm text-white/55">Desenvolvemos sites para mais de 150 tipos de negócio — clínicas, restaurantes, advogados e muito mais.</p>
              <Link href="/site-para" className="text-sm font-semibold text-white/75 underline decoration-white/25 underline-offset-4 hover:text-yellow-400">
                Ver todos os segmentos →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </MarketingLayout>
  )
}
