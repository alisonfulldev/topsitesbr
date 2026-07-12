import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { AssinaturaPageClient } from './_components/AssinaturaPageClient'

export default async function PainelAssinaturaPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'client') redirect('/login')

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { clientId: true },
  })

  if (!user?.clientId) redirect('/painel')

  const [subscriptionRaw, plans] = await Promise.all([
    prisma.subscription.findFirst({
      where: { clientId: user.clientId, status: { not: 'canceled' } },
      include: { plan: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.plan.findMany({ orderBy: { price: 'asc' } }),
  ])

  if (!subscriptionRaw) {
    return (
      <div className="max-w-xl">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Minha Assinatura</h2>
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <p className="text-gray-500 text-sm">Você ainda não possui uma assinatura ativa.</p>
        </div>
      </div>
    )
  }

  const subscription = {
    id: subscriptionRaw.id,
    status: subscriptionRaw.status,
    planId: subscriptionRaw.planId,
    planName: subscriptionRaw.plan.name,
    planPrice: Number(subscriptionRaw.plan.price),
    nextDueDate: subscriptionRaw.nextDueDate?.toISOString() ?? null,
    planActivatedAt: subscriptionRaw.planActivatedAt.toISOString(),
  }

  return (
    <div className="max-w-3xl">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Minha Assinatura</h2>
      <AssinaturaPageClient
        subscription={subscription}
        plans={plans.map((p) => ({
          id: p.id,
          name: p.name,
          price: Number(p.price),
          monthlyChangesIncluded: p.monthlyChangesIncluded,
          prioritySupport: p.prioritySupport,
          allowedChangeTypes: p.allowedChangeTypes,
          changeDeadlineDays: p.changeDeadlineDays,
          discountPercent: p.discountPercent,
        }))}
      />
    </div>
  )
}
