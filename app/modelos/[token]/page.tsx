import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import LeadPage from './_components/LeadPage'

export default async function ModelosTokenPage({ params }: { params: { token: string } }) {
  const [p, t1, t2] = await Promise.all([
    prisma.templatePresentation.findUnique({
      where: { token: params.token },
      select: { token: true, leadName: true, template1Name: true, template2Name: true, status: true },
    }),
    prisma.systemTemplate.findUnique({ where: { slot: 1 }, select: { name: true } }),
    prisma.systemTemplate.findUnique({ where: { slot: 2 }, select: { name: true } }),
  ])

  if (!p || p.status === 'cancelado') notFound()

  return (
    <LeadPage
      token={p.token}
      leadName={p.leadName}
      template1Name={t1?.name ?? p.template1Name ?? 'Modelo 1'}
      template2Name={t2?.name ?? p.template2Name ?? 'Modelo 2'}
      alreadyPaid={p.status === 'pago'}
    />
  )
}
