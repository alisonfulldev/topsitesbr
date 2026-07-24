import { prisma } from '@/lib/prisma'
import {
  sendNotification,
  sendOverdueDay0,
  sendOverdueDay5,
  sendOverdueDay10,
  sendPaymentRegularized,
} from '@/lib/notifications'
import { asaasFetch } from '@/lib/integrations/asaas'

interface AsaasPaymentStatus {
  id: string
  status: string
}
interface AsaasPaymentList {
  data: AsaasPaymentStatus[]
}

export async function handlePaymentReceived(chargeId: string): Promise<{
  ok: boolean
  message: string
}> {
  const invoice = await prisma.invoice.findFirst({
    where: { asaasChargeId: chargeId },
    include: {
      subscription: {
        include: {
          client: {
            include: {
              sites: { select: { status: true } },
              referralReceived: {
                include: {
                  referrerClient: { select: { id: true, name: true } },
                },
              },
            },
          },
          plan: { select: { name: true } },
          invoices: {
            where: { status: 'paid' },
            select: { id: true },
          },
        },
      },
    },
  })

  if (!invoice) {
    // Tenta encontrar uma Order (cobrança avulsa — upsell / ticket extra)
    const order = await prisma.order.findFirst({
      where: { asaasChargeId: chargeId },
      include: {
        client: { select: { id: true, name: true } },
        product: { select: { name: true } },
      },
    })

    if (!order) {
      return { ok: false, message: `Cobrança não encontrada: ${chargeId}` }
    }

    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'paid' },
    })

    await sendNotification(
      order.client.id,
      'Compra confirmada',
      `Seu pedido de "${order.product.name}" foi confirmado. Em breve entraremos em contato para prosseguir.`,
      'painel',
      'payment-confirmed',
    )
    await sendNotification(
      null,
      `Novo pedido: ${order.product.name}`,
      `Cliente ${order.client.name} comprou "${order.product.name}". Verifique e execute o serviço.`,
    )

    return {
      ok: true,
      message: `Pedido de "${order.product.name}" por ${order.client.name} confirmado.`,
    }
  }

  const { subscription } = invoice
  const { client } = subscription
  const isFirstPayment = subscription.invoices.length === 0
  const wasOverdue = invoice.status === 'overdue'

  // Apenas atualizações financeiras na transaction — notificações ficam fora
  await prisma.$transaction([
    prisma.invoice.update({
      where: { id: invoice.id },
      data: { status: 'paid', paidAt: new Date() },
    }),
    prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: 'active' },
    }),
  ])

  await sendNotification(
    client.id,
    'Pagamento confirmado',
    `Seu pagamento do plano ${subscription.plan.name} foi confirmado. Obrigado!`,
    'painel',
    'payment-confirmed',
  )

  // Se o pagamento regularizou uma inadimplência, notifica admin para republicar
  if (wasOverdue) {
    const clientEmail = await prisma.client.findUnique({
      where: { id: client.id },
      select: { email: true },
    })
    if (clientEmail?.email) {
      await sendPaymentRegularized(clientEmail.email, client.name)
    }
    await sendNotification(
      null,
      `Republicar site de ${client.name} — pagamento regularizado`,
      `Cliente ${client.name} regularizou o pagamento. Publique o site e marque o status como "online" no painel.`,
    )
  }

  if (isFirstPayment) {
    const hasPendingSite = client.sites.some((s) => s.status === 'pendente_ativacao')
    if (hasPendingSite) {
      await sendNotification(
        null,
        `Publicar site de ${client.name}`,
        `Cliente ${client.name} ativou o plano. Suba o site no GitHub Pages e atualize o status para "online".`,
      )
    }

    const referral = client.referralReceived
    if (referral && referral.status === 'confirmado') {
      await sendNotification(
        null,
        'Indicação: aplicar 1 mês grátis',
        `Cliente ${client.name}, indicado por ${referral.referrerClient.name}, ativou o plano. Aplique 1 mês grátis para ${referral.referrerClient.name} no Asaas e marque a indicação como recompensada.`,
      )
    }
  }

  return {
    ok: true,
    message: `Pagamento confirmado para ${client.name}${isFirstPayment ? ' (primeiro pagamento)' : ''}${wasOverdue ? ' (regularizou inadimplência)' : ''}.`,
  }
}

