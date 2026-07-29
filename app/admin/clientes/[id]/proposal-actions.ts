'use server'

import { prisma } from '@/lib/prisma'
import { generateRawToken, hashToken } from '@/lib/proposal-token'
import { sendProposalEmail } from '@/lib/emails/proposal'
import { APP_URL } from '@/lib/config'
import { revalidatePath } from 'next/cache'

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
  data: { previewUrl?: string; siteId?: string | null },
): Promise<{ error?: string; success?: boolean }> {
  const proposal = await prisma.proposal.findUnique({
    where: { id: proposalId },
    select: { id: true, clientId: true },
  })
  if (!proposal) return { error: 'Proposta não encontrada.' }

  await prisma.proposal.update({
    where: { id: proposalId },
    data: {
      ...(data.previewUrl !== undefined && { previewUrl: data.previewUrl || null }),
      ...(data.siteId !== undefined && { siteId: data.siteId || null }),
    },
  })

  revalidatePath(`/admin/clientes/${proposal.clientId}`)
  return { success: true }
}
