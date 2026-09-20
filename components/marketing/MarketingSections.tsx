import type { ReactNode } from 'react'
import { MarketingIcon } from './MarketingIcon'
import Image from 'next/image'
import { MarketingHeader } from './MarketingHeader'
import { MarketingFooter } from './MarketingFooter'
import { portfolioProjects, projectContact } from '@/lib/marketing'

export function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-yellow-400 selection:text-black">
      <MarketingHeader />
      <main id="conteudo-principal" className="pt-20">{children}</main>
      <MarketingFooter />
      <a href={projectContact()} target="_blank" rel="noopener noreferrer" aria-label="Conversar com a TopSite pelo WhatsApp" className="fixed bottom-5 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-400 text-black shadow-lg transition-colors hover:bg-yellow-300">
        <MarketingIcon name="chat" className="h-6 w-6" />
      </a>
    </div>
  )
}

export function ProjectCTA({ message, label = 'Agendar uma conversa' }: { message?: string; label?: string }) {
  return <a href={projectContact(message)} target="_blank" rel="noopener noreferrer" className="inline-flex max-w-full items-center justify-center gap-3 rounded-xl bg-yellow-400 px-6 py-4 text-center text-sm font-semibold text-black transition-colors hover:bg-yellow-300 sm:text-base">{label}<MarketingIcon name="arrow" /></a>
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

export function ProjectGrid() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {portfolioProjects.map((project) => (
        <article key={project.domain} className="flex min-w-0 flex-col rounded-2xl border border-white/10 bg-white/[0.025] p-7">
          <div className="mb-8 flex items-center justify-between gap-3">
            <Image src={project.favicon} alt="" width={40} height={40} className="h-10 w-10 rounded-lg bg-white object-contain p-1" />
            <span className="text-xs text-white/55">{project.segment}</span>
          </div>
          <h3 className="mb-3 text-xl font-semibold">{project.name}</h3>
          <p className="mb-8 flex-1 leading-relaxed text-white/65">{project.description}</p>
          <a href={'https://' + project.domain} target="_blank" rel="noopener noreferrer" aria-label={'Visitar o site de ' + project.name} className="inline-flex items-center gap-2 border-t border-white/10 pt-5 text-sm font-semibold text-yellow-400 hover:underline">Visitar projeto <MarketingIcon name="arrow" /></a>
        </article>
      ))}
    </div>
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
        <p className="mt-5 text-sm text-white/50">Atendimento consultivo · Proposta personalizada · Todo o Brasil</p>
      </div>
    </section>
  )
}
