import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { SignOutButton } from '@/components/sign-out-button'
import { NotificationBell } from '@/components/notification-bell'
import { markAdminNotificationRead, markAllAdminNotificationsRead } from './notificacoes/actions'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'admin') {
    redirect('/login')
  }

  const notifs = await prisma.notification.findMany({
    where: { clientId: null },
    orderBy: { createdAt: 'desc' },
    take: 10,
  })
  const unreadCount = notifs.filter((n) => !n.read).length
  const notifications = notifs.map((n) => ({
    id: n.id,
    title: n.title,
    message: n.message,
    read: n.read,
    createdAt: n.createdAt.toISOString(),
  }))

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar — Will Bank dark style */}
      <aside className="w-56 shrink-0 bg-brand-dark flex flex-col">
        <div className="px-5 py-4 border-b border-brand-dark-border">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-brand">
            TOP SITE
          </p>
          <p className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-wider">Painel Admin</p>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 text-sm">
          {[
            { href: '/admin/dashboard', label: 'Dashboard' },
            { href: '/admin/clientes', label: 'Clientes' },
            { href: '/admin/usuarios', label: 'Usuários' },
            { href: '/admin/solicitacoes', label: 'Solicitações' },
            { href: '/admin/promocoes', label: 'Promoções' },
            { href: '/admin/indicacoes', label: 'Indicações' },
            { href: '/admin/financeiro', label: 'Financeiro' },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="block px-3 py-2 rounded-md text-gray-300 hover:bg-brand-dark-hover hover:text-white transition-colors"
            >
              {label}
            </Link>
          ))}
          <Link
            href="/admin/notificacoes"
            className="flex items-center justify-between px-3 py-2 rounded-md text-gray-300 hover:bg-brand-dark-hover hover:text-white transition-colors"
          >
            <span>Notificações</span>
            {unreadCount > 0 && (
              <span className="inline-flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-brand-dark">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>
        </nav>

        <div className="p-4 border-t border-brand-dark-border space-y-2">
          <p className="text-xs text-gray-400 truncate">{session.user.name}</p>
          <SignOutButton />
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-end gap-3 shadow-sm">
          <NotificationBell
            unreadCount={unreadCount}
            notifications={notifications}
            onMarkRead={markAdminNotificationRead}
            onMarkAll={markAllAdminNotificationsRead}
            allHref="/admin/notificacoes"
          />
          <span className="text-sm text-gray-600">{session.user.name}</span>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
