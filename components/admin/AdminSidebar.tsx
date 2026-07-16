'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard' },
  { href: '/admin/clientes', label: 'Clientes' },
  { href: '/admin/usuarios', label: 'Usuários' },
  { href: '/admin/solicitacoes', label: 'Solicitações' },
  { href: '/admin/promocoes', label: 'Promoções' },
  { href: '/admin/indicacoes', label: 'Indicações' },
  { href: '/admin/financeiro', label: 'Financeiro' },
  { href: '/admin/financeiro/custos', label: 'Custos', indent: true },
  { href: '/admin/notificacoes', label: 'Notificações' },
]

interface AdminSidebarProps {
  userName: string
  unreadCount: number
}

function NavLinks({ onNavigate, unreadCount }: { onNavigate?: () => void; unreadCount: number }) {
  const pathname = usePathname()

  return (
    <nav className="flex-1 p-3 space-y-0.5 text-sm">
      {navItems.map(({ href, label, indent }) => {
        // Financeiro/custos is a sub-item of financeiro, so mark parent active too
        const active =
          href === '/admin/financeiro'
            ? pathname === '/admin/financeiro' || pathname === '/admin/financeiro/'
            : pathname === href || pathname.startsWith(href + '/')

        const isNotif = href === '/admin/notificacoes'

        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              'flex items-center justify-between px-3 py-2 rounded-md transition-colors',
              indent && 'ml-3',
              active
                ? 'bg-brand-dark-hover text-white font-medium'
                : 'text-gray-300 hover:bg-brand-dark-hover hover:text-white',
            )}
          >
            <span>{label}</span>
            {isNotif && unreadCount > 0 && (
              <span className="inline-flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-brand-dark">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>
        )
      })}
    </nav>
  )
}

export function AdminSidebar({ userName, unreadCount }: AdminSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  // Close on Escape
  useEffect(() => {
    if (!mobileOpen) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMobileOpen(false)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [mobileOpen])

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const sidebarContent = (onNavigate?: () => void) => (
    <>
      <div className="px-5 py-4 border-b border-brand-dark-border">
        <Image src="/logo.png" alt="TOP SITE" width={140} height={42} className="h-9 w-auto mb-1" priority />
        <p className="text-[10px] text-gray-400 uppercase tracking-wider">Painel Admin</p>
      </div>
      <NavLinks onNavigate={onNavigate} unreadCount={unreadCount} />
      <div className="p-4 border-t border-brand-dark-border space-y-2">
        <p className="text-xs text-gray-400 truncate">{userName}</p>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          Sair
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Desktop sidebar — always visible on md+ */}
      <aside className="hidden md:flex w-56 shrink-0 bg-brand-dark flex-col min-h-screen sticky top-0 self-start h-screen">
        {sidebarContent()}
      </aside>

      {/* Mobile top bar — hambúrguer + botão Sair */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 flex items-center justify-between px-3 py-2 bg-brand-dark border-b border-brand-dark-border">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg text-gray-300 hover:text-white transition-colors"
          aria-label="Abrir menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className="text-xs font-semibold text-gray-300 uppercase tracking-widest">Admin</span>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="p-2 rounded-lg text-gray-400 hover:text-white transition-colors"
          aria-label="Sair"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          {/* Sidebar panel */}
          <aside className="relative w-64 bg-brand-dark flex flex-col min-h-screen shadow-2xl">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-white transition-colors"
              aria-label="Fechar menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            {sidebarContent(() => setMobileOpen(false))}
          </aside>
        </div>
      )}
    </>
  )
}
