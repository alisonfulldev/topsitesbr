import { prisma } from '@/lib/prisma'

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
    return { ok: false, message: `Fatura não encontrada para chargeId: ${chargeId}` }
  }

  const { subscription } = invoice
  const { client } = subscription
  const isFirstPayment = subscription.invoices.length === 0

  await prisma.$transaction(async (tx) => {
    // Mark invoice as paid
    await tx.invoice.update({
      where: { id: invoice.id },
      data: { status: 'paid', paidAt: new Date() },
    })

    // Ensure subscription is active (may have been overdue)
    await tx.subscription.update({
      where: { id: subscription.id },
      data: { status: 'active' },
    })

    // Notify client: payment confirmed
    await tx.notification.create({
      data: {
        clientId: client.id,
        title: 'Pagamento confirmado',
        message: `Seu pagamento do plano ${subscription.plan.name} foi confirmado. Obrigado!`,
        channel: 'painel',
      },
    })

    if (isFirstPayment) {
      // Notify admin if client has a pending site to publish
      const hasPendingSite = client.sites.some((s) => s.status === 'pendente_ativacao')
      if (hasPendingSite) {
        await tx.notification.create({
          data: {
            clientId: null,
            title: `Publicar site de ${client.name}`,
            message: `Cliente ${client.name} ativou o plano. Suba o site no GitHub Pages e atualize o status para "online".`,
            channel: 'painel',
          },
        })
      }

      // Notify admin if this client was referred and referral is pending reward
      const referral = client.referralReceived
      if (referral && referral.status === 'confirmado') {
        await tx.notification.create({
          data: {
            clientId: null,
            title: 'Indicação: aplicar 1 mês grátis',
            message: `Cliente ${client.name}, indicado por ${referral.referrerClient.name}, ativou o plano. Aplique 1 mês grátis para ${referral.referrerClient.name} no Asaas e marque a indicação como recompensada.`,
            channel: 'painel',
          },
        })
      }
    }
  })

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
    prisma.notification.create({
      data: {
        clientId: client.id,
        title: 'Pagamento em atraso',
        message: `Identificamos um pagamento em atraso do plano ${subscription.plan.name}. Regularize para manter seu site no ar.`,
        channel: 'painel',
      },
    }),
  ])

  return {
    ok: true,
    message: `Assinatura de ${client.name} marcada como inadimplente.`,
  }
}
