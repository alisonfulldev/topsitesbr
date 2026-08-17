import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { syncProposalPayment } from '@/lib/payments/webhook-handlers'
import { ProjetoPageView } from './_components/ProjetoPageView'

export default async function ProjetoPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const { resolveClientId } = await import('@/lib/impersonation')
  const ctx = await resolveClientId(session)
  if (!ctx) redirect('/painel')
  const clientId = ctx.clientId

  // Tenta confirmar pagamento direto no Asaas se webhook não chegou
  await syncProposalPayment(clientId)

  const [proposal, client] = await Promise.all([
    prisma.proposal.findFirst({
      where: {
        clientId,
        status: { in: ['aprovada', 'paga', 'aguardando_info', 'em_desenvolvimento', 'pronto_revisao', 'publicado'] },
      },
      select: {
        id: true,
        title: true,
        status: true,
        previewUrl: true,
        revisionUsed: true,
        siteApprovedAt: true,
        paidAt: true,
        contractAcceptedAt: true,
        contractVersion: true,
        briefing: {
          select: {
            data: true,
            submittedAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.client.findUnique({
      where: { id: clientId },
      select: { name: true },
    }),
  ])

  if (!proposal) redirect('/painel')

  return (
    <ProjetoPageView
      proposal={{
        ...proposal,
        status: proposal.status as 'aprovada' | 'paga' | 'aguardando_info' | 'em_desenvolvimento' | 'pronto_revisao' | 'publicado',
        contractAcceptedAt: proposal.contractAcceptedAt,
        contractVersion: proposal.contractVersion,
        briefing: proposal.briefing ? {
          data: proposal.briefing.data as Record<string, unknown>,
          submittedAt: proposal.briefing.submittedAt,
        } : null,
      }}
      clientName={client?.name ?? undefined}
    />
  )
}
