import type { Metadata } from 'next'
import Link from 'next/link'
import { MarketingIcon } from '@/components/marketing/MarketingIcon'
import { SITE_URL, marketingMetadata, organizationSchema, projectContact } from '@/lib/marketing'
import { MarketingLayout, ProjectCTA, ContactSection } from '@/components/marketing/MarketingSections'

export const metadata: Metadata = marketingMetadata(
  'Sobre a TopSite | Sites que fazem empresas serem encontradas',
  'Há 5 anos criamos sites que fazem empresas serem encontradas por clientes reais. Conheça a história da TopSite e o método que aplicamos.',
  '/sobre',
)

const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    organizationSchema,
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Início', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Sobre', item: SITE_URL + '/sobre' },
      ],
    },
  ],
}

const values = [
  {
    title: 'Resultado, não entrega',
    text: 'Um site entregue não é o fim — é o começo. O que importa é o que ele faz pela empresa depois de ir ao ar. Cada decisão de projeto começa por aí.',
  },
  {
    title: 'Prova antes de promessa',
    text: 'Não prometemos posição garantida nem resultado instantâneo. Mostramos o método funcionando — em nós mesmos primeiro, depois nos nossos clientes.',
  },
  {
    title: 'Consultivo, não transacional',
    text: 'Cada projeto começa com uma conversa real. Entendemos o negócio, o mercado e o cliente antes de propor qualquer solução.',
  },
  {
    title: 'Transparência no escopo',
    text: 'Antes de começar, você sabe o que será feito, o que não está incluído e o que esperar. Sem surpresas no meio do caminho.',
  },
]

