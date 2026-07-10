import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { SignOutButton } from '@/components/sign-out-button'
import { NotificationBell } from '@/components/notification-bell'
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
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 border-b bg-white px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">
              TopSites
            </p>
            <p className="text-[11px] text-gray-400 -mt-0.5">Painel do Cliente</p>
          </div>
          <nav className="flex items-center gap-1 text-sm">
            <Link
              href="/painel"
              className="px-3 py-1.5 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Início
            </Link>
            <Link
              href="/painel/solicitacoes"
              className="px-3 py-1.5 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Solicitações
            </Link>
            <Link
              href="/painel/assinatura"
              className="px-3 py-1.5 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Assinatura
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <NotificationBell
            unreadCount={unreadCount}
            notifications={notifications}
            onMarkRead={markNotificationRead}
            onMarkAll={markAllNotificationsRead}
            allHref="/painel/notificacoes"
          />
          <span className="text-sm text-gray-600">{session.user.name}</span>
          <SignOutButton />
        </div>
      </header>

      <main className="p-6">{children}</main>
    </div>
  )
}
