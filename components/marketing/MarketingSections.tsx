import type { ReactNode } from 'react'
import { MarketingIcon, WhatsAppIcon } from './MarketingIcon'
import { MarketingHeader } from './MarketingHeader'
import { MarketingFooter } from './MarketingFooter'
import { offer, projectContact } from '@/lib/marketing'

const CTA_LABEL = 'Quero meu site por ' + offer.price

// theme="light": página clara (home). As páginas de serviço seguem no tema escuro.
export function MarketingLayout({ children, theme = 'dark' }: { children: ReactNode; theme?: 'dark' | 'light' }) {
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
export function ProjectCTA({ message, label = CTA_LABEL, className = '' }: { message?: string; label?: string; className?: string }) {
  return (
    <a href={projectContact(message)} target="_blank" rel="noopener noreferrer" className={'cta-pulse inline-flex max-w-full items-center justify-center gap-3 rounded-2xl bg-[#25D366] px-8 py-5 text-center text-base font-bold text-white shadow-lg shadow-[#25D366]/25 transition-colors hover:bg-[#1ebe5b] sm:px-10 sm:text-lg ' + className}>
      <WhatsAppIcon />
      {label}
    </a>
  )
}

// Selo de preço para os banners — o preço é o grande diferencial
export function PriceTag({ product = offer.product, className = '' }: { product?: string; className?: string }) {
  return (
    <div className={'inline-flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-2xl border border-[#25D366]/40 bg-[#25D366]/10 px-5 py-3 ' + className}>
      <span className="text-sm font-semibold text-white/80">{product} por apenas</span>
      <span className="text-3xl font-bold tracking-tight text-[#25D366] sm:text-4xl">{offer.price}</span>
    </div>
  )
}

// Faixa de CTA entre seções — aumenta os pontos de conversão ao longo da página
export function CTABand({ message, title = 'Seu site profissional por apenas ' + offer.price + '. Chame no WhatsApp.', label }: { message?: string; title?: string; label?: string }) {
  return (
    <section className="border-y border-[#25D366]/20 bg-[#25D366]/[0.05] px-4 py-12 sm:px-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 text-center md:flex-row md:text-left">
        <p className="max-w-2xl text-xl font-semibold sm:text-2xl">{title}</p>
        <ProjectCTA message={message} label={label} className="w-full shrink-0 md:w-auto" />
      </div>
    </section>
  )
}

export function PricingSection({ message, product = offer.product }: { message?: string; product?: string }) {
  return (
    <section id="investimento" className="scroll-mt-24 border-t border-white/10 px-4 py-20 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-yellow-400">Preço</p>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-5xl">Site profissional sem pagar caro.</h2>
        </div>
        <div className="rounded-3xl border border-[#25D366]/30 bg-gradient-to-b from-[#25D366]/[0.08] to-transparent p-7 sm:p-12">
          <div className="mb-10 text-center">
            <p className="mb-2 text-sm uppercase tracking-widest text-white/55">{product} por apenas</p>
            <p className="text-7xl font-bold tracking-tight text-[#25D366] sm:text-8xl">{offer.price}</p>
          </div>
          <ul className="mb-10 space-y-6">
            {offer.deliverables.map(({ title, text }, index) => (
              <li key={title} className="flex gap-4">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white"><MarketingIcon name="check" className="h-4 w-4" /></span>
                <div>
                  <p className="text-lg font-semibold">{index === 0 ? product : title}</p>
                  <p className="leading-relaxed text-white/65">{text}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="text-center">
            <ProjectCTA message={message} className="w-full sm:w-auto" />
            <p className="mt-5 text-sm text-white/50">Resposta rápida no WhatsApp · Atendimento em todo o Brasil</p>
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
        <li key={title} className="border-t border-white/15 pt-6">
          <span className="mb-5 block text-sm font-semibold text-yellow-400">0{index + 1}</span>
          <h3 className="mb-3 text-xl font-semibold">{title}</h3>
          <p className="leading-relaxed text-white/65">{text}</p>
        </li>
      ))}
    </ol>
  )
}

export function ContactSection() {
  return (
    <section className="border-t border-white/10 px-4 py-20 text-center sm:px-8 sm:py-28">
      <div className="mx-auto max-w-3xl">
        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-yellow-400">Vamos conversar</p>
        <h2 className="mb-5 text-3xl font-semibold tracking-tight sm:text-5xl">Seu site profissional por apenas {offer.price}.</h2>
        <p className="mb-8 text-lg leading-relaxed text-white/65">Chame no WhatsApp, conte sobre a sua empresa e a gente monta o seu site. Simples assim.</p>
        <ProjectCTA />
        <p className="mt-5 text-sm text-white/50">Resposta rápida no WhatsApp · Todo o Brasil</p>
      </div>
    </section>
  )
}
