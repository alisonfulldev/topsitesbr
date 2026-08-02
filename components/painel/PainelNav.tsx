'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { PushNotificationButton } from './PushNotificationButton'
import { useState } from 'react'

const projectNavItem = {
  href: '/painel/projeto',
  label: 'Meu Projeto',
  exact: false,
  isConversion: false as boolean | undefined,
  icon: (active: boolean) => (
    <svg className={cn('w-6 h-6', active ? 'text-white' : 'text-gray-400')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2.5 : 2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  ),
}

const navItems = [
  {
    href: '/painel',
    label: 'Início',
    exact: true,
    icon: (active: boolean) => (
      <svg className={cn('w-6 h-6', active ? 'text-white' : 'text-gray-400')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2.5 : 2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: '/painel/solicitacoes',
    label: 'Solicitações',
    exact: false,
    icon: (active: boolean) => (
      <svg className={cn('w-6 h-6', active ? 'text-white' : 'text-gray-400')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2.5 : 2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
  {
    href: '/painel/relatorios',
    label: 'Relatórios',
    exact: false,
    icon: (active: boolean) => (
      <svg className={cn('w-6 h-6', active ? 'text-white' : 'text-gray-400')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2.5 : 2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    href: '/painel/upgrades',
    label: 'Upgrades',
    exact: false,
    isConversion: true,
    icon: (active: boolean) => (
      // Ícone de raio — cor de conversão (amarelo) mesmo quando inativo para destacar o CTA
      <svg className={cn('w-6 h-6', active ? 'text-brand-dark' : 'text-brand')} fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 0 : 2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        {active && <path d="M13 10V3L4 14h7v7l9-11h-7z" fill="currentColor" />}
      </svg>
    ),
  },
  {
    href: '/painel/indicacoes',
    label: 'Indicações',
    exact: false,
    icon: (active: boolean) => (
      <svg className={cn('w-6 h-6', active ? 'text-white' : 'text-gray-400')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2.5 : 2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    href: '/painel/assinatura',
    label: 'Plano',
    exact: false,
    icon: (active: boolean) => (
      <svg className={cn('w-6 h-6', active ? 'text-white' : 'text-gray-400')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <rect x="2" y="5" width="20" height="14" rx="2" strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2.5 : 2} />
        <line x1="2" y1="10" x2="22" y2="10" strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2.5 : 2} />
      </svg>
    ),
  },
]

const desktopSecondaryItems = [
  { href: '/painel/notificacoes', label: 'Notificações' },
  { href: '/painel/conta', label: 'Minha Conta' },
  { href: '/painel/alterar-senha', label: 'Alterar senha' },
]

function isActive(pathname: string, href: string, exact: boolean) {
  if (exact) return pathname === href
  return pathname.startsWith(href)
}

// ─── Mobile Bottom Navigation Bar ──────────────────────────────────────────────
export function PainelBottomNav({ showProjectLink, inProduction }: { showProjectLink?: boolean; inProduction?: boolean }) {
  const pathname = usePathname()
  const items = showProjectLink
    ? [navItems[0], projectNavItem, ...navItems.slice(1)]
    : navItems

  const [toast, setToast] = useState(false)

  function showToast() {
    setToast(true)
    setTimeout(() => setToast(false), 2500)
  }

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 md:hidden relative"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="bg-brand-dark border-t border-brand-dark-border flex items-stretch">
        {items.map((item) => {
          const active = isActive(pathname, item.href, item.exact ?? false)
          const locked = !!inProduction && item.href !== '/painel/projeto'

          if (locked) {
            return (
              <button
                key={item.href}
                type="button"
                onClick={showToast}
                className="flex-1 flex flex-col items-center justify-center gap-0.5 min-h-[56px] opacity-35 cursor-not-allowed"
              >
                {item.icon(false)}
                <span className="text-[10px] font-medium text-gray-500">{item.label}</span>
              </button>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-0.5 min-h-[56px] transition-colors',
                item.isConversion
                  ? active
                    ? 'bg-brand'
                    : 'relative'
                  : active
                    ? 'bg-brand-dark-hover'
                    : 'hover:bg-brand-dark-hover',
              )}
            >
              {item.icon(active)}
              <span
                className={cn(
                  'text-[10px] font-medium',
                  item.isConversion
                    ? active
                      ? 'text-brand-dark'
                      : 'text-brand'
                    : active
                      ? 'text-white'
                      : 'text-gray-400',
                )}
              >
                {item.label}
              </span>
            </Link>
          )
        })}

        {/* Botão Conta/Perfil — always accessible */}
        <Link
          href="/painel/conta"
          className={cn(
            'flex-1 flex flex-col items-center justify-center gap-0.5 min-h-[56px] transition-colors',
            pathname.startsWith('/painel/conta') || pathname.startsWith('/painel/alterar-senha')
              ? 'bg-brand-dark-hover'
              : 'hover:bg-brand-dark-hover',
          )}
        >
          <svg className={cn('w-6 h-6', pathname.startsWith('/painel/conta') || pathname.startsWith('/painel/alterar-senha') ? 'text-white' : 'text-gray-400')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className={cn('text-[10px] font-medium', pathname.startsWith('/painel/conta') || pathname.startsWith('/painel/alterar-senha') ? 'text-white' : 'text-gray-400')}>
            Conta
          </span>
        </Link>
      </div>

      {toast && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap shadow-lg pointer-events-none z-50">
          Disponível quando seu site estiver no ar
        </div>
      )}
    </nav>
  )
}

// ─── Desktop Sidebar Navigation ────────────────────────────────────────────────
export function PainelDesktopSidebar({ userName, showProjectLink, inProduction }: { userName: string; showProjectLink?: boolean; inProduction?: boolean }) {
  const pathname = usePathname()
  const items = showProjectLink
    ? [navItems[0], projectNavItem, ...navItems.slice(1)]
    : navItems

  const [toast, setToast] = useState(false)

  function showToast() {
    setToast(true)
    setTimeout(() => setToast(false), 2500)
  }

  return (
    <aside className="hidden md:flex w-56 shrink-0 bg-brand-dark flex-col sticky top-0 h-screen relative">
      <div className="px-5 py-4 border-b border-brand-dark-border">
        <Image src="/logo.png" alt="TOP SITE" width={140} height={42} className="h-9 w-auto mb-1" priority />
        <p className="text-[10px] text-gray-400 uppercase tracking-wider">Painel do Cliente</p>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 text-sm overflow-y-auto">
        {items.map((item) => {
          const active = isActive(pathname, item.href, item.exact ?? false)
          const locked = !!inProduction && item.href !== '/painel/projeto'

          if (locked) {
            return (
              <button
                key={item.href}
                type="button"
                onClick={showToast}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-md opacity-35 cursor-not-allowed text-gray-400"
              >
                <span className="w-6 shrink-0 flex items-center justify-center">{item.icon(false)}</span>
                <span>{item.label}</span>
              </button>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md transition-colors',
                item.isConversion
                  ? active
                    ? 'bg-brand text-brand-dark font-semibold'
                    : 'text-brand hover:bg-brand/10 font-medium'
                  : active
                    ? 'bg-brand-dark-hover text-white font-medium'
                    : 'text-gray-300 hover:bg-brand-dark-hover hover:text-white',
              )}
            >
              <span className="w-6 shrink-0 flex items-center justify-center">
                {item.icon(active)}
              </span>
              <span>{item.label}</span>
            </Link>
          )
        })}

        <div className="pt-2 mt-2 border-t border-brand-dark-border space-y-0.5">
          {desktopSecondaryItems.map((item) => {
            const active = pathname.startsWith(item.href)
            const locked = !!inProduction && item.href === '/painel/notificacoes'

            if (locked) {
              return (
                <button
                  key={item.href}
                  type="button"
                  onClick={showToast}
                  className="w-full block px-3 py-2 rounded-md text-sm opacity-35 cursor-not-allowed text-left text-gray-500"
                >
                  {item.label}
                </button>
              )
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'block px-3 py-2 rounded-md text-sm transition-colors',
                  active
                    ? 'bg-brand-dark-hover text-white font-medium'
                    : 'text-gray-400 hover:bg-brand-dark-hover hover:text-white',
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </div>
      </nav>

      <div className="p-4 border-t border-brand-dark-border">
        <p className="text-xs text-gray-400 truncate mb-2">{userName}</p>
        <div className="mb-3">
          <PushNotificationButton />
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          Sair
        </button>
      </div>

      {toast && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap shadow-lg pointer-events-none z-50 text-center w-max max-w-[200px]">
          Disponível quando seu site estiver no ar
        </div>
      )}
    </aside>
  )
}
