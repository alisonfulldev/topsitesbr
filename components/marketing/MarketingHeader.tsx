'use client'

import { useState } from 'react'
import { MarketingIcon, WhatsAppIcon } from './MarketingIcon'
import Image from 'next/image'
import Link from 'next/link'
import { CONTACT_EMAIL, marketingServices, offer, projectContact } from '@/lib/marketing'

// Classes por tema: "light" em todas as páginas de divulgação (padrão); "dark" fica disponível
const themes = {
  dark: {
    header: 'border-white/[0.06] bg-[#0A0A0A]/85 text-white',
    navLink: 'text-white/70 hover:text-white focus-visible:ring-white/40',
    menu: 'border-white/10 bg-[#141B21] shadow-black/50',
    menuItem: 'text-white/75 hover:bg-white/[0.05] hover:text-white',
    divider: 'border-white/10',
    ghost: 'border-white/[0.12] text-white/80 hover:border-white/25 hover:bg-white/[0.04] hover:text-white focus-visible:ring-white/40',
    mobile: 'border-white/[0.06] bg-[#0A0A0A]',
    mobileLabel: 'text-white/45',
    mobileLink: 'text-white/80 hover:bg-white/[0.05] hover:text-white',
    mobileCta: 'bg-[#25D366] text-[#06260f]',
  },
  // Home: navbar preta (#000) com links e botões brancos — a única faixa escura no topo da página
  light: {
    header: 'border-white/[0.08] bg-black text-white',
    navLink: 'text-white hover:text-white/75 focus-visible:ring-white/40',
    menu: 'border-white/10 bg-black shadow-black/50',
    menuItem: 'text-white hover:bg-white/[0.08]',
    divider: 'border-white/10',
    ghost: 'border-white/25 text-white hover:border-white/50 hover:bg-white/[0.08] focus-visible:ring-white/40',
    mobile: 'border-white/[0.08] bg-black',
    mobileLabel: 'text-white/60',
    mobileLink: 'text-white hover:bg-white/[0.08]',
    mobileCta: 'bg-[#FDD900] text-black hover:bg-[#E8C700]',
  },
}

export function MarketingHeader({ theme = 'dark' }: { theme?: 'dark' | 'light' }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const t = themes[theme]
  const navLink = 'rounded-lg px-3 py-2 text-[0.9rem] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 ' + t.navLink

  return (
    <header className={'fixed inset-x-0 top-0 z-50 border-b backdrop-blur-xl ' + t.header}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          setMobileOpen(false)
          event.currentTarget.querySelectorAll('details[open]').forEach((item) => item.removeAttribute('open'))
        }
      }}>
      <a href="#conteudo-principal" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-yellow-400 focus:p-3 focus:text-black">Pular para o conteúdo</a>
      <nav aria-label="Navegação principal" className="mx-auto flex h-16 max-w-[90rem] items-center justify-between gap-4 px-4 sm:px-8 lg:grid lg:grid-cols-[1fr_auto_1fr]">
        <Link href="/" aria-label="TopSite — início" className="flex shrink-0 items-center gap-3 justify-self-start rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FDD900]">
          <Image src="/logo.png" alt="" width={40} height={40} className="h-9 w-9 object-contain" priority />
        </Link>
        <div className="hidden items-center gap-1 lg:flex">
          <details className="group/menu relative">
            <summary className={navLink + ' flex cursor-pointer list-none items-center gap-1.5 [&::-webkit-details-marker]:hidden'}>Serviços<MarketingIcon name="chevron" className="h-4 w-4 transition-transform group-open/menu:rotate-180" /></summary>
            <div className={'absolute left-1/2 top-full mt-2 min-w-64 -translate-x-1/2 rounded-xl border p-2 shadow-2xl ' + t.menu}>
              {marketingServices.map(({ href, label }) => (
                <Link key={href} href={href} onClick={(event) => event.currentTarget.closest('details')?.removeAttribute('open')} className={'block rounded-lg px-4 py-2.5 text-sm transition-colors ' + t.menuItem}>{label}</Link>
              ))}
              <div className={'my-1 border-t ' + t.divider} />
              <Link href="/site-para" onClick={(event) => event.currentTarget.closest('details')?.removeAttribute('open')} className={'block rounded-lg px-4 py-2.5 text-sm transition-colors ' + t.menuItem}>Sites por segmento</Link>
            </div>
          </details>
          <Link href="/sobre" className={navLink}>Sobre</Link>
          <Link href="/login" className={navLink}>Área do cliente</Link>
        </div>
        <div className="flex items-center gap-2 justify-self-end">
          <a href={'mailto:' + CONTACT_EMAIL} aria-label={'Enviar e-mail para ' + CONTACT_EMAIL} className={'hidden h-10 items-center gap-2 rounded-lg border px-3.5 text-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 sm:inline-flex ' + t.ghost}>
            <MarketingIcon name="mail" className="h-4 w-4" />
            <span className="hidden xl:inline">E-mail</span>
          </a>
          <a href={projectContact()} target="_blank" rel="noopener noreferrer" className={'hidden h-10 items-center gap-2 rounded-lg border px-3.5 text-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 sm:inline-flex ' + t.ghost}><WhatsAppIcon className="h-4 w-4" />WhatsApp</a>
          <button type="button" aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'} aria-expanded={mobileOpen} aria-controls="marketing-mobile-menu" onClick={() => setMobileOpen(!mobileOpen)} className={'flex h-10 w-10 items-center justify-center rounded-lg border transition-colors focus-visible:outline-none focus-visible:ring-2 lg:hidden ' + t.ghost}>
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
              <path d={mobileOpen ? 'M6 6l12 12M6 18L18 6' : 'M3 6h18M3 12h18M3 18h18'} />
            </svg>
          </button>
        </div>
      </nav>
      <nav id="marketing-mobile-menu" aria-label="Navegação no celular" hidden={!mobileOpen} className={'max-h-[calc(100dvh-4rem)] overflow-y-auto border-t px-4 py-5 lg:hidden ' + t.mobile}>
        <p className={'mb-2 px-3 text-xs uppercase tracking-widest ' + t.mobileLabel}>Serviços</p>
        {[...marketingServices, { href: '/site-para', label: 'Sites por segmento' }, { href: '/sobre', label: 'Sobre' }, { href: '/login', label: 'Área do cliente' }].map(({ href, label }) => (
          <Link key={href} href={href} onClick={() => setMobileOpen(false)} className={'block rounded-lg px-3 py-3 text-sm ' + t.mobileLink}>{label}</Link>
        ))}
        <div className="mt-4 grid gap-3">
          <a href={projectContact()} target="_blank" rel="noopener noreferrer" className={'flex items-center justify-center gap-2 rounded-xl px-4 py-4 text-center text-base font-semibold ' + t.mobileCta}><WhatsAppIcon className="h-5 w-5" />Quero meu site por {offer.price}</a>
          <a href={'mailto:' + CONTACT_EMAIL} className={'flex items-center justify-center gap-2 rounded-xl border px-4 py-3.5 text-center text-sm ' + t.ghost}><MarketingIcon name="mail" className="h-4 w-4" />{CONTACT_EMAIL}</a>
        </div>
      </nav>
    </header>
  )
}
