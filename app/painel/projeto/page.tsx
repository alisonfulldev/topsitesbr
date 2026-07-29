import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ProjetoPageView } from './_components/ProjetoPageView'

export default async function ProjetoPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'client') redirect('/login')

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { clientId: true },
  })
  if (!user?.clientId) redirect('/painel')

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
    },
    orderBy: { createdAt: 'desc' },
  })

  if (!proposal) redirect('/painel')

  return (
    <ProjetoPageView
      proposal={{
        ...proposal,
        status: proposal.status as 'aprovada' | 'paga' | 'em_desenvolvimento' | 'pronto_revisao' | 'publicado',
      }}
    />
  )
}
