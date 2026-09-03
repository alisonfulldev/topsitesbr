import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getTermsSnapshot } from '@/lib/terms-content'
import LeadPage from './_components/LeadPage'

export default async function ModelosTokenPage({ params }: { params: { token: string } }) {
  const p = await prisma.templatePresentation.findUnique({
    where: { token: params.token },
    select: { token: true, leadName: true, leadPersonName: true, template1Name: true, template2Name: true, status: true },
  })

  if (!p || p.status === 'cancelado') notFound()

  const contractName = p.leadPersonName?.trim() || p.leadName.trim()
  const contractHtml = getTermsSnapshot('apresentacao-1.0').replace('{{NOME}}', contractName)

  return (
    <LeadPage
      token={p.token}
      leadName={p.leadName}
      leadPersonName={p.leadPersonName ?? null}
      template1Name={p.template1Name ?? 'Modelo 1'}
      template2Name={p.template2Name ?? 'Modelo 2'}
      alreadyPaid={p.status === 'pago'}
      contractHtml={contractHtml}
    />
  )
}
