import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { AdminNotificationsClient } from './_components/AdminNotificationsClient'

export default async function AdminNotificacoesPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') redirect('/login')

  const notifications = await prisma.notification.findMany({
    where: { clientId: null },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <AdminNotificationsClient
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
