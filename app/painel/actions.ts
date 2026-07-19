'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getPaymentProvider } from '@/lib/payments/provider'
import { getAsaasInvoiceUrl } from '@/lib/integrations/asaas'
import { revalidatePath } from 'next/cache'

async function getClientId(): Promise<string | null> {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'client') return null
  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { clientId: true },
  })
  return user?.clientId ?? null
}

export async function activateBasicPlan(): Promise<{ error?: string; paymentUrl?: string }> {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'client') return { error: 'Não autorizado.' }

  const clientId = await getClientId()
  if (!clientId) return { error: 'Cliente não encontrado.' }

  const existing = await prisma.subscription.findFirst({
    where: { clientId, status: { not: 'canceled' } },
    include: { invoices: { orderBy: { createdAt: 'desc' }, take: 1 } },
  })
  if (existing) {
    if (existing.status === 'active') return { error: 'Você já possui uma assinatura ativa.' }
    // Já existe cobrança pendente — devolve a URL do boleto/PIX gerado anteriormente
    const chargeId = existing.invoices[0]?.asaasChargeId ?? null
    const paymentUrl = chargeId ? await getAsaasInvoiceUrl(chargeId) : null
    return { paymentUrl: paymentUrl ?? undefined }
  }

  const [client, basicPlan] = await Promise.all([
    prisma.client.findUnique({ where: { id: clientId } }),
    prisma.plan.findFirst({ where: { name: 'Básico' } }),
  ])
  if (!client) return { error: 'Cliente não encontrado.' }
  if (!basicPlan) return { error: 'Plano básico não encontrado.' }

  const docDigits = client.document?.replace(/\D/g, '') ?? ''
  if (docDigits.length !== 11 && docDigits.length !== 14) {
    return { error: 'Para ativar o plano é necessário ter CPF ou CNPJ cadastrado. Entre em contato com o suporte para atualizar seu cadastro.' }
  }

  const provider = getPaymentProvider()

  const { customerId } = await provider.createCustomer({
    name: client.name,
    email: client.email,
    document: client.document,
    phone: client.phone,
  })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const { subscriptionId, chargeId, nextDueDate, paymentUrl } =
    await provider.createSubscription({
      customerId,
      planName: basicPlan.name,
      price: Number(basicPlan.price),
      successUrl: `${appUrl}/painel?ativado=1`,
    })

  const subscription = await prisma.subscription.create({
    data: {
      clientId,
      planId: basicPlan.id,
      status: 'pending',
      asaasSubscriptionId: subscriptionId,
      nextDueDate,
      planActivatedAt: new Date(),
    },
  })

  const dueDate = new Date()
  dueDate.setDate(dueDate.getDate() + 1)

  await prisma.invoice.create({
    data: {
      subscriptionId: subscription.id,
      amount: basicPlan.price,
      status: 'pending',
      dueDate,
      asaasChargeId: chargeId,
    },
  })

  revalidatePath('/painel')
  return { paymentUrl }
}

export async function markRetentionShown(): Promise<void> {
  const clientId = await getClientId()
  if (!clientId) return

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { downloadRetentionShownAt: true },
  })
  if (client && !client.downloadRetentionShownAt) {
    await prisma.client.update({
      where: { id: clientId },
      data: { downloadRetentionShownAt: new Date() },
    })
  }
}

export async function requestZipUploadNotification(siteId: string): Promise<void> {
  const clientId = await getClientId()
  if (!clientId) return

  const site = await prisma.site.findUnique({
    where: { id: siteId, clientId },
    include: { client: { select: { name: true } } },
  })
  if (!site) return

  await prisma.notification.create({
    data: {
      clientId: null,
      title: 'Upload de ZIP necessário',
      message: `O cliente ${site.client.name} tentou baixar os arquivos do site, mas o ZIP ainda não foi enviado. Faça o upload para liberar o download.`,
      channel: 'painel',
    },
  })
}

const REASON_LABELS: Record<string, string> = {
  preco: 'Achou o preço caro',
  hospedagem: 'Já tem hospedagem',
  outro_lugar: 'Vai hospedar em outro lugar',
  nao_usar: 'Não vai usar o site agora',
  outro: 'Outro motivo',
}

export async function submitDownloadReason(
  siteId: string,
  reason: string,
  detail: string,
): Promise<void> {
  const clientId = await getClientId()
  if (!clientId) return

  const site = await prisma.site.findUnique({
    where: { id: siteId, clientId },
    include: { client: { select: { name: true } } },
  })
  if (!site) return

  const label = REASON_LABELS[reason] ?? reason
  const msg = `Cliente ${site.client.name} optou por baixar os arquivos. Motivo: ${label}${detail ? ` — "${detail}"` : ''}`

  await prisma.notification.create({
    data: {
      clientId: null,
      title: 'Download solicitado — arquivos via WhatsApp',
      message: msg,
      channel: 'painel',
    },
  })
}

export async function markNotificationRead(id: string): Promise<void> {
  const clientId = await getClientId()
  if (!clientId) return

  await prisma.notification.updateMany({
    where: { id, clientId },
    data: { read: true },
  })

  revalidatePath('/painel')
  revalidatePath('/painel/notificacoes')
}

export async function markAllNotificationsRead(): Promise<void> {
  const clientId = await getClientId()
  if (!clientId) return

  await prisma.notification.updateMany({
    where: { clientId, read: false },
    data: { read: true },
  })

  revalidatePath('/painel')
  revalidatePath('/painel/notificacoes')
}
