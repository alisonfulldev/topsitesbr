import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { CheckoutForm } from './_components/CheckoutForm'

export const dynamic = 'force-dynamic'

export default async function CheckoutPage({
  params,
  searchParams,
}: {
  params: { token: string }
  searchParams: { email?: string }
}) {
  const email = searchParams.email?.trim() ?? ''

  const proposal = await prisma.presentationProposal.findUnique({
    where: { token: params.token },
    select: {
      token: true,
      clientName: true,
      value: true,
      scope: true,
      mode: true,
      approvedAt: true,
      openedAt: true,
      expiresAt: true,
      leads: { where: { email }, select: { id: true } },
    },
  })

  if (!proposal) notFound()
  if (proposal.mode !== 'completa') redirect(`/p/${params.token}`)
  if (proposal.approvedAt) redirect(`/p/${params.token}/confirmado`)

  const now = new Date()
  if (proposal.expiresAt && proposal.expiresAt < now) {
    redirect(`/p/${params.token}`)
  }

  if (!email || proposal.leads.length === 0) {
    redirect(`/p/${params.token}`)
  }

  return (
    <CheckoutForm
      token={proposal.token}
      clientName={proposal.clientName}
      value={Number(proposal.value)}
      email={email}
    />
  )
}
