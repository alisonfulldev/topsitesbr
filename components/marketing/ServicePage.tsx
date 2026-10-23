import Link from 'next/link'
import { MarketingIcon } from './MarketingIcon'
import { SITE_URL, marketingServices, organizationSchema, monthlyOfferSchema } from '@/lib/marketing'
import type { ReactNode } from 'react'
import type { ServiceContent } from '@/lib/marketing-services'
import { MarketingLayout, ProjectCTA, PriceTag, ProcessSteps, CTABand, PricingSection } from './MarketingSections'

export function ServicePage({ content, bottomSection }: { content: ServiceContent; bottomSection?: ReactNode }) {
  const url = SITE_URL + '/' + content.slug
  const product = content.offerProduct
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      organizationSchema,
      { '@type': 'Service', '@id': url + '/#service', name: content.label, description: content.description, url, provider: { '@id': SITE_URL + '/#organization' }, areaServed: { '@type': 'Country', name: 'Brazil' }, ...(product && { offers: monthlyOfferSchema }) },
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Início', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: content.label, item: url },
      ] },
    ],
  }
  const message = product
    ? 'Olá! Quero contratar ' + product.toLowerCase() + ' por R$ 97/mês.'
    : 'Olá! Quero um orçamento de ' + content.label.toLowerCase() + ' com a TopSite.'
  return (
    <MarketingLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />
      <section className="px-4 py-12 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <nav aria-label="Caminho da página" className="mb-12 flex flex-wrap gap-3 text-sm text-black/55">
            <Link href="/" className="hover:text-black">Início</Link><span aria-hidden="true">/</span><span aria-current="page">{content.label}</span>
          </nav>
          <div className="grid items-center gap-12 lg:grid-cols-[1.3fr_1fr]">
            <div>
              <p className="mb-5 text-xs font-semibold uppercase tracking-widest text-black/55">{content.eyebrow}</p>
              <h1 className="mb-6 text-4xl font-semibold leading-[1.12] tracking-tight sm:text-5xl lg:text-6xl">{content.heading}</h1>
              {product && <PriceTag product={product} className="mb-6" />}
              <p className="mb-8 max-w-2xl text-lg leading-relaxed text-black/70">{content.intro}</p>
              <ProjectCTA message={message} />
              <p className="mt-5 text-sm text-black/55">Resposta rápida no WhatsApp · Atendimento em todo o Brasil</p>
            </div>
            <aside className="rounded-3xl border border-[#FDD900] bg-[#FFFBE0] p-7 sm:p-10">
              <p className="mb-5 text-xs uppercase tracking-widest text-black/55">Feito para sua necessidade</p>
              <h2 className="mb-4 text-2xl font-semibold">{content.focus}</h2>
              <p className="mb-8 leading-relaxed text-black/70">{content.audience}</p>
              <ul className="space-y-4">
                {content.deliverables.map((item) => <li key={item} className="flex gap-3 text-sm leading-relaxed text-black/80"><MarketingIcon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-black" />{item}</li>)}
              </ul>
            </aside>
          </div>
        </div>
      </section>
      <section className="border-y border-black/10 bg-white px-4 py-20 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-balance text-center mb-10 text-3xl font-semibold tracking-tight sm:text-4xl">O que podemos construir no seu projeto</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {content.features.map(({ title, text }, index) => (
              <article key={title} className="rounded-2xl border border-black/10 p-7 sm:p-8">
                <span className="mb-5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#FDD900] text-sm font-semibold tabular-nums text-black">0{index + 1}</span>
                <h3 className="mb-3 text-xl font-semibold">{title}</h3>
                <p className="leading-relaxed text-black/70">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <CTABand message={message} />
      <section className="px-4 py-20 sm:px-8">
        <div className="mx-auto max-w-7xl"><h2 className="text-balance text-center mb-10 text-3xl font-semibold sm:text-4xl">Como trabalhamos</h2><ProcessSteps /><div className="mt-12 text-center"><ProjectCTA message={message} /></div></div>
      </section>
      <section className="bg-white px-4 py-20 sm:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-balance text-center mb-8 text-3xl font-semibold">Antes de começar</h2>
          <div>
            {content.faqs.map(({ q, a }) => <details key={q} className="group/faq border-b border-black/15 py-5 first:border-t"><summary className="flex cursor-pointer list-none items-center justify-between gap-5 font-semibold [&::-webkit-details-marker]:hidden"><span>{q}</span><MarketingIcon name="plus" className="h-5 w-5 shrink-0 text-black transition-transform group-open/faq:rotate-45" /></summary><p className="mt-4 leading-relaxed text-black/70">{a}</p></details>)}
          </div>
        </div>
      </section>
      {bottomSection}
      <PricingSection message={message} product={product} />
      <section className="px-4 py-20 text-center sm:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-5 text-3xl font-semibold sm:text-4xl">Vamos conversar sobre sua ideia?</h2>
          <p className="mb-8 text-lg text-black/70">O primeiro passo é entender o que sua empresa precisa.</p>
          <ProjectCTA message={message} />
          <nav aria-label="Outros serviços" className="mt-12 flex flex-wrap justify-center gap-x-6 gap-y-4 text-sm text-black/70">
            {marketingServices.filter(({ href }) => href !== '/' + content.slug).map(({ href, label }) => <Link key={href} href={href} className="underline decoration-[#FDD900] decoration-2 underline-offset-4 hover:text-black">{label}</Link>)}
          </nav>
        </div>
      </section>
    </MarketingLayout>
  )
}
