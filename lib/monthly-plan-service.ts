import { prisma } from '@/lib/prisma'
import { getPaymentProvider } from '@/lib/payments/provider'
import type { PixAutomaticAuthorization } from '@/lib/payments/provider'
import { sendEmail } from '@/lib/integrations/resend'
import { buildHtml, sendNotification } from '@/lib/notifications'
import { ADMIN_NOTIFICATION_EMAIL } from '@/lib/config'
import {
  FIDELITY_MONTHS,
  MONTHLY_CONTRACT_VERSION,
  addMonths,
  buildMonthlyContract,
  ensureMonthlyPlan,
  formatBRL,
  isMonthlyClient,
} from '@/lib/monthly-plan'

// Fluxo do plano mensal no painel do cliente:
// aceite do contrato → Pix do primeiro mês (Pix Automático) → ativação → recorrência pelo Asaas.

export type MonthlyPix = Pick<PixAutomaticAuthorization, 'status' | 'qrCodePayload' | 'qrCodeImage' | 'expiresAt'> & {
  isMock: boolean
}

function ymd(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

async function loadMonthlyClient(clientId: string) {
  const client = await prisma.client.findUnique({ where: { id: clientId } })
  if (!client || !isMonthlyClient(client)) return { error: 'Cliente não está no plano mensal.' as const }
  if (client.monthlyPrice == null || Number(client.monthlyPrice) <= 0) {
    return { error: 'Valor da mensalidade não definido. Fale com o suporte.' as const }
  }
  return { client, monthlyPrice: Number(client.monthlyPrice) }
}

async function createAuthorization(params: {
  customerId: string
  clientId: string
  monthlyPrice: number
}) {
  const now = new Date()
  return getPaymentProvider().createPixAutomaticAuthorization({
    customerId: params.customerId,
    value: params.monthlyPrice,
    contractId: `TS-${params.clientId.slice(0, 8)}-${now.getTime().toString(36)}`,
    description: 'Site mensal - TopSite',
    // O QR Code imediato cobra o 1º mês; a recorrência começa no mês seguinte
    recurringStartDate: ymd(addMonths(now, 1)),
  })
}

/**
 * Cliente aceitou o contrato no modal: registra o aceite (texto exato, IP, data),
 * envia a cópia a ele e ao admin e gera o Pix do primeiro mês com a autorização recorrente.
 */
export async function acceptMonthlyContract(
  clientId: string,
  meta: { ipAddress: string | null; userAgent: string | null },
): Promise<{ error?: string }> {
  const loaded = await loadMonthlyClient(clientId)
  if ('error' in loaded) return { error: loaded.error }
  const { client, monthlyPrice } = loaded

  const docDigits = client.document?.replace(/\D/g, '') ?? ''
  if (docDigits.length !== 11 && docDigits.length !== 14) {
    return { error: 'Para assinar é necessário ter CPF ou CNPJ cadastrado. Fale com o suporte para atualizar seu cadastro.' }
  }

  const existing = await prisma.subscription.findFirst({
    where: { clientId, status: { in: ['pending', 'active'] } },
    select: { id: true },
  })
  if (existing) return {}

  const acceptedAt = new Date()
  const content = buildMonthlyContract({
    name: client.name,
    document: client.document,
    email: client.email,
    phone: client.phone,
    monthlyPrice,
    acceptedAt,
  })

  const provider = getPaymentProvider()
  const customerId =
    client.asaasCustomerId ??
    (await provider.createCustomer({ name: client.name, email: client.email, document: client.document, phone: client.phone })).customerId

  const authorization = await createAuthorization({ customerId, clientId, monthlyPrice })
  const plan = await ensureMonthlyPlan()

  await prisma.$transaction([
    prisma.contractAcceptance.create({
      data: {
        clientId,
        version: MONTHLY_CONTRACT_VERSION,
        content,
        acceptedAt,
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent?.slice(0, 300) ?? null,
      },
    }),
    prisma.client.update({
      where: { id: clientId },
      data: {
        asaasCustomerId: customerId,
        termsAcceptedAt: acceptedAt,
        termsVersion: MONTHLY_CONTRACT_VERSION,
        monthlyFeeAcknowledgedAt: client.monthlyFeeAcknowledgedAt ?? acceptedAt,
      },
    }),
    prisma.subscription.create({
      data: {
        clientId,
        planId: plan.id,
        status: 'pending',
        customPrice: monthlyPrice,
        pixAutomaticAuthorizationId: authorization.authorizationId,
        planActivatedAt: acceptedAt,
      },
    }),
  ])

  await sendContractCopies({
    clientName: client.name,
    clientEmail: client.email,
    monthlyPrice,
    acceptedAt,
    ipAddress: meta.ipAddress,
    content,
  }).catch((err) => console.error('[mensal] falha ao enviar cópia do contrato', err))

  return {}
}

async function sendContractCopies(params: {
  clientName: string
  clientEmail: string
  monthlyPrice: number
  acceptedAt: Date
  ipAddress: string | null
  content: string
}) {
  const when = params.acceptedAt.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
  const contractBlock = `<div style="margin-top:20px;padding:20px;border:1px solid #e5e7eb;border-radius:8px;font-size:13px;line-height:1.6;color:#374151;">${params.content}</div>`

  await sendEmail({
    to: params.clientEmail,
    subject: 'Cópia do seu contrato — Site por assinatura mensal',
    html: buildHtml(
      'Cópia do seu contrato',
      `Olá, ${params.clientName}! Seu contrato do site por assinatura mensal (${formatBRL(params.monthlyPrice)}/mês) foi assinado em ${when}. Guarde esta cópia. O próximo passo é pagar a primeira mensalidade por Pix no seu painel.`,
      'subscription-welcome',
      contractBlock,
    ),
  })

  await sendEmail({
    to: ADMIN_NOTIFICATION_EMAIL,
    subject: `[TopSite] Contrato assinado — ${params.clientName} (plano mensal)`,
    html: buildHtml(
      `Contrato assinado — ${params.clientName}`,
      `Cliente: ${params.clientName} (${params.clientEmail})\nMensalidade: ${formatBRL(params.monthlyPrice)}\nAceite: ${when}\nIP: ${params.ipAddress ?? 'não identificado'}\nVersão: ${MONTHLY_CONTRACT_VERSION}`,
      'subscription-welcome',
      contractBlock,
      undefined,
      'Abrir o painel',
    ),
  })
}

/** Pix do primeiro mês da assinatura pendente (gera um novo se o anterior expirou ou foi recusado). */
export async function getMonthlyPix(clientId: string): Promise<MonthlyPix | null> {
  const subscription = await prisma.subscription.findFirst({
    where: { clientId, status: 'pending', pixAutomaticAuthorizationId: { not: null } },
    orderBy: { createdAt: 'desc' },
  })
  if (!subscription?.pixAutomaticAuthorizationId) return null

  const provider = getPaymentProvider()
  let auth = await provider.getPixAutomaticAuthorization(subscription.pixAutomaticAuthorizationId)

  if (auth.status === 'ACTIVE') {
    await activateMonthlySubscription(subscription.id, auth.subscriptionId)
    return { ...auth, isMock: false }
  }

  if (auth.status === 'REFUSED' || auth.status === 'EXPIRED' || auth.status === 'CANCELLED') {
    const client = await prisma.client.findUnique({ where: { id: clientId }, select: { asaasCustomerId: true } })
    if (!client?.asaasCustomerId) return null
    auth = await createAuthorization({
      customerId: client.asaasCustomerId,
      clientId,
      monthlyPrice: Number(subscription.customPrice),
    })
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { pixAutomaticAuthorizationId: auth.authorizationId },
    })
  }

  return {
    status: auth.status,
    qrCodePayload: auth.qrCodePayload,
    qrCodeImage: auth.qrCodeImage,
    expiresAt: auth.expiresAt,
    isMock: auth.authorizationId.startsWith('mockpix_'),
  }
}

