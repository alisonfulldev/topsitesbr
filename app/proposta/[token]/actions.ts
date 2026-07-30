'use server'

import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { hashToken } from '@/lib/proposal-token'
import { hashPassword } from '@/lib/password'
import { getPaymentProvider } from '@/lib/payments/provider'
import { sendNotification } from '@/lib/notifications'
import { CONTRACT_VERSION } from '@/lib/emails/proposal'
import { APP_URL } from '@/lib/config'

export async function approveProposalAction(
  token: string,
  password: string,
  contractAccepted: boolean,
): Promise<{ error?: string; paymentUrl?: string }> {
  if (!contractAccepted) {
    return { error: 'Você precisa ler e aceitar o contrato antes de prosseguir.' }
  }
  if (password.length < 8) {
    return { error: 'A senha deve ter no mínimo 8 caracteres.' }
  }

  const tokenHash = hashToken(token)
  const accessToken = await prisma.proposalAccessToken.findUnique({
    where: { tokenHash },
    include: {
      proposal: {
        include: { client: true },
      },
    },
  })

  if (!accessToken || accessToken.expiresAt < new Date()) {
    return { error: 'Link expirado ou inválido.' }
  }

  const proposal = accessToken.proposal
  const client = proposal.client

  // Cliente já aprovou e gerou cobrança — retorna o link existente sem duplicar
  if (proposal.status === 'aprovada' && proposal.paymentUrl) {
    return { paymentUrl: proposal.paymentUrl }
  }

  // Status que não permite mais aprovação
  if (proposal.status !== 'enviada' && proposal.status !== 'aprovada') {
    return { error: 'Esta proposta não está mais disponível para aprovação.' }
  }

  // Cria User se ainda não existe
  const existingUser = await prisma.user.findUnique({ where: { email: client.email } })
  if (!existingUser) {
    const passwordHash = await hashPassword(password)
    await prisma.user.create({
      data: {
        clientId: client.id,
        name: client.name,
        email: client.email,
        passwordHash,
        role: 'client',
        mustChangePassword: false,
      },
    })
  }

  // Captura IP do cliente
  const hdrs = headers()
  const rawIp = hdrs.get('x-forwarded-for') ?? hdrs.get('x-real-ip') ?? null
  const clientIp = rawIp ? rawIp.split(',')[0].trim() : null

  const acceptedAt = new Date()

  // Atualiza status e registra aceite do contrato
  await prisma.proposal.update({
    where: { id: proposal.id },
    data: {
      status: 'aprovada',
      approvedAt: acceptedAt,
      contractAcceptedAt: acceptedAt,
      contractVersion: CONTRACT_VERSION,
      contractAcceptedIp: clientIp,
    },
  })

  // Cria ou reutiliza customer no Asaas
  const provider = getPaymentProvider()
  let asaasCustomerId = client.asaasCustomerId
  if (!asaasCustomerId) {
    const { customerId } = await provider.createCustomer({
      name: client.name,
      email: client.email,
      document: client.document,
      phone: client.phone,
    })
    asaasCustomerId = customerId
    await prisma.client.update({
      where: { id: client.id },
      data: { asaasCustomerId: customerId },
    })
  }

  // Asaas exige mínimo de R$ 5,00 para billingType UNDEFINED
  if (Number(proposal.creationPrice) < 5) {
    return { error: 'O valor da proposta é menor que o mínimo aceito pelo sistema de pagamento (R$ 5,00). Peça ao admin para corrigir o valor.' }
  }

  // Cria cobrança avulsa (UNDEFINED = cliente escolhe pix/cartão/boleto)
  let chargeId: string
  let paymentUrl: string
  try {
    const result = await provider.createSingleCharge({
      customerId: asaasCustomerId,
      description: proposal.title,
      price: Number(proposal.creationPrice),
      externalReference: `proposal:${proposal.id}`,
      successUrl: `${APP_URL}/proposta/${token}/confirmado`,
    })
    chargeId = result.chargeId
    paymentUrl = result.paymentUrl
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return { error: `Não foi possível gerar a cobrança: ${msg}` }
  }

  // Salva chargeId, paymentUrl e marca token como usado
  await prisma.$transaction([
    prisma.proposal.update({
      where: { id: proposal.id },
      data: { asaasChargeId: chargeId, paymentUrl },
    }),
    prisma.proposalAccessToken.update({
      where: { id: accessToken.id },
      data: { usedAt: new Date() },
    }),
  ])

  // Notificação interna para o admin
  await sendNotification(
    null,
    `Proposta aprovada — aguardando pagamento de ${client.name}`,
    `O cliente ${client.name} aprovou a proposta "${proposal.title}" (R$ ${Number(proposal.creationPrice).toFixed(2).replace('.', ',')}) e assinou o contrato. Aguardando confirmação do pagamento.`,
  ).catch(() => {})

  return { paymentUrl }
}