export async function handlePaymentOverdue(chargeId: string): Promise<{
  ok: boolean
  message: string
}> {
  const invoice = await prisma.invoice.findFirst({
    where: { asaasChargeId: chargeId },
    include: {
      subscription: {
        include: {
          client: { select: { id: true, name: true, email: true } },
          plan: { select: { name: true } },
        },
      },
    },
  })

  if (!invoice) {
    return { ok: false, message: `Fatura não encontrada para chargeId: ${chargeId}` }
  }

  const { subscription } = invoice
  const { client } = subscription

  await prisma.$transaction([
    prisma.invoice.update({
      where: { id: invoice.id },
      data: { status: 'overdue', overdueDay0SentAt: new Date() },
    }),
    prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: 'overdue' },
    }),
  ])

  await sendNotification(
    client.id,
    'Pagamento em atraso',
    `Identificamos um pagamento em atraso do plano ${subscription.plan.name}. Regularize para manter seu site no ar.`,
    'painel',
    'payment-overdue',
  )

  // Envia e-mail de dia 0 (tom gentil)
  if (client.email) {
    await sendOverdueDay0(client.email, client.name, null)
  }

  return {
    ok: true,
    message: `Assinatura de ${client.name} marcada como inadimplente.`,
  }
}

// ── Verificação periódica de inadimplência (chamada no carregamento do admin) ──

export async function checkOverdueSubscriptions(): Promise<void> {
  const now = new Date()
  const DAY_MS = 24 * 60 * 60 * 1000

  const overdueInvoices = await prisma.invoice.findMany({
    where: { status: 'overdue' },
    include: {
      subscription: {
        include: {
          client: { select: { id: true, name: true, email: true } },
        },
      },
    },
  })

  for (const invoice of overdueInvoices) {
    const { client } = invoice.subscription
    const daysSinceDue = Math.floor((now.getTime() - invoice.dueDate.getTime()) / DAY_MS)

    // Dia 5
    if (daysSinceDue >= 5 && !invoice.overdueDay5SentAt) {
      if (client.email) await sendOverdueDay5(client.email, client.name, null)
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: { overdueDay5SentAt: now },
      })
    }

    // Dia 10
    if (daysSinceDue >= 10 && !invoice.overdueDay10SentAt) {
      if (client.email) await sendOverdueDay10(client.email, client.name, null)
      await sendNotification(
        null,
        `Despublicar site de ${client.name} — 10 dias de atraso`,
        `Cliente ${client.name} está com a fatura em atraso há ${daysSinceDue} dias. Despublique o site e marque o status como "suspenso".`,
      )
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: { overdueDay10SentAt: now },
      })
    }
  }
}

// Consulta o Asaas para confirmar o pagamento de uma Order (upsell/avulso).
export async function syncOrderPayment(clientId: string): Promise<boolean> {
  if (process.env.PAYMENT_DRIVER !== 'asaas') return false

  const order = await prisma.order.findFirst({
    where: { clientId, status: 'pending' },
    select: { asaasChargeId: true },
    orderBy: { createdAt: 'desc' },
  })
  if (!order?.asaasChargeId) return false

  try {
    const payment = await asaasFetch<AsaasPaymentStatus>(`/payments/${order.asaasChargeId}`)
    if (!['RECEIVED', 'CONFIRMED', 'RECEIVED_IN_CASH'].includes(payment.status)) return false
    const result = await handlePaymentReceived(payment.id)
    return result.ok
  } catch {
    return false
  }
}

// Consulta o Asaas diretamente e confirma o pagamento se já foi aprovado.
// Chamado quando o cliente retorna ao painel após o checkout.
export async function syncSubscriptionPayment(clientId: string): Promise<boolean> {
  if (process.env.PAYMENT_DRIVER !== 'asaas') return false

  const subscription = await prisma.subscription.findFirst({
    where: { clientId, status: 'pending' },
    select: { id: true, asaasSubscriptionId: true },
  })
  if (!subscription?.asaasSubscriptionId) return false

  try {
    const list = await asaasFetch<AsaasPaymentList>(
      `/subscriptions/${subscription.asaasSubscriptionId}/payments?limit=5&offset=0`,
    )
    const paid = list.data.find((p) =>
      ['RECEIVED', 'CONFIRMED', 'RECEIVED_IN_CASH'].includes(p.status),
    )
    if (!paid) return false

    const result = await handlePaymentReceived(paid.id)
    return result.ok
  } catch {
    return false
  }
}
