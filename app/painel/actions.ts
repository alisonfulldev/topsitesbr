'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getPaymentProvider } from '@/lib/payments/provider'
import { getAsaasInvoiceUrl } from '@/lib/integrations/asaas'
import { sendNotification } from '@/lib/notifications'
import { sendSubscriptionWelcome } from '@/lib/notifications'
import { TERMS_VERSION } from '@/lib/config'
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

export async function activateBasicPlan(opts?: { termsAccepted?: boolean }): Promise<{ error?: string; paymentUrl?: string }> {
  return activatePlan(opts)
}

export async function activatePlan(opts?: { termsAccepted?: boolean }): Promise<{ error?: string; paymentUrl?: string }> {
  try {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'client') return { error: 'Não autorizado.' }

  // Server-side terms validation
  if (opts?.termsAccepted === false) {
    return { error: 'Você precisa aceitar os Termos de Uso para continuar.' }
  }

  const clientId = await getClientId()
  if (!clientId) return { error: 'Cliente não encontrado.' }

  const existing = await prisma.subscription.findFirst({
    where: { clientId, status: { not: 'canceled' } },
    include: { invoices: { orderBy: { createdAt: 'desc' }, take: 1 } },
  })
  if (existing) {
    if (existing.status === 'active') return { error: 'Você já possui uma assinatura ativa.' }
    // Já existe cobrança pendente — tenta recuperar a URL do boleto/PIX
    const chargeId = existing.invoices[0]?.asaasChargeId ?? null
    const paymentUrl = chargeId ? await getAsaasInvoiceUrl(chargeId) : null
    if (paymentUrl) return { paymentUrl }
    // chargeId inválido (ex: criado em sandbox antes de ir para produção)
    // Marca como cancelada e cria nova assinatura em produção
    await prisma.subscription.update({ where: { id: existing.id }, data: { status: 'canceled' } })
  }

  // Verifica se é primeira ativação (mês grátis) ou reativação
  const hasPriorSubscription = await prisma.subscription.findFirst({
    where: { clientId },
    select: { id: true },
  })
  const freeMonth = !hasPriorSubscription

  const [client, plan] = await Promise.all([
    prisma.client.findUnique({ where: { id: clientId } }),
    prisma.plan.findFirst({ where: { name: 'Site no Ar' } }),
  ])
  if (!client) return { error: 'Cliente não encontrado.' }
  if (!plan) return { error: 'Plano não encontrado no banco de dados.' }

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
      planName: plan.name,
      price: Number(plan.price),
      successUrl: `${appUrl}/painel?ativado=1`,
      freeMonth,
    })

  const now = new Date()

  // Record terms acceptance (activation always implies acceptance)
  await prisma.client.update({
    where: { id: clientId },
    data: {
      termsAcceptedAt: now,
      termsVersion: TERMS_VERSION,
    },
  })

  if (freeMonth) {
    // Mês grátis: ativa direto sem cobrança imediata
    await prisma.subscription.create({
      data: {
        clientId,
        planId: plan.id,
        status: 'active',
        asaasSubscriptionId: subscriptionId,
        nextDueDate,
        planActivatedAt: now,
      },
    })

    // Notifica cliente
    await sendNotification(
      clientId,
      'Assinatura ativada com 1 mês grátis!',
      `Seu plano ${plan.name} foi ativado. O primeiro mês é grátis — sua primeira cobrança de R$${Number(plan.price).toFixed(2).replace('.', ',')} será em ${nextDueDate ? nextDueDate.toLocaleDateString('pt-BR') : '30 dias'}.`,
      'painel',
      'payment-confirmed',
    )

    // Notifica admin para publicar o site
    await sendNotification(
      null,
      `Publicar site de ${client.name}`,
      `Cliente ${client.name} ativou o plano ${plan.name} (mês grátis). Suba o site e atualize o status para "online".`,
    )

    // E-mail de boas-vindas
    await sendSubscriptionWelcome(client.email, client.name, nextDueDate)

    // Verifica indicação
    const referral = await prisma.referral.findFirst({
      where: { referredClientId: clientId, status: 'confirmado' },
      include: { referrerClient: { select: { id: true, name: true } } },
    })
    if (referral) {
      await sendNotification(
        null,
        'Indicação: aplicar 1 mês grátis',
        `Cliente ${client.name}, indicado por ${referral.referrerClient.name}, ativou o plano. Aplique 1 mês grátis para ${referral.referrerClient.name} no Asaas e marque a indicação como recompensada.`,
      )
    }

    revalidatePath('/painel')
    return { paymentUrl: '/painel?ativado=1' }
  }

  // Reativação normal (com cobrança)
  const subscription = await prisma.subscription.create({
    data: {
      clientId,
      planId: plan.id,
      status: 'pending',
      asaasSubscriptionId: subscriptionId,
      nextDueDate,
      planActivatedAt: now,
    },
  })

  const dueDate = new Date()
  dueDate.setDate(dueDate.getDate() + 1)

  if (chargeId) {
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

  revalidatePath('/painel')
  return { paymentUrl }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[activatePlan]', msg)
    return { error: `Erro ao processar pagamento: ${msg}` }
  }
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
