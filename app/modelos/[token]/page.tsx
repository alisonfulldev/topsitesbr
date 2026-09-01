import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import LeadPage from './_components/LeadPage'

export default async function ModelosTokenPage({ params }: { params: { token: string } }) {
  const p = await prisma.templatePresentation.findUnique({
    where: { token: params.token },
    select: {
      token: true,
      leadName: true,
      template1Name: true,
      template2Name: true,
      status: true,
      paidAt: true,
    },
  })

  if (!p || p.status === 'cancelado') notFound()

  return (
    <LeadPage
      token={p.token}
      leadName={p.leadName}
      template1Name={p.template1Name}
      template2Name={p.template2Name}
      alreadyPaid={p.status === 'pago'}
    />
  )
}
