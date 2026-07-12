import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { NotificationBell } from '@/components/notification-bell'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
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
      {/* Sidebar (desktop fixed / mobile hamburger drawer via AdminSidebar) */}
      <AdminSidebar
        userName={session.user.name ?? session.user.email ?? ''}
        unreadCount={unreadCount}
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        {/* Top header */}
        <header className="sticky top-0 z-20 bg-white border-b border-gray-200 px-4 md:px-6 py-3 flex items-center justify-end gap-3 shadow-sm pl-14 md:pl-6">
          <NotificationBell
            unreadCount={unreadCount}
            notifications={notifications}
            onMarkRead={markAdminNotificationRead}
            onMarkAll={markAllAdminNotificationsRead}
            allHref="/admin/notificacoes"
            theme="light"
          />
          <span className="text-sm text-gray-600">{session.user.name}</span>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
