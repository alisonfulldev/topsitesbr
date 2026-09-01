import { prisma } from '@/lib/prisma'
import {
  sendNotification,
  sendOverdueDay0,
  sendOverdueDay5,
  sendOverdueDay10,
  sendPaymentRegularized,
} from '@/lib/notifications'
import {
  sendProposalPaymentConfirmedEmail,
  sendContractCopyToClient,
  sendContractSignedToAdmin,
} from '@/lib/emails/proposal'
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
      return handlePresentationPayment(chargeId)
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

// ── Pagamento de proposta de criação ──────────────────────────────────────────

export async function handleProposalPayment(
  proposalId: string,
  chargeId: string,
): Promise<{ ok: boolean; message: string }> {
  const proposal = await prisma.proposal.findUnique({
    where: { id: proposalId },
    include: {
      client: { select: { id: true, name: true, email: true, phone: true, document: true } },
    },
  })

  if (!proposal) {
    return { ok: false, message: `Proposta não encontrada: ${proposalId}` }
  }

  // Idempotência: já processado
  const TERMINAL = ['paga', 'aguardando_info', 'em_desenvolvimento', 'pronto_revisao', 'publicado']
  if (TERMINAL.includes(proposal.status)) {
    return { ok: true, message: `Proposta ${proposalId} já processada (${proposal.status}).` }
  }

  const client = proposal.client

  // Encontra ou cria produto sistema para criação via proposta
  let product = await prisma.product.findFirst({
    where: { name: 'Criação de Site (Proposta)' },
  })
  if (!product) {
    product = await prisma.product.create({
      data: {
        name: 'Criação de Site (Proposta)',
        price: 0,
        type: 'service',
      },
    })
  }

  // Cria Order com status paid
  const order = await prisma.order.create({
    data: {
      clientId: client.id,
      productId: product.id,
      amount: proposal.creationPrice,
      status: 'paid',
      asaasChargeId: chargeId,
    },
  })

  // Atualiza Proposal: paga, paidAt, asaasChargeId, orderId
  await prisma.proposal.update({
    where: { id: proposalId },
    data: {
      status: 'paga',
      paidAt: new Date(),
      asaasChargeId: chargeId,
      orderId: order.id,
    },
  })

  // Notificação interna para o admin
  await sendNotification(
    null,
    `Proposta paga — iniciar desenvolvimento de ${client.name}`,
    `O cliente ${client.name} pagou a criação do site "${proposal.title}" (R$ ${Number(proposal.creationPrice).toFixed(2).replace('.', ',')}). Inicie o desenvolvimento e atualize o status da proposta no painel.`,
  )

  // E-mail de confirmação ao cliente
  await sendProposalPaymentConfirmedEmail({
    to: client.email,
    clientName: client.name,
  })

  // E-mails do contrato — somente para clientes que de fato pagaram
  if (proposal.contractAcceptedAt) {
    sendContractCopyToClient({
      to: client.email,
      clientName: client.name,
      proposalTitle: proposal.title,
      creationPrice: Number(proposal.creationPrice),
      acceptedAt: proposal.contractAcceptedAt,
    }).catch(() => {})

    sendContractSignedToAdmin({
      clientName: client.name,
      clientEmail: client.email,
      clientPhone: client.phone,
      clientDocument: client.document,
      proposalTitle: proposal.title,
      creationPrice: Number(proposal.creationPrice),
      acceptedAt: proposal.contractAcceptedAt,
      ip: proposal.contractAcceptedIp,
    }).catch(() => {})
  }

  // Aguarda cliente preencher as informações do site
  await prisma.proposal.update({
    where: { id: proposalId },
    data: { status: 'aguardando_info' },
  })

  return {
    ok: true,
    message: `Proposta de ${client.name} paga. Status: aguardando_info.`,
  }
}

