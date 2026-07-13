import { prisma } from '@/lib/prisma'
import { sendNotification } from '@/lib/notifications'

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
    message: `Pagamento confirmado para ${client.name}${isFirstPayment ? ' (primeiro pagamento)' : ''}.`,
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
          client: { select: { id: true, name: true } },
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
      data: { status: 'overdue' },
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

  return {
    ok: true,
    message: `Assinatura de ${client.name} marcada como inadimplente.`,
  }
}