export default function SobrePage() {
  return (
    <MarketingLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-4 py-16 sm:px-8 sm:py-24">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(#facc15 1px, transparent 1px), linear-gradient(90deg, #facc15 1px, transparent 1px)", backgroundSize: "64px 64px", maskImage: "linear-gradient(to bottom, black, transparent)" }} />
        <div className="relative mx-auto max-w-7xl">
          <nav aria-label="Caminho da página" className="mb-12 flex flex-wrap gap-3 text-sm text-white/55">
            <Link href="/" className="hover:text-yellow-400">Início</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">Sobre</span>
          </nav>
          <div className="mx-auto max-w-3xl">
            <p className="mb-6 text-xs font-semibold uppercase tracking-[0.2em] text-yellow-400">A história por trás do método</p>
            <h1 className="mb-7 text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
              Surgimos do mesmo problema que você tem.
            </h1>
            <p className="text-xl leading-relaxed text-white/70">
              Há 5 anos, queríamos vender mais na internet. Desenvolvemos nosso próprio método,
              começamos a ser encontrados por clientes reais — e decidimos replicar isso para outras empresas.
            </p>
          </div>
        </div>
      </section>

      {/* ── História ────────────────────────────────────────────────────── */}
      <section className="border-y border-white/10 bg-[#101010] px-4 py-20 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-yellow-400">Como começou</p>
              <h2 className="mb-6 text-3xl font-semibold sm:text-4xl">
                A TopSite nasceu de uma necessidade real — não de uma ideia de negócio.
              </h2>
              <div className="space-y-5 leading-relaxed text-white/70">
                <p>
                  Antes de ajudar outras empresas, precisávamos resolver nosso próprio problema: vender mais
                  pela internet sem depender exclusivamente de anúncios pagos. Testamos abordagens,
                  desenvolvemos uma forma de trabalhar e começamos a aparecer para quem buscava o que oferecíamos.
                </p>
                <p>
                  O resultado foi consistente. Clientes chegavam sem que tivéssemos pago para alcançá-los.
                  Eram pessoas que pesquisaram, encontraram e entraram em contato — leads qualificados,
                  que já queriam o que tínhamos a oferecer.
                </p>
                <p>
                  Quando percebemos que o método era replicável, passamos a aplicá-lo em sites de outras
                  empresas. Há 5 anos fazemos isso — e você já viu funcionar: chegou até aqui da mesma forma.
                </p>
              </div>
            </div>
            <div className="space-y-5">
              <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/[0.04] p-8">
                <div className="mb-4 text-3xl text-yellow-400">"</div>
                <p className="text-lg font-semibold leading-relaxed">
                  Se conseguimos atrair clientes aplicando nosso método em nós mesmos, replicamos isso
                  pra você. A prova está em como você chegou até aqui.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-7">
                <p className="mb-2 text-xs uppercase tracking-widest text-white/50">O que nos diferencia</p>
                <p className="leading-relaxed text-white/80">
                  Não entregamos um site e sumimos. Posicionamos sua empresa na internet para que ela
                  seja encontrada pelos clientes que já procuram o que você oferece.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Valores ─────────────────────────────────────────────────────── */}
      <section className="px-4 py-20 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12">
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-yellow-400">Como trabalhamos</p>
            <h2 className="text-3xl font-semibold sm:text-4xl">O que orienta cada projeto.</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {values.map(({ title, text }, index) => (
              <article key={title} className="rounded-2xl border border-white/10 p-7 sm:p-8">
                <span className="mb-5 block text-sm font-semibold text-yellow-400">0{index + 1}</span>
                <h3 className="mb-3 text-xl font-semibold">{title}</h3>
                <p className="leading-relaxed text-white/65">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── O método (sem nome técnico) ──────────────────────────────────── */}
      <section className="border-y border-white/10 bg-[#101010] px-4 py-20 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:items-center">
            <div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-yellow-400">O nosso jeito</p>
              <h2 className="mb-6 text-3xl font-semibold sm:text-4xl">
                Fazer sua empresa aparecer quando procuram por você.
              </h2>
              <p className="mb-5 leading-relaxed text-white/70">
                Desenvolvemos sites com uma estrutura que ajuda os buscadores a entender o que sua empresa
                oferece — e a apresentar você para quem procura exatamente isso. Não é magia: é a forma certa
                de construir desde o início.
              </p>
              <p className="mb-8 leading-relaxed text-white/70">
                O resultado é uma fonte de clientes que funciona em paralelo com o que você já faz.
                Quem chega por esse caminho já quer o que você vende — é diferente de quem viu um anúncio
                enquanto rolava o feed.
              </p>
              <ProjectCTA label="Quero que me encontrem assim" />
            </div>
            <ol className="space-y-0">
              {[
                ['Entendemos o seu mercado', 'Quem são seus clientes, o que eles buscam e como sua empresa pode aparecer no caminho deles.'],
                ['Construímos com propósito', 'Cada página, cada título, cada caminho de navegação pensado para que quem chegou encontre o que procura.'],
                ['Acompanhamos o resultado', 'O lançamento é o começo. Continuamos presentes para que o trabalho evolua conforme sua empresa cresce.'],
              ].map(([title, text], i) => (
                <li key={title} className="border-t border-white/10 py-8">
                  <div className="flex gap-6">
                    <span className="shrink-0 text-sm font-semibold text-yellow-400">0{i + 1}</span>
                    <div>
                      <h3 className="mb-2 font-semibold">{title}</h3>
                      <p className="leading-relaxed text-white/65">{text}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ── CTA final ───────────────────────────────────────────────────── */}
      <section className="px-4 py-20 text-center sm:px-8 sm:py-28">
        <div className="mx-auto max-w-3xl">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-yellow-400">O próximo passo</p>
          <h2 className="mb-5 text-3xl font-semibold sm:text-5xl">
            Pronto para sua empresa ser encontrada assim?
          </h2>
          <p className="mb-8 text-lg leading-relaxed text-white/65">
            A conversa é gratuita e sem compromisso. Entendemos o seu negócio e mostramos,
            de forma concreta, como podemos fazer sua empresa aparecer para quem já busca o que você oferece.
          </p>
          <ProjectCTA />
          <nav aria-label="Ver serviços" className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-4 text-sm text-white/55">
            <Link href="/criacao-de-sites" className="hover:text-yellow-400">Criação de sites</Link>
            <Link href="/site-institucional" className="hover:text-yellow-400">Site institucional</Link>
            <Link href="/landing-page" className="hover:text-yellow-400">Landing pages</Link>
            <Link href="/loja-virtual" className="hover:text-yellow-400">Lojas virtuais</Link>
          </nav>
        </div>
      </section>
    </MarketingLayout>
  )
}
