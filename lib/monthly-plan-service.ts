import { prisma } from '@/lib/prisma'
import { getPaymentProvider } from '@/lib/payments/provider'
import type { PixAutomaticAuthorization } from '@/lib/payments/provider'
import { sendEmail } from '@/lib/integrations/resend'
import { buildHtml, sendNotification, sendOverdueDay0, sendPaymentRegularized } from '@/lib/notifications'
import { ADMIN_NOTIFICATION_EMAIL } from '@/lib/config'
import { paymentLink } from '@/lib/pix-payment-link'
import {
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
 * Primeiro pagamento confirmado (autorização ACTIVE): ativa a assinatura (sem fidelidade),
 * registra a fatura do primeiro mês e avisa o admin para publicar o site. Idempotente.
 */
export async function activateMonthlySubscription(subscriptionId: string, asaasSubscriptionId: string | null) {
  const now = new Date()
  const { count } = await prisma.subscription.updateMany({
    where: { id: subscriptionId, status: 'pending' },
    data: {
      status: 'active',
      planActivatedAt: now,
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
    `Cliente ${client.name} (plano mensal, ${formatBRL(Number(subscription.customPrice))}/mês) pagou a primeira mensalidade. O projeto entrou em "aguardando informações" (briefing).`,
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
      `O cliente ${subscription.client.name} revogou o Pix Automático no banco. O contrato continua; as próximas mensalidades precisam ser cobradas por Pix comum. Verifique a assinatura no Asaas.`,
    )
  }

  return { ok: true, message: `Evento ${event} registrado.` }
}

// ─── Migração das assinaturas antigas para o Pix Automático ───────────────────
// Assinaturas comuns do Asaas (Pix/boleto/cartão a cada mês) passam a ser cobradas por Pix com
// débito automático a partir da próxima mensalidade: a cobrança pendente do ciclo e a assinatura
// antiga são removidas no Asaas e o ciclo novo gera o Pix que já autoriza a recorrência.

interface AsaasSubscriptionInfo { id: string; value: number; nextDueDate: string; status: string }
interface AsaasSubPayment { id: string; status: string; dueDate: string; value: number }

const PAID = ['RECEIVED', 'CONFIRMED', 'RECEIVED_IN_CASH']
const MIGRATION_SETTING = 'pix_automatic_migration_enabled'

export async function isPixMigrationEnabled() {
  const row = await prisma.systemSetting.findUnique({ where: { key: MIGRATION_SETTING } })
  return row?.value === 'true'
}

export async function setPixMigrationEnabled(enabled: boolean) {
  const value = enabled ? 'true' : 'false'
  await prisma.systemSetting.upsert({ where: { key: MIGRATION_SETTING }, update: { value }, create: { key: MIGRATION_SETTING, value } })
}

export async function migrateToPixAutomatic(
  subscriptionId: string,
  /** Decisão do admin: migra mesmo com o ciclo atual já pago e define o próximo vencimento */
  opts: { ignorePaidCycle?: boolean; nextDueDate?: Date } = {},
): Promise<{ migrated: boolean; reason?: string }> {
  const sub = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
    include: { client: { select: { id: true, name: true, email: true, monthlyPrice: true } }, plan: { select: { price: true } } },
  })
  if (!sub) return { migrated: false, reason: 'Assinatura não encontrada.' }
  if (sub.pixAutomaticAuthorizationId) return { migrated: false, reason: 'Já está no Pix Automático.' }
  if (!sub.asaasSubscriptionId) return { migrated: false, reason: 'Assinatura sem vínculo com o Asaas (já está no fluxo novo).' }
  if (sub.status !== 'active') return { migrated: false, reason: 'Só migra assinaturas em dia (regularize o atraso primeiro).' }

  let price = sub.customPrice != null ? Number(sub.customPrice) : Number(sub.plan.price)
  let dueDate = sub.nextDueDate ?? addMonths(new Date(), 1)

  if (process.env.PAYMENT_DRIVER === 'asaas') {
    const { asaasFetch } = await import('@/lib/integrations/asaas')
    const asaasSub = await asaasFetch<AsaasSubscriptionInfo>(`/subscriptions/${sub.asaasSubscriptionId}`)
    const payments = (await asaasFetch<{ data: AsaasSubPayment[] }>(`/subscriptions/${sub.asaasSubscriptionId}/payments?limit=20&offset=0`)).data
    const todayStr = ymd(new Date())

    if (payments.some((p) => p.status === 'OVERDUE')) return { migrated: false, reason: 'Há cobrança em atraso no Asaas.' }
    // Mensalidade do ciclo já paga (adiantada): migra no próximo ciclo
    if (!opts.ignorePaidCycle && payments.some((p) => PAID.includes(p.status) && p.dueDate >= todayStr)) {
      return { migrated: false, reason: 'A mensalidade deste ciclo já foi paga — migra no próximo.' }
    }

    price = Number(asaasSub.value) || price
    const pending = payments.filter((p) => p.status === 'PENDING').sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    dueDate = opts.nextDueDate ?? new Date(`${(pending[0]?.dueDate ?? asaasSub.nextDueDate)}T12:00:00`)

    // Remove as cobranças pendentes do ciclo e a assinatura antiga (sem cobrança duplicada)
    for (const p of pending) {
      await asaasFetch(`/payments/${p.id}`, { method: 'DELETE' })
    }
    await getPaymentProvider().cancelSubscription(sub.asaasSubscriptionId)
    if (pending.length) {
      await prisma.invoice.deleteMany({ where: { subscriptionId: sub.id, status: 'pending', asaasChargeId: { in: pending.map((p) => p.id) } } })
    }
  }

  await prisma.subscription.update({
    where: { id: sub.id },
    data: { asaasSubscriptionId: null, customPrice: price, nextDueDate: dueDate },
  })
  if (sub.client.monthlyPrice == null) {
    await prisma.client.update({ where: { id: sub.client.id }, data: { monthlyPrice: price } })
  }

  await sendNotification(
    sub.client.id,
    'Sua mensalidade agora é paga por Pix',
    `A partir da mensalidade de ${dueDate.toLocaleDateString('pt-BR')}, o pagamento é feito por Pix. Alguns dias antes do vencimento você recebe por e-mail o Pix para pagar (sem precisar entrar no painel). Ao pagar, seu banco pode pedir para autorizar o débito automático das próximas mensalidades. O valor continua ${formatBRL(price)}.`,
    'email',
    'charge-created',
  )
  await sendNotification(
    null,
    `Migrado para Pix Automático — ${sub.client.name}`,
    `Assinatura antiga encerrada no Asaas. Próxima mensalidade (${formatBRL(price)}, venc. ${dueDate.toLocaleDateString('pt-BR')}) será cobrada por Pix com débito automático.`,
  )
  return { migrated: true }
}

