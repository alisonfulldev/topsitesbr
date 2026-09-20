import Link from 'next/link'
import Script from 'next/script'
import { MarketingIcon } from '@/components/marketing/MarketingIcon'
import { BRAND_DESCRIPTION, SITE_URL, marketingMetadata, organizationSchema, marketingServices } from '@/lib/marketing'
import { MarketingLayout, ProjectCTA, ProcessSteps, ProjectGrid, ContactSection } from '@/components/marketing/MarketingSections'
import { AnimatedHero } from '@/components/marketing/AnimatedHero'

export const metadata = marketingMetadata(
  'TopSite | Sites que fazem sua empresa ser encontrada',
  BRAND_DESCRIPTION,
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
    title: 'Clientes que já estão procurando',
    text: 'Diferente do anúncio que interrompe, um site bem trabalhado aparece para quem digitou exatamente o que você vende. Pessoas que já querem — não que precisam ser convencidas.',
  },
  {
    title: 'Funciona sem você apertar botão',
    text: 'Anúncio para quando o dinheiro para. Uma presença digital bem construída atrai visitantes dia e noite, sem depender de verba diária para funcionar.',
  },
  {
    title: 'Em paralelo com o que você já faz',
    text: 'Não substituímos seus anúncios nem seu WhatsApp. Adicionamos uma fonte de clientes qualificados que trabalha em paralelo — e que vem crescendo todo mês.',
  },
  {
    title: 'Aplicamos em nós o que fazemos por você',
    text: 'O maior case que temos somos nós mesmos. Você nos encontrou aqui — sem anúncio, sem indicação. É o método que entregamos para cada cliente.',
  },
]

export default function HomePage() {
  return (
    <MarketingLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <Script src="https://topsitebr.com.br/tracker.js" data-site-id="41442a6b-5fde-405e-a376-3161d0c44572" strategy="afterInteractive" />

      {/* ── 1. Hero — Animado ───────────────────────────────────────────── */}
      <AnimatedHero />

      {/* ── 2. O que muda com um site que funciona ───────────────────────── */}
      <section className="border-y border-white/10 bg-[#101010] px-4 py-20 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 grid gap-6 md:grid-cols-2 md:items-end">
            <div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-yellow-400">O que muda</p>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-5xl">
                Um site que só existe<br />não faz nada.
              </h2>
            </div>
            <p className="max-w-lg leading-relaxed text-white/65">
              A maioria das empresas tem um site. Mas quase nenhuma tem um site que trabalha — que atrai
              clientes que buscam ativamente o que a empresa vende. Essa diferença é enorme.
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
              Desenvolvemos sites, landing pages e lojas virtuais pensados para que sua empresa seja encontrada
              por quem já busca o que você vende. Escolha o formato que mais faz sentido para o seu negócio.
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

      {/* ── 4. Como trabalhamos ──────────────────────────────────────────── */}
      <section className="border-y border-white/10 bg-[#101010] px-4 py-20 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 grid gap-6 md:grid-cols-2">
            <div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-yellow-400">Como trabalhamos</p>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-5xl">
                Seu negócio orienta<br />cada decisão.
              </h2>
            </div>
            <p className="max-w-lg leading-relaxed text-white/65">
              Antes de escrever uma linha de código ou uma palavra de conteúdo, entendemos quem são seus
              clientes, o que eles buscam e como sua empresa pode aparecer no caminho deles.
            </p>
          </div>
          <ProcessSteps />
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

      {/* ── 6. Portfólio ────────────────────────────────────────────────── */}
      <section className="border-t border-white/10 bg-[#101010] px-4 py-20 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-yellow-400">Trabalhos realizados</p>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-5xl">Projetos de sites.</h2>
            </div>
            <Link href="/portfolio" className="inline-flex items-center gap-2 text-sm font-semibold text-yellow-400 hover:underline">
              Conhecer o portfólio <MarketingIcon name="arrow" />
            </Link>
          </div>
          <ProjectGrid />
        </div>
      </section>

      <ContactSection />
    </MarketingLayout>
  )
}
