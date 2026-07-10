import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { NotificationsPageClient } from './_components/NotificationsPageClient'

export default async function NotificacoesPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'client') redirect('/login')

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { clientId: true },
  })
  if (!user?.clientId) redirect('/painel')

  const notifications = await prisma.notification.findMany({
    where: { clientId: user.clientId },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <NotificationsPageClient
      notifications={notifications.map((n) => ({
        id: n.id,
        title: n.title,
        message: n.message,
        read: n.read,
        createdAt: n.createdAt.toISOString(),
        channel: n.channel as string,
      }))}
    />
  )
}
