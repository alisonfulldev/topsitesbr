import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ActivationScreen } from './_components/ActivationScreen'
import { Dashboard } from './_components/Dashboard'

export default async function PainelPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'client') redirect('/login')

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { clientId: true },
  })
  if (!user?.clientId) redirect('/login')

  const clientId = user.clientId
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [client, subscription, ticketsThisMonth, recentEvents] = await Promise.all([
    prisma.client.findUnique({
      where: { id: clientId },
      include: {
        sites: {
          include: {
            domains: { orderBy: { createdAt: 'desc' }, take: 1 },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    }),
    prisma.subscription.findFirst({
      where: { clientId, status: { not: 'canceled' } },
      include: { plan: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.ticket.count({
      where: { clientId, createdAt: { gte: startOfMonth } },
    }),
    prisma.notification.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ])

  if (!client) redirect('/login')

  // Activation screen: first site is pending and client has no active subscription
  const pendingSite = client.sites.find((s) => s.status === 'pendente_ativacao')
  const showActivation = !!pendingSite && !subscription

  // Record that the client was informed about the monthly fee on first activation screen render
  if (showActivation && !client.monthlyFeeAcknowledgedAt) {
    await prisma.client.update({
      where: { id: clientId },
      data: { monthlyFeeAcknowledgedAt: now },
    })
  }

  if (showActivation && pendingSite) {
    return (
      <ActivationScreen
        siteId={pendingSite.id}
        filesZipUrl={pendingSite.filesZipUrl}
        retentionAlreadyShown={!!client.downloadRetentionShownAt}
      />
    )
  }

  // Normal dashboard
  const sites = client.sites.map((s) => ({
    id: s.id,
    status: s.status as string,
    siteUrl: s.siteUrl,
    filesZipUrl: s.filesZipUrl,
    domain: s.domains[0]
      ? {
          domain: s.domains[0].domain,
          dnsStatus: s.domains[0].dnsStatus as string,
          sslStatus: s.domains[0].sslStatus as string,
        }
      : null,
  }))

  const subData = subscription
    ? {
        planName: subscription.plan.name,
        planPrice: Number(subscription.plan.price),
        status: subscription.status as string,
        nextDueDate: subscription.nextDueDate?.toISOString() ?? null,
        planActivatedAt: subscription.planActivatedAt.toISOString(),
        plan: {
          monthlyChangesIncluded: subscription.plan.monthlyChangesIncluded,
          prioritySupport: subscription.plan.prioritySupport,
          allowedChangeTypes: subscription.plan.allowedChangeTypes,
          changeDeadlineDays: subscription.plan.changeDeadlineDays,
          discountPercent: subscription.plan.discountPercent,
        },
      }
    : null

  const events = recentEvents.map((n) => ({
    id: n.id,
    title: n.title,
    message: n.message,
    createdAt: n.createdAt.toISOString(),
    read: n.read,
  }))

  return (
    <Dashboard
      sites={sites}
      subscription={subData}
      ticketsUsedThisMonth={ticketsThisMonth}
      recentEvents={events}
    />
  )
}
