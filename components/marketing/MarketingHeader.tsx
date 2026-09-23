'use client'

import { useState } from 'react'
import { MarketingIcon } from './MarketingIcon'
import Image from 'next/image'
import Link from 'next/link'
import { marketingServices, projectContact } from '@/lib/marketing'

export function MarketingHeader() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#0a0a0a]/95 text-white backdrop-blur-xl"
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          setMobileOpen(false)
          event.currentTarget.querySelectorAll('details[open]').forEach((item) => item.removeAttribute('open'))
        }
      }}>
      <a href="#conteudo-principal" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-yellow-400 focus:p-3 focus:text-black">Pular para o conteúdo</a>
      <nav aria-label="Navegação principal" className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-8">
        <Link href="/" aria-label="TopSite — início" className="flex shrink-0 items-center gap-3">
          <Image src="/logo.png" alt="" width={40} height={40} className="h-10 w-10 object-contain" priority />
        </Link>
        <div className="hidden items-center gap-7 text-sm text-white/75 lg:flex">
          <details className="group/menu relative">
            <summary className="flex cursor-pointer list-none items-center gap-2 rounded-lg py-3 hover:text-yellow-400 [&::-webkit-details-marker]:hidden">Serviços<MarketingIcon name="chevron" className="h-4 w-4 transition-transform group-open/menu:rotate-180" /></summary>
            <div className="absolute left-0 top-full min-w-64 rounded-xl border border-white/10 bg-[#111] p-2 shadow-xl">
              {marketingServices.map(({ href, label }) => (
                <Link key={href} href={href} onClick={(event) => event.currentTarget.closest('details')?.removeAttribute('open')} className="block rounded-lg px-4 py-3 hover:bg-white/5 hover:text-yellow-400">{label}</Link>
              ))}
              <div className="my-1 border-t border-white/10" />
              <Link href="/site-para" onClick={(event) => event.currentTarget.closest('details')?.removeAttribute('open')} className="block rounded-lg px-4 py-3 text-white/65 hover:bg-white/5 hover:text-yellow-400">Sites por segmento</Link>
            </div>
          </details>
          <Link href="/sobre" className="hover:text-yellow-400">Sobre</Link>
          <Link href="/login" className="hover:text-yellow-400">Área do cliente</Link>
        </div>
        <div className="flex items-center gap-3">
          <a href={projectContact()} target="_blank" rel="noopener noreferrer" className="hidden rounded-xl bg-yellow-400 px-5 py-3 text-sm font-semibold text-black transition-colors hover:bg-yellow-300 sm:inline-flex">Agendar uma conversa</a>
          <button type="button" aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'} aria-expanded={mobileOpen} aria-controls="marketing-mobile-menu" onClick={() => setMobileOpen(!mobileOpen)} className="rounded-lg border border-white/15 p-3 lg:hidden">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
              <path d={mobileOpen ? 'M6 6l12 12M6 18L18 6' : 'M3 6h18M3 12h18M3 18h18'} />
            </svg>
          </button>
        </div>
      </nav>
      <nav id="marketing-mobile-menu" aria-label="Navegação no celular" hidden={!mobileOpen} className="max-h-[calc(100dvh-5rem)] overflow-y-auto border-t border-white/10 px-4 py-5 lg:hidden">
        <p className="mb-2 px-3 text-xs uppercase tracking-widest text-white/50">Serviços</p>
        {[...marketingServices, { href: '/site-para', label: 'Sites por segmento' }, { href: '/sobre', label: 'Sobre' }, { href: '/login', label: 'Área do cliente' }].map(({ href, label }) => (
          <Link key={href} href={href} onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-3 text-sm text-white/80 hover:bg-white/5 hover:text-yellow-400">{label}</Link>
        ))}
        <a href={projectContact()} target="_blank" rel="noopener noreferrer" className="mt-4 block rounded-xl bg-yellow-400 px-4 py-3 text-center text-sm font-semibold text-black">Conversar sobre meu projeto</a>
      </nav>
    </header>
  )
}
