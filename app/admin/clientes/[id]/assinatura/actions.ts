'use server'

import { prisma } from '@/lib/prisma'
import { getPaymentProvider } from '@/lib/payments/provider'
import { revalidatePath } from 'next/cache'

export async function activateSubscription(
  clientId: string,
  planId: string,
): Promise<{ error?: string; success?: boolean }> {
  const [client, plan] = await Promise.all([
    prisma.client.findUnique({ where: { id: clientId } }),
    prisma.plan.findUnique({ where: { id: planId } }),
  ])

  if (!client || !plan) return { error: 'Cliente ou plano não encontrado.' }

  const docDigits = client.document?.replace(/\D/g, '') ?? ''
  if (docDigits.length !== 11 && docDigits.length !== 14) {
    return { error: 'CPF ou CNPJ do cliente não cadastrado ou inválido. Edite o cadastro do cliente e preencha o CPF/CNPJ antes de ativar a assinatura.' }
  }

  const existing = await prisma.subscription.findFirst({
    where: { clientId, status: { not: 'canceled' } },
  })
  if (existing) return { error: 'Cliente já possui uma assinatura ativa ou pendente de pagamento. Use "Trocar de Plano" se necessário.' }

  const provider = getPaymentProvider()

  const { customerId } = await provider.createCustomer({
    name: client.name,
    email: client.email,
    document: client.document,
    phone: client.phone,
  })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const { subscriptionId, chargeId, nextDueDate } = await provider.createSubscription({
    customerId,
    planName: plan.name,
    price: Number(plan.price),
    successUrl: `${appUrl}/painel?ativado=1`,
  })

  const subscription = await prisma.subscription.create({
    data: {
      clientId,
      planId,
      status: 'pending',
      asaasSubscriptionId: subscriptionId,
      nextDueDate,
      planActivatedAt: new Date(),
    },
  })

  if (chargeId) {
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 1)

    await prisma.invoice.create({
      data: {
        subscriptionId: subscription.id,
        amount: plan.price,
        status: 'pending',
        dueDate,
        asaasChargeId: chargeId,
      },
    })
  }

  revalidatePath(`/admin/clientes/${clientId}`)
  revalidatePath(`/admin/clientes/${clientId}/assinatura`)
  return { success: true }
}

// ── TAREFA 2.3 ─────────────────────────────────────────────────────────────

const THREE_MONTHS_MS = 90 * 24 * 60 * 60 * 1000

export async function changePlan(
  clientId: string,
  newPlanId: string,
  adminOverride = false,
): Promise<{
  error?: string
  blockedUntil?: string
  success?: boolean
}> {
  const subscription = await prisma.subscription.findFirst({
    where: { clientId, status: { not: 'canceled' } },
    include: { plan: true },
    orderBy: { createdAt: 'desc' },
  })

  if (!subscription) return { error: 'Nenhuma assinatura ativa encontrada.' }
  if (subscription.planId === newPlanId) return { error: 'O cliente já está neste plano.' }

  const newPlan = await prisma.plan.findUnique({ where: { id: newPlanId } })
  if (!newPlan) return { error: 'Plano não encontrado.' }

  const currentPrice = Number(subscription.plan.price)
  const newPrice = Number(newPlan.price)
  const isDowngrade = newPrice < currentPrice

  if (isDowngrade && !adminOverride) {
    const activatedAt = subscription.planActivatedAt.getTime()
    const allowedAt = activatedAt + THREE_MONTHS_MS

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
        wasManualOverride: adminOverride,
      },
    }),
    prisma.notification.create({
      data: {
        clientId,
        title: isDowngrade ? 'Plano alterado (downgrade)' : 'Plano atualizado (upgrade)',
        message: `Seu plano foi alterado de ${subscription.plan.name} para ${newPlan.name} (R$${newPrice.toFixed(2).replace('.', ',')}/mês).`,
        channel: 'painel',
      },
    }),
  ])

  revalidatePath(`/admin/clientes/${clientId}`)
  revalidatePath(`/admin/clientes/${clientId}/assinatura`)
  revalidatePath(`/painel/assinatura`)
  return { success: true }
}