// ─── Ciclo diário (cron sync-subscriptions) ───────────────────────────────────
const DAYS_BEFORE_DUE = 5

/**
 * Pix Automático para todas as assinaturas recorrentes:
 * 0) assinaturas antigas com vencimento próximo migram (cobrança comum → Pix Automático);
 * 1) a poucos dias do vencimento, gera o Pix da mensalidade, que já autoriza o débito automático;
 * 2) confere as autorizações em aberto e marca atraso quando o vencimento passa sem pagamento.
 */
export async function processPixAutomaticCycles(): Promise<{ migrated: number; created: number; activated: number; overdue: number; errors: number }> {
  const now = new Date()
  const limit = new Date(now.getTime() + DAYS_BEFORE_DUE * 86_400_000)
  const today = new Date(now)
  today.setHours(0, 0, 0, 0)
  const result = { migrated: 0, created: 0, activated: 0, overdue: 0, errors: 0 }
  const provider = getPaymentProvider()

  // 0) Assinaturas antigas com a próxima mensalidade chegando: migram para o Pix Automático
  //    (só com a migração automática ligada no admin — começa desligada até o teste com 1 cliente)
  const legacy = (await isPixMigrationEnabled())
    ? await prisma.subscription.findMany({
        where: { status: 'active', asaasSubscriptionId: { not: null }, pixAutomaticAuthorizationId: null, nextDueDate: { lte: limit } },
        select: { id: true },
      })
    : []
  for (const sub of legacy) {
    try {
      const r = await migrateToPixAutomatic(sub.id)
      if (r.migrated) result.migrated++
      else console.log('[pix-ciclo] migração adiada', sub.id, r.reason)
    } catch (err) {
      console.error('[pix-ciclo] erro na migração', sub.id, err)
      result.errors++
    }
  }

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
      await sendPixChargeEmail(sub.id, 'charge')
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
        await sendPixChargeEmail(sub.id, 'overdue')
        result.overdue++
      }
    } catch (err) {
      console.error('[pix-ciclo] erro ao conferir autorização', sub.id, err)
      result.errors++
    }
  }

  return result
}