/**
 * Primeiro pagamento confirmado (autorização ACTIVE): ativa a assinatura, inicia a fidelidade,
 * registra a fatura do primeiro mês e avisa o admin para publicar o site. Idempotente.
 */
export async function activateMonthlySubscription(subscriptionId: string, asaasSubscriptionId: string | null) {
  const now = new Date()
  const { count } = await prisma.subscription.updateMany({
    where: { id: subscriptionId, status: 'pending' },
    data: {
      status: 'active',
      planActivatedAt: now,
      fidelityEndsAt: addMonths(now, FIDELITY_MONTHS),
      nextDueDate: addMonths(now, 1),
      ...(asaasSubscriptionId ? { asaasSubscriptionId } : {}),
    },
  })
  if (count === 0) return false

  const subscription = await prisma.subscription.findUniqueOrThrow({
    where: { id: subscriptionId },
    include: {
      client: {
        include: {
          sites: { select: { status: true } },
          referralReceived: { include: { referrerClient: { select: { name: true } } } },
        },
      },
    },
  })
  const { client } = subscription

  const chargeId = client.asaasCustomerId
    ? await getPaymentProvider().findLatestReceivedPixCharge(client.asaasCustomerId)
    : null

  await prisma.invoice.create({
    data: {
      subscriptionId,
      amount: subscription.customPrice ?? 0,
      status: 'paid',
      dueDate: now,
      paidAt: now,
      asaasChargeId: chargeId,
    },
  })

  await sendNotification(
    client.id,
    'Pagamento confirmado',
    'Recebemos o pagamento da primeira mensalidade. Seu site será publicado em breve.',
    'painel',
    'payment-confirmed',
  )
  await sendNotification(
    null,
    `Publicar site de ${client.name}`,
    `Cliente ${client.name} (plano mensal, ${formatBRL(Number(subscription.customPrice))}/mês) pagou a primeira mensalidade. Suba o site e atualize o status para "online". Fidelidade até ${addMonths(now, FIDELITY_MONTHS).toLocaleDateString('pt-BR')}.`,
  )

  const referral = client.referralReceived
  if (referral && referral.status === 'confirmado') {
    await sendNotification(
      null,
      'Indicação: aplicar 1 mês grátis',
      `Cliente ${client.name}, indicado por ${referral.referrerClient.name}, ativou o plano. Aplique 1 mês grátis para ${referral.referrerClient.name} no Asaas e marque a indicação como recompensada.`,
    )
  }

  return true
}