// Consulta o Asaas para confirmar o pagamento de uma proposta.
// Chamado quando o cliente acessa /painel/projeto com status "aprovada".
export async function syncProposalPayment(clientId: string): Promise<boolean> {
  if (process.env.PAYMENT_DRIVER !== 'asaas') return false

  const proposal = await prisma.proposal.findFirst({
    where: { clientId, status: 'aprovada', asaasChargeId: { not: null } },
    select: { id: true, asaasChargeId: true },
  })
  if (!proposal?.asaasChargeId) return false

  try {
    const payment = await asaasFetch<AsaasPaymentStatus>(`/payments/${proposal.asaasChargeId}`)
    if (!['RECEIVED', 'CONFIRMED', 'RECEIVED_IN_CASH'].includes(payment.status)) return false
    const result = await handleProposalPayment(proposal.id, payment.id)
    return result.ok
  } catch {
    return false
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

// ── Pagamento de apresentação de templates ────────────────────────────────────

async function handlePresentationPayment(chargeId: string): Promise<{ ok: boolean; message: string }> {
  const presentation = await prisma.templatePresentation.findFirst({
    where: { asaasChargeId: chargeId },
  })

  if (!presentation) {
    return { ok: false, message: `Cobrança não encontrada: ${chargeId}` }
  }

  if (presentation.status === 'pago') {
    return { ok: true, message: `Apresentação de ${presentation.leadName} já processada.` }
  }

  await prisma.templatePresentation.update({
    where: { id: presentation.id },
    data: { status: 'pago', paidAt: new Date() },
  })

  const planLabels: Record<string, string> = {
    plano1: 'Site (R$97 — arquivos)',
    plano2: 'Essencial (R$97 + R$19/mês)',
    plano3: 'Completo (R$188 + R$19/mês)',
  }
  const planLabel = presentation.planChosen ? (planLabels[presentation.planChosen] ?? presentation.planChosen) : 'desconhecido'

  const subdomainInfo = presentation.subdomain ? ` Subdomínio: ${presentation.subdomain}.` : ''

  await sendNotification(
    null,
    `Apresentação paga — ${presentation.leadName}`,
    `O lead ${presentation.leadName} pagou o plano "${planLabel}" via apresentação de templates.${subdomainInfo} Suba os arquivos e ative o site.`,
  )

  // Para planos 2 e 3: cria assinatura recorrente de R$19/mês
  if (
    (presentation.planChosen === 'plano2' || presentation.planChosen === 'plano3') &&
    presentation.asaasCustomerId
  ) {
    if (process.env.PAYMENT_DRIVER !== 'asaas') {
      console.log(`[MOCK] Assinatura R$19/mês criada para apresentação de ${presentation.leadName}`)
    } else {
      try {
        const today = new Date()
        const nextDue = new Date(today)
        nextDue.setDate(today.getDate() + 30)
        const yyyy = nextDue.getFullYear()
        const mm = String(nextDue.getMonth() + 1).padStart(2, '0')
        const dd = String(nextDue.getDate()).padStart(2, '0')

        const sub = await asaasFetch<{ id: string }>('/subscriptions', {
          method: 'POST',
          body: JSON.stringify({
            customer: presentation.asaasCustomerId,
            billingType: 'UNDEFINED',
            value: 19,
            nextDueDate: `${yyyy}-${mm}-${dd}`,
            cycle: 'MONTHLY',
            description: `Site no Ar — ${presentation.leadName}`,
          }),
        })

        await prisma.templatePresentation.update({
          where: { id: presentation.id },
          data: { asaasSubscriptionId: sub.id },
        })
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err)
        await sendNotification(
          null,
          `Erro ao criar assinatura — ${presentation.leadName}`,
          `Pagamento confirmado, mas a assinatura R$19/mês não foi criada automaticamente. Erro: ${errMsg}. Crie manualmente no Asaas (customerId: ${presentation.asaasCustomerId}).`,
        )
      }
    }
  }

  return {
    ok: true,
    message: `Apresentação de ${presentation.leadName} — pagamento confirmado (${planLabel}).`,
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
