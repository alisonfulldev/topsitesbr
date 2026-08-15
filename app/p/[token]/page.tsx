import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ProposalLandingClient } from './_components/ProposalLandingClient'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: { token: string }
}): Promise<Metadata> {
  const proposal = await prisma.presentationProposal.findUnique({
    where: { token: params.token },
    select: { clientName: true },
  })
  if (!proposal) return {}
  return {
    title: `Proposta — ${proposal.clientName} | TOP SITE`,
    robots: { index: false, follow: false },
  }
}

export default async function PresentationProposalPage({
  params,
}: {
  params: { token: string }
}) {
  const proposal = await prisma.presentationProposal.findUnique({
    where: { token: params.token },
    select: { token: true, clientName: true, openedAt: true, expiresAt: true },
  })

  if (!proposal) notFound()

  const now = new Date()
  const isExpired = !!(
    proposal.openedAt &&
    proposal.expiresAt &&
    proposal.expiresAt < now
  )

  return (
    <ProposalLandingClient
      token={proposal.token}
      clientName={proposal.clientName}
      initialStage={isExpired ? 'expired' : 'gate'}
    />
  )
}