/** Webhooks PIX_AUTOMATIC_RECURRING_AUTHORIZATION_* do Asaas. */
export async function handlePixAutomaticAuthorizationEvent(event: string, authorizationId: string) {
  const subscription = await prisma.subscription.findFirst({
    where: { pixAutomaticAuthorizationId: authorizationId },
    include: { client: { select: { id: true, name: true } } },
  })
  if (!subscription) return { ok: false, message: `Autorização desconhecida: ${authorizationId}` }

  if (event === 'PIX_AUTOMATIC_RECURRING_AUTHORIZATION_ACTIVATED') {
    const auth = await getPaymentProvider().getPixAutomaticAuthorization(authorizationId)
    const activated = await activateMonthlySubscription(subscription.id, auth.subscriptionId)
    return { ok: true, message: activated ? `Plano mensal de ${subscription.client.name} ativado.` : 'Já estava ativo.' }
  }

  // Cliente revogou o Pix Automático no banco: o contrato continua — cobranças passam a ser Pix comum
  if (event === 'PIX_AUTOMATIC_RECURRING_AUTHORIZATION_CANCELLED' && subscription.status === 'active') {
    await sendNotification(
      null,
      `Pix Automático cancelado — ${subscription.client.name}`,
      `O cliente ${subscription.client.name} revogou o Pix Automático no banco. O contrato e a fidelidade continuam; as próximas mensalidades precisam ser cobradas por Pix comum. Verifique a assinatura no Asaas.`,
    )
  }

  return { ok: true, message: `Evento ${event} registrado.` }
}
