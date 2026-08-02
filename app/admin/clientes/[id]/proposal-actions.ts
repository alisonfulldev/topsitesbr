'use server'

import { prisma } from '@/lib/prisma'
import { generateRawToken, hashToken } from '@/lib/proposal-token'
import { sendProposalEmail, sendProposalStatusEmail } from '@/lib/emails/proposal'
import { APP_URL } from '@/lib/config'
import { revalidatePath } from 'next/cache'
import { sendNotification } from '@/lib/notifications'
import { asaasFetch } from '@/lib/integrations/asaas'

export async function generateProposalMagicLink(
  proposalId: string,
): Promise<{ url: string } | { error: string }> {
  const proposal = await prisma.proposal.findUnique({
    where: { id: proposalId },
    include: { client: { select: { id: true } } },
  })
  if (!proposal) return { error: 'Proposta não encontrada.' }

  const rawToken = generateRawToken()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 30)
  await prisma.proposalAccessToken.create({
    data: {
      proposalId: proposal.id,
      clientId: proposal.client.id,
      tokenHash: hashToken(rawToken),
      expiresAt,
      purpose: 'view',
    },
  })

  return { url: `${APP_URL}/proposta/${rawToken}` }
}

export async function resendProposalEmail(
  proposalId: string,
): Promise<{ error?: string; success?: boolean }> {
  const proposal = await prisma.proposal.findUnique({
    where: { id: proposalId },
    include: { client: { select: { id: true, email: true, name: true } } },
  })
  if (!proposal) return { error: 'Proposta não encontrada.' }

  const rawToken = generateRawToken()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 30)
  await prisma.proposalAccessToken.create({
    data: {
      proposalId: proposal.id,
      clientId: proposal.client.id,
      tokenHash: hashToken(rawToken),
      expiresAt,
      purpose: 'view',
    },
  })

  await sendProposalEmail({
    to: proposal.client.email,
    clientName: proposal.client.name,
    proposalTitle: proposal.title,
    magicLink: `${APP_URL}/proposta/${rawToken}`,
  })

  return { success: true }
}

export async function updateProposalAdmin(
  proposalId: string,
  data: { previewUrl?: string; siteId?: string | null; creationPrice?: number },
): Promise<{ error?: string; success?: boolean }> {
  const proposal = await prisma.proposal.findUnique({
    where: { id: proposalId },
    select: { id: true, clientId: true },
  })
  if (!proposal) return { error: 'Proposta não encontrada.' }

  if (data.creationPrice !== undefined && (isNaN(data.creationPrice) || data.creationPrice < 5)) {
    return { error: 'O valor mínimo para cobrança é R$ 5,00.' }
  }

  await prisma.proposal.update({
    where: { id: proposalId },
    data: {
      ...(data.previewUrl !== undefined && { previewUrl: data.previewUrl || null }),
      ...(data.siteId !== undefined && { siteId: data.siteId || null }),
      ...(data.creationPrice !== undefined && { creationPrice: data.creationPrice }),
    },
  })

  revalidatePath(`/admin/clientes/${proposal.clientId}`)
  return { success: true }
}

export async function resetProposalCharge(
  proposalId: string,
): Promise<{ error?: string; success?: boolean }> {
  const proposal = await prisma.proposal.findUnique({
    where: { id: proposalId },
    select: { id: true, clientId: true, status: true, asaasChargeId: true },
  })
  if (!proposal) return { error: 'Proposta não encontrada.' }
  if (proposal.status !== 'aprovada') {
    return { error: 'Só é possível recriar a cobrança quando a proposta está com status "aprovada".' }
  }

  // Cancela a cobrança no Asaas (ignora erros — pode já ter sido cancelada)
  if (proposal.asaasChargeId && process.env.PAYMENT_DRIVER === 'asaas') {
    try {
      await asaasFetch(`/payments/${proposal.asaasChargeId}`, { method: 'DELETE' })
    } catch {
      // Ignorado: cobrança pode não existir mais no Asaas
    }
  }

  // Limpa a cobrança e volta para "enviada" para o cliente poder aprovar novamente
  await prisma.proposal.update({
    where: { id: proposalId },
    data: {
      status: 'enviada',
      asaasChargeId: null,
      paymentUrl: null,
      approvedAt: null,
    },
  })

  revalidatePath(`/admin/clientes/${proposal.clientId}`)
  return { success: true }
}

type TransitionTarget = 'aguardando_info' | 'em_desenvolvimento' | 'pronto_revisao' | 'publicado'

export async function transitionProposalStatus(
  proposalId: string,
  newStatus: TransitionTarget,
): Promise<{ error?: string; success?: boolean }> {
  const proposal = await prisma.proposal.findUnique({
    where: { id: proposalId },
    include: {
      client: { select: { id: true, name: true, email: true } },
      site: { select: { id: true } },
    },
  })
  if (!proposal) return { error: 'Proposta não encontrada.' }

  const { status, previewUrl, siteId, client } = proposal

  // Validate transitions
  if (newStatus === 'em_desenvolvimento' && status !== 'paga' && status !== 'aguardando_info') {
    return { error: 'Só é possível iniciar desenvolvimento quando a proposta está paga ou aguardando informações.' }
  }
  if (newStatus === 'pronto_revisao' && status !== 'em_desenvolvimento') {
    return { error: 'Só é possível marcar como pronto para revisão quando está em desenvolvimento.' }
  }
  if (newStatus === 'pronto_revisao' && !previewUrl) {
    return { error: 'Informe a URL de preview antes de marcar como pronto para revisão.' }
  }
  if (newStatus === 'publicado' && status !== 'pronto_revisao') {
    return { error: 'Só é possível publicar quando está em revisão.' }
  }
  if (newStatus === 'publicado' && !siteId) {
    return { error: 'Vincule um site à proposta antes de publicar.' }
  }

  await prisma.proposal.update({
    where: { id: proposalId },
    data: { status: newStatus },
  })

  // When publishing: set site status to online
  if (newStatus === 'publicado' && siteId) {
    await prisma.site.update({
      where: { id: siteId },
      data: { status: 'online', publishedAt: new Date() },
    })
    await sendNotification(
      client.id,
      'Seu site está no ar!',
      'Seu site foi publicado com sucesso. Acesse o painel para acompanhar os relatórios.',
      'painel',
      'site-status',
    )
  }

  // Send status email to client
  if (newStatus === 'em_desenvolvimento' || newStatus === 'pronto_revisao') {
    await sendProposalStatusEmail({
      to: client.email,
      clientName: client.name,
      status: newStatus,
    }).catch(() => {})
  }

  revalidatePath(`/admin/clientes/${client.id}`)
  return { success: true }
}
