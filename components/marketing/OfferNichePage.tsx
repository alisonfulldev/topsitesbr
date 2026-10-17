import Link from 'next/link'
import type { Metadata } from 'next'
import { MarketingIcon } from './MarketingIcon'
import { MarketingLayout, ProjectCTA, PriceTag, ProcessSteps, CTABand, PricingSection } from './MarketingSections'
import { RelatedLinksSection } from './RelatedLinksSection'
import { SITE_URL, marketingMetadata, organizationSchema } from '@/lib/marketing'
import { serviceContent, nicheOfferServices, type NicheOfferService } from '@/lib/marketing-services'
import { niches, getNichesBySector, type NicheData } from '@/lib/seo/niches'

// Páginas programáticas serviço × nicho (ex: /pagina-de-vendas/dentista) — todas por R$ 165

const nicheIntro: Record<NicheOfferService, (plural: string) => string> = {
  'landing-page': (plural) => `Uma landing page para ${plural} divulgarem um serviço, uma promoção ou uma campanha com mensagem clara e botão de WhatsApp em destaque — por apenas R$ 165.`,
  'pagina-de-vendas': (plural) => `Uma página de vendas para ${plural} apresentarem um serviço ou pacote com benefícios, depoimentos e pedido direto pelo WhatsApp — por apenas R$ 165.`,
  'pagina-de-lancamento': (plural) => `Uma página de lançamento para ${plural} divulgarem uma novidade, inauguração, evento ou serviço novo com um link próprio — por apenas R$ 165.`,
  'pagina-de-captura': (plural) => `Uma página de captura para ${plural} atraírem novos contatos com uma oferta, cupom ou avaliação, e conversarem com eles pelo WhatsApp — por apenas R$ 165.`,
}

// Resumo curto para a meta description (cabe nos ~160 caracteres do Google)
const nicheBlurb: Record<NicheOfferService, string> = {
  'landing-page': 'divulgue um serviço ou promoção',
  'pagina-de-vendas': 'venda seu serviço com pedido pelo WhatsApp',
  'pagina-de-lancamento': 'divulgue uma novidade, evento ou inauguração',
  'pagina-de-captura': 'atraia novos contatos com uma oferta ou cupom',
}

export function offerNicheParams() {
  return niches.map((niche) => ({ nicho: niche.slug }))
}

function productOf(service: NicheOfferService) {
  return serviceContent[service].offerProduct
}

export function offerNicheMetadata(service: NicheOfferService, niche: NicheData | undefined, nicho: string): Metadata {
  const path = '/' + service + '/' + nicho
  if (!niche) return marketingMetadata('Página não encontrada', 'Página não encontrada', path)
  const product = productOf(service)
  return marketingMetadata(
    `${product} para ${niche.name} por R$ 165 | TopSite`,
    `${product} para ${niche.name.toLowerCase()} por apenas R$ 165: ${nicheBlurb[service]}. Adaptada ao celular e com WhatsApp em destaque.`,
    path,
  )
}

