'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getPaymentProvider } from '@/lib/payments/provider'
import { revalidatePath } from 'next/cache'

const THREE_MONTHS_MS = 90 * 24 * 60 * 60 * 1000

export async function clientChangePlan(newPlanId: string): Promise<{
  error?: string
  blockedUntil?: string
  success?: boolean
}> {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'client') return { error: 'Não autorizado.' }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { clientId: true },
  })
  if (!user?.clientId) return { error: 'Cliente não encontrado.' }

  const clientId = user.clientId

  const subscription = await prisma.subscription.findFirst({
    where: { clientId, status: { not: 'canceled' } },
    include: { plan: true },
    orderBy: { createdAt: 'desc' },
  })

  if (!subscription) return { error: 'Nenhuma assinatura ativa.' }
  if (subscription.planId === newPlanId) return { error: 'Você já está neste plano.' }

  const newPlan = await prisma.plan.findUnique({ where: { id: newPlanId } })
  if (!newPlan) return { error: 'Plano não encontrado.' }

  const currentPrice = Number(subscription.plan.price)
  const newPrice = Number(newPlan.price)
  const isDowngrade = newPrice < currentPrice

  if (isDowngrade) {
    const allowedAt = subscription.planActivatedAt.getTime() + THREE_MONTHS_MS
    if (Date.now() < allowedAt) {
      return { blockedUntil: new Date(allowedAt).toISOString() }
    }
  }

  const provider = getPaymentProvider()

  if (subscription.asaasSubscriptionId) {
    await provider.updateSubscription(
      subscription.asaasSubscriptionId,
      newPrice,
      newPlan.name,
    )
  }

  const now = new Date()

  await prisma.$transaction([
    prisma.subscription.update({
      where: { id: subscription.id },
      data: { planId: newPlanId, planActivatedAt: now },
    }),
    prisma.planChangeHistory.create({
      data: {
        clientId,
        fromPlanId: subscription.planId,
        toPlanId: newPlanId,
        changedAt: now,
        wasManualOverride: false,
      },
    }),
    prisma.notification.create({
      data: {
        clientId,
        title: isDowngrade ? 'Plano alterado' : 'Plano atualizado',
        message: `Seu plano foi alterado de ${subscription.plan.name} para ${newPlan.name} (R$${newPrice.toFixed(2).replace('.', ',')}/mês).`,
        channel: 'painel',
      },
    }),
  ])

  revalidatePath('/painel/assinatura')
  return { success: true }
}
