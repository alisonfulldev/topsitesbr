import { prisma } from '@/lib/prisma'
import { getPaymentProvider } from '@/lib/payments/provider'
import type { PixAutomaticAuthorization } from '@/lib/payments/provider'
import { sendEmail } from '@/lib/integrations/resend'
import { buildHtml, sendNotification, sendOverdueDay0, sendPaymentRegularized } from '@/lib/notifications'
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
  /** Início das cobranças automáticas. Padrão: um mês a partir de hoje. */
  recurringStart?: Date
}) {
  const now = new Date()
  return getPaymentProvider().createPixAutomaticAuthorization({
    customerId: params.customerId,
    value: params.monthlyPrice,
    contractId: `TS-${params.clientId.slice(0, 8)}-${now.getTime().toString(36)}`,
    description: 'Mensalidade do site - TopSite',
    // O QR Code imediato cobra a mensalidade atual; a recorrência começa no mês seguinte
    recurringStartDate: ymd(params.recurringStart ?? addMonths(now, 1)),
  })
}

// Mensalidade do ciclo atual (Site no Ar com Pix Automático): a recorrência começa um mês após o vencimento
function cycleRecurringStart(nextDueDate: Date | null) {
  const now = new Date()
  const base = nextDueDate && nextDueDate > now ? nextDueDate : now
  return addMonths(base, 1)
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

/**
 * Pix em aberto que autoriza o Pix Automático: o 1º mês do plano mensal ou a mensalidade dos
 * novos clientes do Site no Ar. Gera um novo se o anterior expirou ou foi recusado.
 */
export async function getMonthlyPix(clientId: string): Promise<MonthlyPix | null> {
  const subscription = await prisma.subscription.findFirst({
    where: {
      clientId,
      status: { in: ['pending', 'active', 'overdue'] },
      pixAutomaticAuthorizationId: { not: null },
      asaasSubscriptionId: null,
    },
    orderBy: { createdAt: 'desc' },
  })
  if (!subscription?.pixAutomaticAuthorizationId) return null

  const provider = getPaymentProvider()
  let auth = await provider.getPixAutomaticAuthorization(subscription.pixAutomaticAuthorizationId)

  if (auth.status === 'ACTIVE') {
    await activatePixAutomatic(subscription.id, auth.subscriptionId)
    return { ...auth, isMock: false }
  }

  if (auth.status === 'REFUSED' || auth.status === 'EXPIRED' || auth.status === 'CANCELLED') {
    const client = await prisma.client.findUnique({ where: { id: clientId }, select: { asaasCustomerId: true } })
    if (!client?.asaasCustomerId) return null
    auth = await createAuthorization({
      customerId: client.asaasCustomerId,
      clientId,
      monthlyPrice: Number(subscription.customPrice),
      recurringStart: subscription.status === 'pending' ? undefined : cycleRecurringStart(subscription.nextDueDate),
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

/** Autorização ACTIVE: 1º mês do plano mensal (assinatura pendente) ou mensalidade do Site no Ar. */
export async function activatePixAutomatic(subscriptionId: string, asaasSubscriptionId: string | null) {
  const sub = await prisma.subscription.findUnique({ where: { id: subscriptionId }, select: { status: true } })
  if (!sub) return false
  if (sub.status === 'pending') return activateMonthlySubscription(subscriptionId, asaasSubscriptionId)
  return activateCycleSubscription(subscriptionId, asaasSubscriptionId)
}

/**
 * Site no Ar (novos clientes): a mensalidade em aberto foi paga pelo Pix que autoriza o débito
 * automático. A partir daqui o Asaas gera as próximas cobranças. Idempotente.
 */
async function activateCycleSubscription(subscriptionId: string, asaasSubscriptionId: string | null) {
  const current = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
    include: {
      plan: { select: { name: true } },
      client: { select: { id: true, name: true, email: true, asaasCustomerId: true } },
      invoices: { where: { status: { in: ['pending', 'overdue'] }, asaasChargeId: null }, orderBy: { dueDate: 'asc' }, take: 1 },
    },
  })
  if (!current) return false
  const openInvoice = current.invoices[0] ?? null
  // Sem mensalidade em aberto não há pagamento a registrar: só completa o vínculo com o Asaas
  if (!openInvoice) {
    if (asaasSubscriptionId && !current.asaasSubscriptionId) {
      await prisma.subscription.update({ where: { id: subscriptionId }, data: { asaasSubscriptionId } })
    }
    return false
  }
  const now = new Date()
  const baseDue = openInvoice.dueDate
  const wasOverdue = current.status === 'overdue' || openInvoice.status === 'overdue'

  const { count } = await prisma.subscription.updateMany({
    where: { id: subscriptionId, asaasSubscriptionId: null, status: { in: ['active', 'overdue'] } },
    data: {
      status: 'active',
      nextDueDate: addMonths(baseDue, 1),
      ...(asaasSubscriptionId ? { asaasSubscriptionId } : {}),
    },
  })
  if (count === 0) return false

  const chargeId = current.client.asaasCustomerId
    ? await getPaymentProvider().findLatestReceivedPixCharge(current.client.asaasCustomerId)
    : null
  await prisma.invoice.update({
    where: { id: openInvoice.id },
    data: { status: 'paid', paidAt: now, asaasChargeId: chargeId },
  })

  await sendNotification(
    current.client.id,
    'Pagamento confirmado',
    `Recebemos o pagamento da sua mensalidade do plano ${current.plan.name}. Obrigado!`,
    'painel',
    'payment-confirmed',
  )
  if (wasOverdue) {
    if (current.client.email) await sendPaymentRegularized(current.client.email, current.client.name)
    await sendNotification(
      null,
      `Republicar site de ${current.client.name} — pagamento regularizado`,
      `Cliente ${current.client.name} regularizou o pagamento. Publique o site e marque o status como "online" no painel.`,
    )
  }
  return true
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

  await ensureMonthlyProposal(client.id, client.name, now)

  await sendNotification(
    client.id,
    'Pagamento confirmado',
    'Recebemos o pagamento da primeira mensalidade. Agora envie as informações do seu negócio no painel para começarmos o seu site.',
    'painel',
    'payment-confirmed',
  )
  await sendNotification(
    null,
    `Plano mensal ativo — ${client.name}`,
    `Cliente ${client.name} (plano mensal, ${formatBRL(Number(subscription.customPrice))}/mês) pagou a primeira mensalidade. O projeto entrou em "aguardando informações" (briefing). Fidelidade até ${addMonths(now, FIDELITY_MONTHS).toLocaleDateString('pt-BR')}.`,
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

/**
 * Projeto do plano mensal no mesmo fluxo de produção dos demais clientes:
 * briefing → em desenvolvimento → revisão → publicado. Idempotente.
 */
export async function ensureMonthlyProposal(clientId: string, clientName: string, paidAt = new Date()) {
  const existingProposal = await prisma.proposal.findFirst({ where: { clientId }, select: { id: true } })
  if (existingProposal) return
  const contract = await prisma.contractAcceptance.findFirst({
    where: { clientId },
    orderBy: { acceptedAt: 'desc' },
  })
  await prisma.proposal.create({
    data: {
      clientId,
      title: `Site de ${clientName}`,
      creationPrice: 0,
      status: 'aguardando_info',
      paidAt,
      contractAcceptedAt: contract?.acceptedAt ?? null,
      contractVersion: contract?.version ?? MONTHLY_CONTRACT_VERSION,
      contractAcceptedIp: contract?.ipAddress ?? null,
    },
  })
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
    const activated = await activatePixAutomatic(subscription.id, auth.subscriptionId)
    return { ok: true, message: activated ? `Pix Automático de ${subscription.client.name} ativado.` : 'Já estava ativo.' }
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

// ─── Ciclo diário (cron sync-subscriptions) ───────────────────────────────────
const DAYS_BEFORE_DUE = 5

/**
 * Novos clientes do Site no Ar (assinatura com valor próprio e sem assinatura no Asaas):
 * 1) a poucos dias do vencimento, gera o Pix da mensalidade, que já autoriza o débito automático;
 * 2) confere as autorizações em aberto e marca atraso quando o vencimento passa sem pagamento.
 */
export async function processPixAutomaticCycles(): Promise<{ created: number; activated: number; overdue: number; errors: number }> {
  const now = new Date()
  const limit = new Date(now.getTime() + DAYS_BEFORE_DUE * 86_400_000)
  const today = new Date(now)
  today.setHours(0, 0, 0, 0)
  const result = { created: 0, activated: 0, overdue: 0, errors: 0 }
  const provider = getPaymentProvider()

  // 1) Mensalidade chegando: gera o Pix
  const dueSoon = await prisma.subscription.findMany({
    where: {
      status: 'active',
      customPrice: { not: null },
      asaasSubscriptionId: null,
      pixAutomaticAuthorizationId: null,
      nextDueDate: { lte: limit },
    },
    include: { client: true },
  })
  for (const sub of dueSoon) {
    try {
      const { client } = sub
      const customerId =
        client.asaasCustomerId ??
        (await provider.createCustomer({ name: client.name, email: client.email, document: client.document, phone: client.phone })).customerId
      if (!client.asaasCustomerId) {
        await prisma.client.update({ where: { id: client.id }, data: { asaasCustomerId: customerId } })
      }
      const price = Number(sub.customPrice)
      const dueDate = sub.nextDueDate ?? now
      const auth = await createAuthorization({
        customerId,
        clientId: client.id,
        monthlyPrice: price,
        recurringStart: cycleRecurringStart(dueDate),
      })
      await prisma.$transaction([
        prisma.subscription.update({ where: { id: sub.id }, data: { pixAutomaticAuthorizationId: auth.authorizationId } }),
        prisma.invoice.create({ data: { subscriptionId: sub.id, amount: price, status: 'pending', dueDate } }),
      ])
      await sendNotification(
        client.id,
        'Sua mensalidade está disponível para pagamento',
        `Sua mensalidade de ${formatBRL(price)} vence em ${dueDate.toLocaleDateString('pt-BR')}. Pague por Pix no seu painel: ao pagar, seu banco pode pedir para autorizar o débito das próximas mensalidades.`,
        'email',
        'charge-created',
      )
      result.created++
    } catch (err) {
      console.error('[pix-ciclo] erro ao gerar Pix', sub.id, err)
      result.errors++
    }
  }

  // 2) Pix em aberto: pagamento confirmado ou atraso
  const open = await prisma.subscription.findMany({
    where: {
      status: { in: ['active', 'overdue'] },
      customPrice: { not: null },
      asaasSubscriptionId: null,
      pixAutomaticAuthorizationId: { not: null },
    },
    include: {
      client: { select: { id: true, name: true, email: true } },
      plan: { select: { name: true } },
      invoices: { where: { status: 'pending', asaasChargeId: null, dueDate: { lt: today } }, take: 1 },
    },
  })
  for (const sub of open) {
    try {
      const auth = await provider.getPixAutomaticAuthorization(sub.pixAutomaticAuthorizationId!)
      if (auth.status === 'ACTIVE') {
        if (await activatePixAutomatic(sub.id, auth.subscriptionId)) result.activated++
        continue
      }
      const late = sub.invoices[0]
      if (late) {
        await prisma.$transaction([
          prisma.invoice.update({ where: { id: late.id }, data: { status: 'overdue', overdueDay0SentAt: now } }),
          prisma.subscription.update({ where: { id: sub.id }, data: { status: 'overdue' } }),
        ])
        await sendNotification(
          sub.client.id,
          'Pagamento em atraso',
          `Identificamos um pagamento em atraso do plano ${sub.plan.name}. Pague pelo Pix no seu painel para manter seu site no ar.`,
          'painel',
          'payment-overdue',
        )
        if (sub.client.email) await sendOverdueDay0(sub.client.email, sub.client.name, null)
        result.overdue++
      }
    } catch (err) {
      console.error('[pix-ciclo] erro ao conferir autorização', sub.id, err)
      result.errors++
    }
  }

  return result
}
