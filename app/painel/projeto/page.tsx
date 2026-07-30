import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { syncProposalPayment } from '@/lib/payments/webhook-handlers'
import { ProjetoPageView } from './_components/ProjetoPageView'

export default async function ProjetoPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'client') redirect('/login')

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { clientId: true },
  })
  if (!user?.clientId) redirect('/painel')

  // Tenta confirmar pagamento direto no Asaas se webhook não chegou
  await syncProposalPayment(user.clientId)

  const proposal = await prisma.proposal.findFirst({
    where: {
      clientId: user.clientId,
      status: { in: ['aprovada', 'paga', 'em_desenvolvimento', 'pronto_revisao', 'publicado'] },
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
    },
    orderBy: { createdAt: 'desc' },
  })

  if (!proposal) redirect('/painel')

  return (
    <ProjetoPageView
      proposal={{
        ...proposal,
        status: proposal.status as 'aprovada' | 'paga' | 'em_desenvolvimento' | 'pronto_revisao' | 'publicado',
        contractAcceptedAt: proposal.contractAcceptedAt,
        contractVersion: proposal.contractVersion,
      }}
    />
  )
}
