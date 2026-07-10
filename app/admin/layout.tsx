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
      <aside className="w-56 shrink-0 bg-white border-r border-gray-200 flex flex-col">
        <div className="px-5 py-4 border-b border-gray-200">
          <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">
            TopSites
          </p>
          <h1 className="text-sm font-semibold text-gray-900 mt-0.5">Painel Admin</h1>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 text-sm">
          <Link
            href="/admin"
            className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/admin/clientes"
            className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            Clientes
          </Link>
          <Link
            href="/admin/usuarios"
            className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            Usuários
          </Link>
          <Link
            href="/admin/solicitacoes"
            className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            Solicitações
          </Link>
          <Link
            href="/admin/notificacoes"
            className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            Notificações
            {unreadCount > 0 && (
              <span className="ml-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-200 space-y-2">
          <p className="text-xs text-gray-500 truncate">{session.user.name}</p>
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
