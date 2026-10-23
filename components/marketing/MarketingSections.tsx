import type { ReactNode } from 'react'
import { MarketingIcon, WhatsAppIcon } from './MarketingIcon'
import { MarketingHeader } from './MarketingHeader'
import { MarketingFooter } from './MarketingFooter'
import { offer, offerHighlights, projectContact } from '@/lib/marketing'

const CTA_LABEL = 'Quero meu site por ' + offer.price

// Todas as páginas de divulgação usam o tema claro da home; theme="dark" fica disponível se alguma precisar.
export function MarketingLayout({ children, theme = 'light' }: { children: ReactNode; theme?: 'dark' | 'light' }) {
  const light = theme === 'light'
  return (
    <div className={'min-h-screen selection:bg-[#FDD900] selection:text-black ' + (light ? 'bg-white text-black' : 'bg-[#0a0a0a] text-white')}>
      <MarketingHeader theme={theme} />
      <main id="conteudo-principal" className="pt-16">{children}</main>
      <MarketingFooter />
    </div>
  )
}

// CTA principal — abre o WhatsApp com a mensagem pronta
// Mesmo visual dos botões da home: amarelo com texto preto; variant="dark" para usar sobre fundo amarelo.
const ctaVariants = {
  yellow: 'bg-[#FDD900] text-black hover:bg-[#E8C700] focus-visible:ring-black focus-visible:ring-offset-white',
  dark: 'bg-black text-white hover:bg-[#262626] focus-visible:ring-black focus-visible:ring-offset-[#FDD900]',
}

// "R$ 97/mês" nunca se parte em duas linhas dentro do botão
function withUnbreakablePrice(label: string) {
  const at = label.indexOf(offer.price)
  if (at === -1) return label
  return <>{label.slice(0, at)}<span className="whitespace-nowrap">{offer.price}</span>{label.slice(at + offer.price.length)}</>
}

export function ProjectCTA({ message, label = CTA_LABEL, className = '', variant = 'yellow' }: { message?: string; label?: string; className?: string; variant?: keyof typeof ctaVariants }) {
  return (
    <a href={projectContact(message)} target="_blank" rel="noopener noreferrer" className={'inline-flex min-h-14 max-w-full items-center justify-center gap-2.5 rounded-xl px-8 py-3 text-center text-base font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ' + ctaVariants[variant] + ' ' + className}>
      <WhatsAppIcon className="h-5 w-5 shrink-0" />
      <span>{withUnbreakablePrice(label)}</span>
    </a>
  )
}

// Selo de preço para os banners — o preço é o grande diferencial
export function PriceTag({ product = offer.product, className = '' }: { product?: string; className?: string }) {
  return (
    <div className={'inline-flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-2xl bg-[#FDD900] px-5 py-3 text-black ' + className}>
      <span className="text-sm font-semibold text-black/80">{product} por apenas</span>
      <span className="text-3xl font-semibold tracking-tight sm:text-4xl">{offer.price}</span>
    </div>
  )
}

// Faixa de CTA entre seções — aumenta os pontos de conversão ao longo da página
export function CTABand({ message, title = 'Seu site profissional por apenas ' + offer.price + '. Chame no WhatsApp.', label }: { message?: string; title?: string; label?: string }) {
  return (
    <section className="bg-white px-4 py-12 text-black sm:px-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 rounded-[28px] bg-[#FDD900] px-6 py-10 text-center sm:px-12 md:flex-row md:text-left">
        <p className="max-w-2xl text-xl font-semibold sm:text-2xl">{title}</p>
        <ProjectCTA message={message} label={label} variant="dark" className="w-full shrink-0 md:w-auto" />
      </div>
    </section>
  )
}

