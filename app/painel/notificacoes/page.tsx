import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { isClientInProduction } from '@/lib/painel-guard'
import { NotificationsPageClient } from './_components/NotificationsPageClient'

export default async function NotificacoesPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const { resolveClientId } = await import('@/lib/impersonation')
  const ctx = await resolveClientId(session)
  if (!ctx) redirect('/painel')
  const clientId = ctx.clientId

  if (await isClientInProduction(clientId)) {
    redirect('/painel/projeto')
  }

  const notifications = await prisma.notification.findMany({
    where: { clientId },
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
