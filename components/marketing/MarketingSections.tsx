import type { ReactNode } from 'react'
import { MarketingIcon, WhatsAppIcon } from './MarketingIcon'
import { MarketingHeader } from './MarketingHeader'
import { MarketingFooter } from './MarketingFooter'
import { offer, projectContact } from '@/lib/marketing'

export function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-yellow-400 selection:text-black">
      <MarketingHeader />
      <main id="conteudo-principal" className="pt-20">{children}</main>
      <MarketingFooter />
      <a href={projectContact()} target="_blank" rel="noopener noreferrer" aria-label="Conversar com a TopSite pelo WhatsApp" className="cta-pulse fixed bottom-5 right-5 z-40 flex h-16 w-16 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/40 transition-colors hover:bg-[#1ebe5b]">
        <WhatsAppIcon className="h-9 w-9" />
      </a>
    </div>
  )
}

export function ProjectCTA({ message, label = 'Quero meu site agora', className = '' }: { message?: string; label?: string; className?: string }) {
  return (
    <a href={projectContact(message)} target="_blank" rel="noopener noreferrer" className={'cta-pulse inline-flex max-w-full items-center justify-center gap-3 rounded-2xl bg-[#25D366] px-8 py-5 text-center text-base font-bold text-white shadow-lg shadow-[#25D366]/25 transition-colors hover:bg-[#1ebe5b] sm:px-10 sm:text-lg ' + className}>
      <WhatsAppIcon />
      {label}
    </a>
  )
}

// Faixa de CTA entre seções — aumenta os pontos de conversão ao longo da página
export function CTABand({ message, title = 'Sua empresa pode começar a ser encontrada ainda este mês.', label }: { message?: string; title?: string; label?: string }) {
  return (
    <section className="border-y border-[#25D366]/20 bg-[#25D366]/[0.05] px-4 py-12 sm:px-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 text-center md:flex-row md:text-left">
        <p className="max-w-2xl text-xl font-semibold sm:text-2xl">{title}</p>
        <ProjectCTA message={message} label={label} className="w-full shrink-0 md:w-auto" />
      </div>
    </section>
  )
}

export function PricingSection({ message }: { message?: string }) {
  return (
    <section id="investimento" className="scroll-mt-24 border-t border-white/10 px-4 py-20 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-yellow-400">Investimento</p>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-5xl">Tudo isso em um único valor.</h2>
        </div>
        <div className="rounded-3xl border border-[#25D366]/30 bg-gradient-to-b from-[#25D366]/[0.08] to-transparent p-7 sm:p-12">
          <ul className="mb-10 space-y-6">
            {offer.deliverables.map(({ title, text }) => (
              <li key={title} className="flex gap-4">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white"><MarketingIcon name="check" className="h-4 w-4" /></span>
                <div>
                  <p className="text-lg font-semibold">{title}</p>
                  <p className="leading-relaxed text-white/65">{text}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="mb-8 border-t border-white/10 pt-8 text-center">
            <p className="mb-2 text-sm uppercase tracking-widest text-white/55">Por apenas</p>
            <p className="text-6xl font-bold tracking-tight text-[#25D366] sm:text-7xl">{offer.price}</p>
            <p className="mt-3 text-lg font-semibold text-white/85">{offer.installments}</p>
          </div>
          <div className="mb-10 rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-6">
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-yellow-400">Opcional</p>
            <p className="font-semibold">{offer.optional.title} — <span className="text-[#25D366]">{offer.optional.price}</span></p>
            <p className="mt-1 text-sm leading-relaxed text-white/60">{offer.optional.text}</p>
          </div>
          <div className="text-center">
            <ProjectCTA message={message} label="Quero meu site por R$ 497" className="w-full sm:w-auto" />
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
        ['Entendemos o seu negócio', 'Conversamos sobre quem são seus clientes, o que você oferece e qual resultado você quer alcançar. O site é planejado a partir disso.'],
        ['Construímos para você ser encontrado', 'Desenvolvemos a estrutura e o conteúdo certos para que seus futuros clientes cheguem até você quando buscam o que você oferece.'],
        ['Sua empresa começa a ser encontrada', 'O site vai ao ar posicionado para atrair quem já procura o que você vende — uma fonte de clientes que trabalha em paralelo com o que você já faz.'],
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
        <h2 className="mb-5 text-3xl font-semibold tracking-tight sm:text-5xl">Sua empresa pode ser encontrada do mesmo jeito que você nos encontrou.</h2>
        <p className="mb-8 text-lg leading-relaxed text-white/65">A conversa é o primeiro passo. Entendemos o seu negócio e mostramos como podemos fazer sua empresa aparecer para quem já busca o que você oferece.</p>
        <ProjectCTA />
        <p className="mt-5 text-sm text-white/50">Resposta rápida no WhatsApp · Todo o Brasil</p>
      </div>
    </section>
  )
}
