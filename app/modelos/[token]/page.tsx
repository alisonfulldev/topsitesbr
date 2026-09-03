import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getTermsSnapshot } from '@/lib/terms-content'
import LeadPage from './_components/LeadPage'

export default async function ModelosTokenPage({ params }: { params: { token: string } }) {
  const p = await prisma.templatePresentation.findUnique({
    where: { token: params.token },
    select: { token: true, leadName: true, template1Name: true, template2Name: true, status: true },
  })

  if (!p || p.status === 'cancelado') notFound()

  const contractHtml = getTermsSnapshot('apresentacao-1.0')

  return (
    <LeadPage
      token={p.token}
      leadName={p.leadName}
      template1Name={p.template1Name ?? 'Modelo 1'}
      template2Name={p.template2Name ?? 'Modelo 2'}
      alreadyPaid={p.status === 'pago'}
      contractHtml={contractHtml}
    />
  )
}
