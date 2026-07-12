import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { NotificationBell } from '@/components/notification-bell'
import { PainelDesktopSidebar, PainelBottomNav } from '@/components/painel/PainelNav'
import { markNotificationRead, markAllNotificationsRead } from './actions'

export default async function PainelLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'client') redirect('/login')

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { clientId: true },
  })

  const clientId = user?.clientId ?? null
  let unreadCount = 0
  let notifications: { id: string; title: string; message: string; read: boolean; createdAt: string }[] = []

  if (clientId) {
    const notifs = await prisma.notification.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })
    unreadCount = notifs.filter((n) => !n.read).length
    notifications = notifs.map((n) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      read: n.read,
      createdAt: n.createdAt.toISOString(),
    }))
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop sidebar — hidden on mobile */}
      <PainelDesktopSidebar userName={session.user.name ?? session.user.email ?? ''} />

      {/* Right column: header + content */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        {/* Mobile header — compact, only visible on small screens */}
        <header className="sticky top-0 z-30 flex items-center justify-between bg-brand-dark px-4 py-3 md:hidden shadow-sm">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-brand">TOP SITE</p>
          <NotificationBell
            unreadCount={unreadCount}
            notifications={notifications}
            onMarkRead={markNotificationRead}
            onMarkAll={markAllNotificationsRead}
            allHref="/painel/notificacoes"
          />
        </header>

        {/* Desktop header — notification bell + user name, hidden on mobile */}
        <header className="sticky top-0 z-30 hidden md:flex items-center justify-end gap-3 bg-white border-b border-gray-200 px-6 py-3 shadow-sm">
          <NotificationBell
            unreadCount={unreadCount}
            notifications={notifications}
            onMarkRead={markNotificationRead}
            onMarkAll={markAllNotificationsRead}
            allHref="/painel/notificacoes"
            theme="light"
          />
          <span className="text-sm text-gray-600">{session.user.name}</span>
        </header>

        {/* Page content — extra bottom padding on mobile to clear the fixed bottom nav (72px) */}
        <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6">
          {children}
        </main>
      </div>

      {/* Mobile bottom navigation — hidden on desktop */}
      <PainelBottomNav />
    </div>
  )
}