// ─── E-mail de cobrança com o Pix (sem login) ─────────────────────────────────

function escapeHtml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/**
 * Mensalidade em aberto por Pix: avisa no painel e por e-mail com o link de pagamento (sem login)
 * e o Pix copia e cola. "charge" = mensalidade disponível; "overdue" = vencida (dia 0 do atraso).
 */
export async function sendPixChargeEmail(subscriptionId: string, kind: 'charge' | 'overdue') {
  const sub = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
    include: { client: { select: { id: true, name: true, email: true } }, plan: { select: { name: true } } },
  })
  if (!sub) return
  const price = formatBRL(Number(sub.customPrice ?? 0))
  const due = sub.nextDueDate ? sub.nextDueDate.toLocaleDateString('pt-BR') : ''
  const link = paymentLink(sub.id)
  const pix = await getMonthlyPix(sub.client.id).catch(() => null)

  const title = kind === 'charge' ? 'Sua mensalidade está disponível para pagamento' : 'Pagamento em atraso'
  const message =
    kind === 'charge'
      ? `Olá, ${sub.client.name.split(' ')[0]}! Sua mensalidade de ${price} vence em ${due}. Pague pelo Pix: é só abrir o link abaixo ou usar o código copia e cola. Ao pagar, seu banco pode pedir para autorizar o débito automático das próximas mensalidades.`
      : `Olá, ${sub.client.name.split(' ')[0]}! Sua mensalidade de ${price} venceu${due ? ` em ${due}` : ''} e ainda não identificamos o pagamento. Regularize pelo Pix para manter seu site no ar — é só abrir o link abaixo ou usar o código copia e cola.`

  const copyBlock = pix?.qrCodePayload && pix.status !== 'ACTIVE'
    ? `<div style="margin:0 0 24px;padding:14px;border:1px dashed #d1d5db;border-radius:8px;background:#f9fafb;">
        <p style="margin:0 0 6px;font-size:12px;color:#6b7280;">Pix copia e cola (válido por 24 h; depois, use o link para gerar outro):</p>
        <p style="margin:0;font-family:monospace;font-size:12px;color:#111827;word-break:break-all;">${escapeHtml(pix.qrCodePayload)}</p>
      </div>`
    : ''

  await prisma.notification.create({ data: { clientId: sub.client.id, title, message: `${message}\n\nPagar: ${link}`, channel: 'email' } })
  try {
    await sendEmail({
      to: sub.client.email,
      subject: title,
      html: buildHtml(title, message, kind === 'charge' ? 'charge-created' : 'payment-overdue', copyBlock, link, 'Pagar com Pix'),
    })
  } catch (err) {
    console.error('[pix] falha ao enviar e-mail de cobrança', sub.id, err)
  }
}
