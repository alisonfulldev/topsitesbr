'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendNotification } from '@/lib/notifications'
import { revalidatePath } from 'next/cache'

export async function approveSiteAction(
  proposalId: string,
): Promise<{ error?: string; success?: boolean }> {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'client') return { error: 'Não autorizado.' }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { clientId: true },
  })
  if (!user?.clientId) return { error: 'Usuário sem cliente vinculado.' }

  const proposal = await prisma.proposal.findUnique({
    where: { id: proposalId },
    include: { client: { select: { id: true, name: true } } },
  })
  if (!proposal || proposal.clientId !== user.clientId) {
    return { error: 'Proposta não encontrada.' }
  }
  if (proposal.status !== 'pronto_revisao') {
    return { error: 'Esta proposta não está em revisão.' }
  }

  await prisma.proposal.update({
    where: { id: proposalId },
    data: { siteApprovedAt: new Date() },
  })

  await sendNotification(
    null,
    `Site aprovado pelo cliente — ${proposal.client.name}`,
    `O cliente ${proposal.client.name} aprovou o site da proposta "${proposal.title}". Publique o site e atualize o status para "publicado" no painel.`,
  )

  revalidatePath('/painel/projeto')
  return { success: true }
}

export async function submitBriefingAction(
  proposalId: string,
  data: Record<string, unknown>,
): Promise<{ error?: string; success?: boolean }> {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'client') return { error: 'Não autorizado.' }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { clientId: true },
  })
  if (!user?.clientId) return { error: 'Usuário sem cliente vinculado.' }

  const proposal = await prisma.proposal.findUnique({
    where: { id: proposalId },
    include: {
      client: { select: { id: true, name: true, email: true } },
      briefing: true,
    },
  })
  if (!proposal || proposal.clientId !== user.clientId) return { error: 'Proposta não encontrada.' }
  if (proposal.status !== 'aguardando_info') return { error: 'Esta proposta não está aguardando informações.' }
  if (proposal.briefing) return { error: 'Informações já enviadas.' }

  await prisma.$transaction([
    prisma.briefing.create({
      data: {
        proposalId,
        data: data as object,
        submittedAt: new Date(),
      },
    }),
    prisma.proposal.update({
      where: { id: proposalId },
      data: { status: 'em_desenvolvimento' },
    }),
  ])

  // Notify admin
  await sendNotification(
    null,
    `Informações do site recebidas — ${proposal.client.name}`,
    `O cliente ${proposal.client.name} enviou as informações do site para o projeto "${proposal.title}". Acesse a ficha do cliente para ver os detalhes e iniciar o desenvolvimento.`,
  )

  // Email to admin (fire and forget)
  const { sendBriefingToAdmin } = await import('@/lib/emails/proposal')
  sendBriefingToAdmin({
    clientName: proposal.client.name,
    proposalTitle: proposal.title,
    briefingData: data as Record<string, unknown>,
  }).catch(() => {})

  revalidatePath('/painel/projeto')
  return { success: true }
}

export async function requestRevisionAction(
  proposalId: string,
  notes: string,
): Promise<{ error?: string; success?: boolean }> {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'client') return { error: 'Não autorizado.' }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { clientId: true },
  })
  if (!user?.clientId) return { error: 'Usuário sem cliente vinculado.' }

  const proposal = await prisma.proposal.findUnique({
    where: { id: proposalId },
    include: { client: { select: { id: true, name: true } } },
  })
  if (!proposal || proposal.clientId !== user.clientId) {
    return { error: 'Proposta não encontrada.' }
  }
  if (proposal.status !== 'pronto_revisao') {
    return { error: 'Esta proposta não está em revisão.' }
  }
  if (proposal.revisionUsed) {
    return { error: 'Você já utilizou sua revisão nesta proposta.' }
  }

  await prisma.proposal.update({
    where: { id: proposalId },
    data: { revisionUsed: true, revisionNotes: notes.trim() || null },
  })

  await sendNotification(
    null,
    `Revisão solicitada — ${proposal.client.name}`,
    `O cliente ${proposal.client.name} solicitou ajustes no site da proposta "${proposal.title}".\n\nObservações: ${notes.trim() || 'Nenhuma observação adicionada.'}`,
  )

  revalidatePath('/painel/projeto')
  return { success: true }
}
