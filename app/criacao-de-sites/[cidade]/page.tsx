import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { cities, getCityBySlug } from '@/lib/seo/cities'
import { SITE_URL, marketingMetadata, marketingServices, organizationSchema, projectContact } from '@/lib/marketing'
import { MarketingLayout, ProjectCTA, ProcessSteps } from '@/components/marketing/MarketingSections'
import { MarketingIcon } from '@/components/marketing/MarketingIcon'

export const dynamicParams = false

export function generateStaticParams() {
  return cities.map((city) => ({ cidade: city.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ cidade: string }> }): Promise<Metadata> {
  const { cidade } = await params
  const city = getCityBySlug(cidade)
  if (!city) return marketingMetadata('Página não encontrada', 'Página não encontrada', '/criacao-de-sites/' + cidade)
  const title = 'Criação de Sites em ' + city.name + ' | TopSite'
  const description = 'Desenvolvemos sites profissionais para empresas de ' + city.name + ' (' + city.stateAbbr + '). Design responsivo, SEO e integração com WhatsApp. Solicite uma proposta à TopSite.'
  return marketingMetadata(title, description, '/criacao-de-sites/' + city.slug)
}

const cityDeliverables = [
  'Estrutura de páginas planejada com você',
  'Design responsivo para celular e desktop',
  'Configuração de canais de contato',
  'Revisão e ajustes antes da publicação',
]

const cityFeatures = [
  { title: 'Presença que aparece no Google', text: 'Estruturamos títulos, descrições e conteúdo para ajudar buscadores a entender cada página, ampliando as chances de aparecer para quem procura no seu bairro ou cidade.' },
  { title: 'Design adaptado ao celular', text: 'A maioria dos acessos vem do celular. Cores, tipografia e navegação são desenhadas para ler bem e agir rápido em qualquer tela.' },
  { title: 'Contato ao alcance', text: 'WhatsApp, formulários e telefone posicionados nos pontos certos para que o visitante inicie a conversa sem procurar.' },
  { title: 'Autoridade local', text: 'Informações da empresa organizadas para transmitir credibilidade e diferenciar sua marca dentro da concorrência da região.' },
]

export default async function Page({ params }: { params: Promise<{ cidade: string }> }) {
  const { cidade } = await params
  const city = getCityBySlug(cidade)
  if (!city) notFound()

  const url = SITE_URL + '/criacao-de-sites/' + city.slug
  const economyText = city.economy.slice(0, -1).join(', ') + ' e ' + city.economy[city.economy.length - 1]
  const intro = 'Desenvolvemos sites profissionais para empresas de ' + city.name + ' e região. ' + city.context + ' O mercado local tem forte presença em ' + economyText + ' — setores onde um site bem estruturado faz diferença na hora de conquistar novos clientes.'
  const message = 'Olá! Tenho uma empresa em ' + city.name + ' e quero criar um site com a TopSite.'

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      organizationSchema,
      {
        '@type': 'Service',
        '@id': url + '/#service',
        name: 'Criação de sites em ' + city.name,
        description: 'Criação de sites profissionais para empresas de ' + city.name + ' (' + city.stateAbbr + ').',
        url,
        provider: { '@id': SITE_URL + '/#organization' },
        areaServed: { '@type': 'City', name: city.name },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Início', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Criação de Sites', item: SITE_URL + '/criacao-de-sites' },
          { '@type': 'ListItem', position: 3, name: city.name, item: url },
        ],
      },
    ],
  }

  const faqs = [
    {
      q: 'Quanto custa um site em ' + city.name + '?',
      a: 'O investimento depende da quantidade de páginas, do conteúdo e das funcionalidades. Depois de entender o que sua empresa em ' + city.name + ' precisa, apresentamos uma proposta com escopo, prazo e condições.',
    },
    {
      q: 'Vocês atendem empresas de ' + city.name + ' presencialmente?',
      a: 'Atendemos todo o Brasil de forma remota, com reuniões por videoconferência e comunicação por WhatsApp e e-mail. Empresas de ' + city.name + ' e região são atendidas com o mesmo cuidado e agilidade de um atendimento local.',
    },
    {
      q: 'O site vai aparecer para quem busca em ' + city.name + '?',
      a: 'Configuramos as informações do site (localização, cidade, região) para ajudar os buscadores a entender que sua empresa atende ' + city.name + '/' + city.stateAbbr + '. Isso melhora a chance de aparecer para o público local, embora a posição exata dependa também da concorrência.',
    },
    {
      q: 'Quanto tempo leva para o site ir ao ar?',
      a: 'O cronograma é definido conforme o escopo. Para sites institucionais em ' + city.name + ', trabalhamos com prazos que respeitam o planejamento e as validações necessárias antes da publicação. Você recebe essa previsão na proposta.',
    },
  ]

  return (
    <MarketingLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />
      <section className="px-4 py-12 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <nav aria-label="Caminho da página" className="mb-12 flex flex-wrap gap-3 text-sm text-white/55">
            <Link href="/" className="hover:text-yellow-400">Início</Link><span aria-hidden="true">/</span>
            <Link href="/criacao-de-sites" className="hover:text-yellow-400">Criação de sites</Link><span aria-hidden="true">/</span>
            <span aria-current="page">{city.name}</span>
          </nav>
          <div className="grid items-center gap-12 lg:grid-cols-[1.3fr_1fr]">
            <div>
              <p className="mb-5 text-xs font-semibold uppercase tracking-widest text-yellow-400">{city.name} — {city.stateAbbr}</p>
              <h1 className="mb-6 text-4xl font-semibold leading-[1.12] tracking-tight sm:text-5xl lg:text-6xl">Criação de sites em {city.name}</h1>
              <p className="mb-8 max-w-2xl text-lg leading-relaxed text-white/70">{intro}</p>
              <ProjectCTA message={message} />
              <p className="mt-5 text-sm text-white/50">Projeto sob orçamento · Atendimento remoto em {city.name} e todo o Brasil</p>
            </div>
            <aside className="rounded-3xl border border-yellow-400/20 bg-yellow-400/[0.04] p-7 sm:p-10">
              <p className="mb-5 text-xs uppercase tracking-widest text-yellow-400">O que entregamos</p>
              <h2 className="mb-4 text-2xl font-semibold">Um site pensado para sua empresa</h2>
              <p className="mb-8 leading-relaxed text-white/65">Para empresas de {city.name} que querem apresentar seus serviços, organizar informações e transformar visitas em conversas.</p>
              <ul className="space-y-4">
                {cityDeliverables.map((item) => <li key={item} className="flex gap-3 text-sm leading-relaxed text-white/80"><MarketingIcon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-yellow-400" />{item}</li>)}
              </ul>
            </aside>
          </div>
        </div>
      </section>
      <section className="border-y border-white/10 bg-[#101010] px-4 py-20 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-10 text-3xl font-semibold tracking-tight sm:text-4xl">O que seu site em {city.name} pode ter</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {cityFeatures.map(({ title, text }, index) => (
              <article key={title} className="rounded-2xl border border-white/10 p-7 sm:p-8">
                <span className="mb-5 block text-sm font-semibold text-yellow-400">0{index + 1}</span>
                <h3 className="mb-3 text-xl font-semibold">{title}</h3>
                <p className="leading-relaxed text-white/65">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="px-4 py-20 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-10 text-3xl font-semibold sm:text-4xl">Como trabalhamos</h2>
          <ProcessSteps />
        </div>
      </section>
      <section className="bg-[#101010] px-4 py-20 sm:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-8 text-3xl font-semibold">Perguntas de quem contrata em {city.name}</h2>
          <div className="space-y-4">
            {faqs.map(({ q, a }) => (
              <details key={q} className="group/faq rounded-xl border border-white/10 p-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-5 font-semibold [&::-webkit-details-marker]:hidden">
                  <span>{q}</span>
                  <MarketingIcon name="plus" className="h-5 w-5 shrink-0 text-yellow-400 transition-transform group-open/faq:rotate-45" />
                </summary>
                <p className="mt-4 leading-relaxed text-white/65">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
      <section className="px-4 py-20 text-center sm:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-5 text-3xl font-semibold sm:text-4xl">Vamos criar o site da sua empresa em {city.name}?</h2>
          <p className="mb-8 text-lg text-white/65">O primeiro passo é entender o que sua empresa precisa. Fale com a TopSite pelo WhatsApp.</p>
          <ProjectCTA message={message} />
          <nav aria-label="Outros serviços" className="mt-12 flex flex-wrap justify-center gap-x-6 gap-y-4 text-sm text-white/65">
            {marketingServices.filter(({ href }) => href !== '/criacao-de-sites').map(({ href, label }) => (
              <Link key={href} href={href} className="underline decoration-white/25 underline-offset-4 hover:text-yellow-400">{label}</Link>
            ))}
          </nav>
          <p className="mt-8 text-xs text-white/40">
            <a href={projectContact(message)} target="_blank" rel="noopener noreferrer" className="hover:text-yellow-400">Atendimento remoto em {city.name} e todo o Brasil</a>
          </p>
        </div>
      </section>
    </MarketingLayout>
  )
}
