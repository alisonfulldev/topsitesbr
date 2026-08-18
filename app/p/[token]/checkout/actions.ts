'use server'

import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/password'
import { getPaymentProvider } from '@/lib/payments/provider'
import { sendNotification } from '@/lib/notifications'
import { generateReferralCode } from '@/lib/referral'
import { validateCpf } from '@/lib/cpf'
import { CONTRACT_VERSION } from '@/lib/emails/proposal'
import { APP_URL } from '@/lib/config'

export async function initiateCheckoutAction(
  token: string,
  email: string,
  password: string,
  document: string,
  contractAccepted: boolean,
): Promise<{ error?: string; paymentUrl?: string }> {
  if (!contractAccepted) {
    return { error: 'Você precisa aceitar o contrato antes de prosseguir.' }
  }
  if (password.length < 8) {
    return { error: 'A senha deve ter no mínimo 8 caracteres.' }
  }
  const cpfClean = document.replace(/\D/g, '')
  if (!validateCpf(cpfClean)) {
    return { error: 'CPF inválido. Verifique o número informado.' }
  }

  const presentationProposal = await prisma.presentationProposal.findUnique({
    where: { token },
    include: { leads: { where: { email } } },
  })

  if (!presentationProposal) return { error: 'Proposta não encontrada.' }
  if (presentationProposal.mode !== 'completa') return { error: 'Esta proposta não possui checkout direto.' }
  if (presentationProposal.approvedAt) return { error: 'Esta proposta já foi contratada.' }

  const now = new Date()
  if (presentationProposal.expiresAt && presentationProposal.expiresAt < now) {
    return { error: 'Esta proposta está expirada. Entre em contato pelo WhatsApp para uma nova proposta.' }
  }
  if (presentationProposal.leads.length === 0) {
    return { error: 'E-mail não encontrado nesta proposta.' }
  }

  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) {
    return { error: 'Já existe uma conta com este e-mail. Faça login em /login.' }
  }

  const hdrs = headers()
  const rawIp = hdrs.get('x-forwarded-for') ?? hdrs.get('x-real-ip') ?? null
  const clientIp = rawIp ? rawIp.split(',')[0].trim() : null
  const acceptedAt = now

  let clientId: string | null = null
  let userId: string | null = null
  let proposalId: string | null = null

  try {
    const result = await prisma.$transaction(async (tx) => {
      const client = await tx.client.create({
        data: {
          name: presentationProposal.clientName,
          email,
          document: cpfClean,
          referralCode: generateReferralCode(presentationProposal.clientName),
          entryFlow: 'proposta',
          termsAcceptedAt: acceptedAt,
          termsVersion: CONTRACT_VERSION,
        },
      })

      const passwordHash = await hashPassword(password)
      const user = await tx.user.create({
        data: {
          clientId: client.id,
          name: presentationProposal.clientName,
          email,
          passwordHash,
          role: 'client',
        },
      })

      const proposal = await tx.proposal.create({
        data: {
          clientId: client.id,
          title: 'Site Personalizado',
          creationPrice: presentationProposal.value,
          status: 'aprovada',
          approvedAt: acceptedAt,
          contractAcceptedAt: acceptedAt,
          contractVersion: CONTRACT_VERSION,
          contractAcceptedIp: clientIp,
        },
      })

      return { client, user, proposal }
    })

    clientId = result.client.id
    userId = result.user.id
    proposalId = result.proposal.id

    const provider = getPaymentProvider()

    let asaasCustomerId: string
    try {
      const { customerId } = await provider.createCustomer({
        name: presentationProposal.clientName,
        email,
        document: cpfClean,
        phone: undefined,
      })
      asaasCustomerId = customerId
      await prisma.client.update({
        where: { id: clientId },
        data: { asaasCustomerId: customerId },
      })
    } catch (err) {
      throw new Error(`Asaas customer: ${err instanceof Error ? err.message : String(err)}`)
    }

    let chargeId: string
    let paymentUrl: string
    try {
      const result = await provider.createSingleCharge({
        customerId: asaasCustomerId,
        description: `Site Personalizado — ${presentationProposal.clientName}`,
        price: Number(presentationProposal.value),
        externalReference: `proposal:${proposalId}`,
        successUrl: `${APP_URL}/p/${token}/confirmado`,
      })
      chargeId = result.chargeId
      paymentUrl = result.paymentUrl
    } catch (err) {
      throw new Error(`Asaas charge: ${err instanceof Error ? err.message : String(err)}`)
    }

    await prisma.$transaction([
      prisma.proposal.update({
        where: { id: proposalId },
        data: { asaasChargeId: chargeId, paymentUrl },
      }),
      prisma.presentationProposal.update({
        where: { token },
        data: { approvedAt: acceptedAt, linkedProposalId: proposalId },
      }),
    ])

    await sendNotification(
      null,
      `Checkout LP — ${presentationProposal.clientName}`,
      `${presentationProposal.clientName} (${email}) contratou via proposta LP. Asaas: aguardando pagamento de R$ ${Number(presentationProposal.value).toFixed(2).replace('.', ',')}.`,
    ).catch(() => {})

    return { paymentUrl }
  } catch (err) {
    // Cleanup in reverse order on Asaas failure (DB records already created)
    if (proposalId) await prisma.proposal.delete({ where: { id: proposalId } }).catch(() => {})
    if (userId) await prisma.user.delete({ where: { id: userId } }).catch(() => {})
    if (clientId) await prisma.client.delete({ where: { id: clientId } }).catch(() => {})

    const msg = err instanceof Error ? err.message : String(err)
    console.error('[checkout-lp] initiateCheckout failed', msg)
    return { error: `Não foi possível processar o checkout. Tente novamente ou fale conosco pelo WhatsApp.` }
  }
}