export function OfferNichePage({ service, niche }: { service: NicheOfferService; niche: NicheData }) {
  const content = serviceContent[service]
  const product = productOf(service)
  const productLower = product.toLowerCase()
  const nicheLower = niche.name.toLowerCase()
  const url = `${SITE_URL}/${service}/${niche.slug}`
  const message = `Olá! Quero uma ${productLower} para ${nicheLower} por R$ 165.`
  const intro = nicheIntro[service](niche.plural.toLowerCase()) + ' ' + niche.intro

  const relatedGroups = [
    {
      heading: `Outras páginas para ${nicheLower}`,
      links: [
        { label: `Site para ${niche.name}`, href: `/site-para/${niche.slug}` },
        ...nicheOfferServices
          .filter((s) => s !== service)
          .map((s) => ({ label: `${productOf(s)} para ${niche.name}`, href: `/${s}/${niche.slug}` })),
      ],
    },
    {
      heading: `${product} para outros segmentos`,
      links: getNichesBySector(niche.sector, niche.slug, 8).map((n) => ({ label: `${product} para ${n.name}`, href: `/${service}/${n.slug}` })),
    },
  ]

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      organizationSchema,
      {
        '@type': 'Service',
        '@id': url + '/#service',
        name: `${product} para ${niche.name}`,
        description: `Criação de ${productLower} para ${niche.plural.toLowerCase()} por R$ 165.`,
        url,
        provider: { '@id': SITE_URL + '/#organization' },
        areaServed: { '@type': 'Country', name: 'Brazil' },
        offers: { '@type': 'Offer', price: '165', priceCurrency: 'BRL' },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Início', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: content.label, item: SITE_URL + '/' + service },
          { '@type': 'ListItem', position: 3, name: niche.name, item: url },
        ],
      },
    ],
  }

  const faqs = [
    { q: `Quanto custa uma ${productLower} para ${nicheLower}?`, a: content.faqs[0].a },
    ...content.faqs.slice(1, 2),
    ...niche.faqs.slice(0, 2),
  ]

  return (
    <MarketingLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />
      <section className="px-4 py-12 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <nav aria-label="Caminho da página" className="mb-12 flex flex-wrap gap-3 text-sm text-white/55">
            <Link href="/" className="hover:text-yellow-400">Início</Link><span aria-hidden="true">/</span>
            <Link href={'/' + service} className="hover:text-yellow-400">{content.label}</Link><span aria-hidden="true">/</span>
            <span aria-current="page">{niche.name}</span>
          </nav>
          <div className="grid items-center gap-12 lg:grid-cols-[1.3fr_1fr]">
            <div>
              <p className="mb-5 text-xs font-semibold uppercase tracking-widest text-yellow-400">{product} · {niche.sector}</p>
              <h1 className="mb-6 text-4xl font-semibold leading-[1.12] tracking-tight sm:text-5xl lg:text-6xl">{product} para {nicheLower} por apenas <span className="text-[#25D366]">R$ 165</span></h1>
              <PriceTag product={product} className="mb-6" />
              <p className="mb-8 max-w-2xl text-lg leading-relaxed text-white/70">{intro}</p>
              <ProjectCTA message={message} label={'Quero minha ' + productLower + ' por R$ 165'} />
              <p className="mt-5 text-sm text-white/50">Resposta rápida no WhatsApp · Atendimento em todo o Brasil</p>
            </div>
            <aside className="rounded-3xl border border-yellow-400/20 bg-yellow-400/[0.04] p-7 sm:p-10">
              <p className="mb-5 text-xs uppercase tracking-widest text-yellow-400">Feito para {niche.plural.toLowerCase()}</p>
              <h2 className="mb-4 text-2xl font-semibold">Tudo isso por R$ 165</h2>
              <p className="mb-8 leading-relaxed text-white/65">{content.audience}</p>
              <ul className="space-y-4">
                {content.deliverables.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-relaxed text-white/80">
                    <MarketingIcon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-yellow-400" />{item}
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#101010] px-4 py-20 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-10 text-3xl font-semibold tracking-tight sm:text-4xl">O que a sua {productLower} pode ter</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {content.features.map(({ title, text }, index) => (
              <article key={title} className="rounded-2xl border border-white/10 p-7 sm:p-8">
                <span className="mb-5 block text-sm font-semibold text-yellow-400">0{index + 1}</span>
                <h3 className="mb-3 text-xl font-semibold">{title}</h3>
                <p className="leading-relaxed text-white/65">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <CTABand message={message} title={`${product} para ${nicheLower} por apenas R$ 165.`} label={'Quero minha ' + productLower} />

      <section className="px-4 py-20 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-4 text-3xl font-semibold tracking-tight sm:text-4xl">Ideias do que mostrar para os clientes de {nicheLower}</h2>
          <p className="mb-10 max-w-2xl text-white/65">{niche.focus}. Você escolhe o que entra na página e a gente monta.</p>
          <div className="grid gap-6 md:grid-cols-2">
            {niche.features.map(({ title, text }) => (
              <article key={title} className="rounded-2xl border border-white/10 p-7 sm:p-8">
                <h3 className="mb-3 text-xl font-semibold">{title}</h3>
                <p className="leading-relaxed text-white/65">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-[#101010] px-4 py-20 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-10 text-3xl font-semibold sm:text-4xl">Como funciona</h2>
          <ProcessSteps />
          <div className="mt-12 text-center">
            <ProjectCTA message={message} label={'Quero minha ' + productLower + ' por R$ 165'} />
          </div>
        </div>
      </section>

      <section className="bg-[#101010] px-4 py-20 sm:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-8 text-3xl font-semibold">Perguntas frequentes</h2>
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

      <PricingSection message={message} product={product} />
      <RelatedLinksSection groups={relatedGroups} />
      <section className="px-4 py-20 text-center sm:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-5 text-3xl font-semibold sm:text-4xl">Sua {productLower} para {nicheLower} por apenas R$ 165</h2>
          <p className="mb-8 text-lg text-white/65">Chame no WhatsApp, conte sobre o seu negócio e a gente monta a sua página.</p>
          <ProjectCTA message={message} label={'Quero minha ' + productLower + ' por R$ 165'} />
        </div>
      </section>
    </MarketingLayout>
  )
}
