'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

const WA_NUMBER = '5518996742364'
const MSG_SITE = 'Olá! Quero criar meu site profissional por R$197. Como funciona?'
function wa() { return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(MSG_SITE)}` }

const SERVICES = [
  { href: '/criacao-de-sites', label: 'Criação de Sites' },
  { href: '/site-institucional', label: 'Site Institucional' },
  { href: '/landing-page', label: 'Landing Page' },
  { href: '/loja-virtual', label: 'Loja Virtual' },
]

export function MarketingHeader() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-2xl"
      style={{ background: 'rgba(10,10,10,0.85)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-8 h-16 sm:h-20 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="shrink-0">
          <Image src="/logo.png" alt="TOP SITE" width={140} height={45} className="h-8 sm:h-9 w-auto" priority />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {/* Dropdown Serviços */}
          <div className="relative group">
            <button className="flex items-center gap-1 px-4 py-2 text-sm text-white/60 hover:text-white transition-colors rounded-lg hover:bg-white/5">
              Serviços
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3 h-3 transition-transform duration-200 group-hover:rotate-180">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 pointer-events-none group-hover:pointer-events-auto">
              <div
                className="rounded-xl overflow-hidden py-1"
                style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', minWidth: 210, boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }}
              >
                {SERVICES.map((s) => (
                  <Link
                    key={s.href}
                    href={s.href}
                    className="block px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    {s.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <Link href="/portfolio" className="px-4 py-2 text-sm text-white/60 hover:text-white transition-colors rounded-lg hover:bg-white/5">
            Portfólio
          </Link>
          <Link href="/login" className="px-4 py-2 text-sm text-white/60 hover:text-white transition-colors rounded-lg hover:bg-white/5">
            Área do cliente
          </Link>
        </div>

        {/* CTA + hamburger */}
        <div className="flex items-center gap-3">
          <a
            href={wa()}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-black rounded-xl transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #facc15, #f59e0b)', boxShadow: '0 4px 16px rgba(250,204,21,0.25)' }}
          >
            💬 Criar meu site — R$197
          </a>
          <button
            className="md:hidden p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{ background: '#0d0d0d', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="max-w-7xl mx-auto px-4 py-3 space-y-0.5">
            {/* Serviços accordion */}
            <button
              className="w-full flex items-center justify-between px-3 py-2.5 text-sm text-white/60 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
              onClick={() => setServicesOpen(!servicesOpen)}
            >
              <span>Serviços</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={`w-3 h-3 transition-transform duration-200 ${servicesOpen ? 'rotate-180' : ''}`}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {servicesOpen && (
              <div className="pl-3 space-y-0.5">
                {SERVICES.map((s) => (
                  <Link
                    key={s.href}
                    href={s.href}
                    onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2.5 text-sm text-white/50 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                  >
                    {s.label}
                  </Link>
                ))}
              </div>
            )}
            <Link href="/portfolio" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 text-sm text-white/60 hover:text-white rounded-lg hover:bg-white/5 transition-colors">
              Portfólio
            </Link>
            <Link href="/login" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 text-sm text-white/60 hover:text-white rounded-lg hover:bg-white/5 transition-colors">
              Área do cliente
            </Link>
            <div className="pt-2 pb-1">
              <a
                href={wa()}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center px-4 py-3 text-sm font-bold text-black rounded-xl"
                style={{ background: 'linear-gradient(135deg, #facc15, #f59e0b)' }}
              >
                💬 Criar meu site — R$197
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