// Selos das condições da oferta (30 dias, 12 meses, SEO, Google Meu Negócio) — mesmos da home
export function OfferHighlights({ className = '' }: { className?: string }) {
  return (
    <ul className={'mx-auto grid max-w-2xl grid-cols-[auto_auto] justify-center gap-1.5 sm:flex sm:flex-wrap sm:items-center sm:justify-center sm:gap-x-3 sm:gap-y-4 ' + className}>
      {offerHighlights.map(({ icon, label }, index) => (
        <li key={label} className={'flex sm:justify-center' + (index === 0 ? ' sm:w-full' : '')}>
          <span className="inline-flex w-full items-center justify-center gap-1 whitespace-nowrap rounded-full border border-black/20 bg-white/40 px-2 py-1.5 text-[clamp(8.5px,2.5vw,12px)] max-[339px]:whitespace-normal font-semibold tracking-tight sm:w-auto sm:gap-2 sm:px-4 sm:py-2 sm:text-sm sm:tracking-normal">
            <MarketingIcon name={icon} className="h-3 w-3 shrink-0 sm:h-4 sm:w-4" strokeWidth={2} />
            {label}
          </span>
        </li>
      ))}
    </ul>
  )
}

export function PricingSection({ message, product = offer.product }: { message?: string; product?: string }) {
  return (
    <section id="investimento" className="scroll-mt-24 border-t border-black/[0.06] bg-white px-4 py-20 text-black sm:px-8 sm:py-24">
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-black/55">Preço</p>
          <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-5xl">Site profissional sem pagar caro.</h2>
        </div>
        <div className="mx-auto max-w-3xl rounded-[28px] bg-[#FDD900] px-5 py-12 sm:px-12 sm:py-16">
          <div className="mb-10 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-black/70">{product} por apenas</p>
            <p className="text-[clamp(3.25rem,2rem+6vw,6rem)] font-semibold leading-none tracking-[-0.04em]">
              {offer.amount}<span className="text-[0.4em] font-semibold tracking-tight">{offer.period}</span>
            </p>
            <OfferHighlights className="mt-6" />
          </div>
          <ul className="mx-auto mb-10 max-w-xl space-y-6">
            {offer.deliverables.map(({ title, text }, index) => (
              <li key={title} className="flex gap-4">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-black text-[#FDD900]"><MarketingIcon name="check" className="h-4 w-4" /></span>
                <div>
                  <p className="text-lg font-semibold">{index === 0 ? product : title}</p>
                  <p className="leading-relaxed text-black/75">{text}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="text-center">
            <ProjectCTA message={message} variant="dark" className="w-full sm:w-auto" />
            <p className="mt-5 text-sm text-black/70">Resposta rápida no WhatsApp · Atendimento em todo o Brasil</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export function ProcessSteps() {
  return (
    <ol className="grid gap-8 md:grid-cols-3">
      {[
        ['Chame no WhatsApp', 'Conte sobre a sua empresa e envie o que tiver: logo, fotos, serviços e contatos. Sem reunião, sem burocracia.'],
        ['Montamos o seu site', 'Criamos a página com a cara do seu negócio, adaptada ao celular e com o botão de WhatsApp em destaque.'],
        ['Você aprova e pronto', 'Você confere, pede os ajustes que precisar e o seu site fica pronto para ir ao ar.'],
      ].map(([title, text], index) => (
        <li key={title} className="border-t border-black/10 pt-8 text-center">
          <span className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#FDD900] text-xl font-semibold tabular-nums tracking-tight text-black">0{index + 1}</span>
          <h3 className="mb-3 text-xl font-semibold">{title}</h3>
          <p className="mx-auto max-w-sm leading-relaxed text-black/70">{text}</p>
        </li>
      ))}
    </ol>
  )
}

export function ContactSection() {
  return (
    <section className="border-t border-black/[0.06] bg-white px-4 py-20 text-center text-black sm:px-8 sm:py-28">
      <div className="mx-auto max-w-3xl">
        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-black/55">Vamos conversar</p>
        <h2 className="mb-5 text-3xl font-semibold tracking-tight sm:text-5xl">Seu site profissional por apenas {offer.price}.</h2>
        <p className="mb-8 text-lg leading-relaxed text-black/70">Chame no WhatsApp, conte sobre a sua empresa e a gente monta o seu site. Simples assim.</p>
        <ProjectCTA />
        <p className="mt-5 text-sm text-black/55">Resposta rápida no WhatsApp · Todo o Brasil</p>
      </div>
    </section>
  )
}
