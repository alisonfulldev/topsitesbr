'use server'

import { prisma } from '@/lib/prisma'
import { getPaymentProvider } from '@/lib/payments/provider'
import { sendOverdueDay0, sendNotification } from '@/lib/notifications'
import { asaasFetch } from '@/lib/integrations/asaas'
import { revalidatePath } from 'next/cache'

function daysFromNowStr(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

export async function sendManualPaymentReminder(
  clientId: string,
  subscriptionId: string,
): Promise<{ error?: string; success?: boolean; paymentUrl?: string }> {
  const [client, invoice] = await Promise.all([
    prisma.client.findUnique({ where: { id: clientId }, select: { name: true, email: true } }),
    prisma.invoice.findFirst({
      where: { subscriptionId, status: { in: ['pending', 'overdue'] } },
      orderBy: { dueDate: 'desc' },
      select: { asaasChargeId: true },
    }),
  ])

  if (!client) return { error: 'Cliente não encontrado.' }
  if (!invoice?.asaasChargeId) return { error: 'Nenhuma fatura pendente encontrada. Verifique se a assinatura foi recriada no Asaas.' }

  let paymentUrl: string | null = null
  if (process.env.PAYMENT_DRIVER === 'asaas') {
    try {
      const charge = await asaasFetch<{ invoiceUrl: string }>(`/payments/${invoice.asaasChargeId}`)
      paymentUrl = charge.invoiceUrl ?? null
    } catch {
      // envia sem link se Asaas falhar
    }
  }

  await sendOverdueDay0(client.email, client.name, paymentUrl)
  await sendNotification(
    clientId,
    'Fatura aguardando pagamento',
    'Sua fatura do plano Site no Ar está aguardando pagamento. Acesse o link enviado por e-mail para regularizar.',
    'painel',
    'payment-overdue',
  )

  return { success: true, paymentUrl: paymentUrl ?? undefined }
}

export async function resetSubscriptionStatus(
  clientId: string,
  subscriptionId: string,
): Promise<{ error?: string; success?: boolean }> {
  const sub = await prisma.subscription.findUnique({ where: { id: subscriptionId } })
  if (!sub || sub.clientId !== clientId) return { error: 'Assinatura não encontrada.' }

  await prisma.subscription.update({
    where: { id: subscriptionId },
    data: { status: 'active' },
  })

  revalidatePath(`/admin/clientes/${clientId}/assinatura`)
  revalidatePath(`/painel/assinatura`)
  return { success: true }
}

export async function activateSubscription(
  clientId: string,
  planId: string,
  /** Data do primeiro vencimento no formato YYYY-MM-DD. Padrão: 30 dias a partir de hoje. */
  firstDueDateStr?: string,
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

  const firstDueDate = firstDueDateStr ?? daysFromNowStr(30)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const { subscriptionId, chargeId, nextDueDate } = await provider.createSubscription({
    customerId,
    planName: plan.name,
    price: Number(plan.price),
    successUrl: `${appUrl}/painel?ativado=1`,
    firstDueDate,
  })

  const subscription = await prisma.subscription.create({
    data: {
      clientId,
      planId,
      status: chargeId ? 'pending' : 'active',
      asaasSubscriptionId: subscriptionId,
      nextDueDate,
      planActivatedAt: new Date(),
    },
  })

  if (chargeId) {
    await prisma.invoice.create({
      data: {
        subscriptionId: subscription.id,
        amount: plan.price,
        status: 'pending',
        dueDate: new Date(`${firstDueDate}T12:00:00`),
        asaasChargeId: chargeId,
      },
    })
  }

  revalidatePath(`/admin/clientes/${clientId}`)
  revalidatePath(`/admin/clientes/${clientId}/assinatura`)
  return { success: true }
}

export async function recreateAsaasSubscription(
  clientId: string,
  subscriptionId: string,
  firstDueDateStr?: string,
): Promise<{ error?: string; success?: boolean }> {
  const [client, subscription] = await Promise.all([
    prisma.client.findUnique({ where: { id: clientId } }),
    prisma.subscription.findUnique({ where: { id: subscriptionId }, include: { plan: true } }),
  ])

  if (!client || !subscription || subscription.clientId !== clientId) {
    return { error: 'Dados não encontrados.' }
  }

  const docDigits = client.document?.replace(/\D/g, '') ?? ''
  if (docDigits.length !== 11 && docDigits.length !== 14) {
    return { error: 'CPF ou CNPJ do cliente inválido. Edite o cadastro e preencha o CPF/CNPJ antes de recriar.' }
  }

  const provider = getPaymentProvider()
  const { customerId } = await provider.createCustomer({
    name: client.name,
    email: client.email,
    document: client.document,
    phone: client.phone,
  })

  const firstDueDate = firstDueDateStr ?? daysFromNowStr(0)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const { subscriptionId: newAsaasSubId, chargeId, nextDueDate } = await provider.createSubscription({
    customerId,
    planName: subscription.plan.name,
    price: Number(subscription.plan.price),
    successUrl: `${appUrl}/painel?ativado=1`,
    firstDueDate,
  })

  await prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      asaasSubscriptionId: newAsaasSubId,
      nextDueDate,
      status: chargeId ? 'pending' : 'active',
    },
  })

  if (chargeId) {
    await prisma.invoice.create({
      data: {
        subscriptionId,
        amount: subscription.plan.price,
        status: 'pending',
        dueDate: new Date(`${firstDueDate}T12:00:00`),
        asaasChargeId: chargeId,
      },
    })
  }

  revalidatePath(`/admin/clientes/${clientId}/assinatura`)
  revalidatePath(`/painel/assinatura`)
  return { success: true }
}

export async function updateSubscriptionDueDate(
  subscriptionId: string,
  clientId: string,
  nextDueDateStr: string,
): Promise<{ error?: string; success?: boolean }> {
  const sub = await prisma.subscription.findUnique({ where: { id: subscriptionId } })
  if (!sub || sub.clientId !== clientId) return { error: 'Assinatura não encontrada.' }

  const parsed = new Date(`${nextDueDateStr}T12:00:00`)
  if (isNaN(parsed.getTime())) return { error: 'Data inválida.' }

  await prisma.subscription.update({
    where: { id: subscriptionId },
    data: { nextDueDate: parsed },
  })

  revalidatePath(`/admin/clientes/${clientId}/assinatura`)
  revalidatePath(`/painel/assinatura`)
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

  // Corrige cobranças pendentes geradas antes da troca de plano
  const pendingInvoices = await prisma.invoice.findMany({
    where: { subscriptionId: subscription.id, status: 'pending' },
    select: { id: true, asaasChargeId: true },
  })

  for (const inv of pendingInvoices) {
    if (inv.asaasChargeId) {
      // Atualiza o valor no Asaas — se falhar não bloqueia a troca de plano
      await provider.updatePendingCharge(inv.asaasChargeId, newPrice).catch((err) => {
        console.warn('[changePlan] Não foi possível atualizar cobrança pendente no Asaas:', inv.asaasChargeId, err)
      })
    }
    await prisma.invoice.update({
      where: { id: inv.id },
      data: { amount: newPlan.price },
    })
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
