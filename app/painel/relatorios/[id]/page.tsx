import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ReportDetailClient } from '../_components/ReportDetailClient'

export default async function ReportDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'client') redirect('/login')

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { clientId: true },
  })
  if (!user?.clientId) redirect('/painel')

  const report = await prisma.siteReport.findFirst({
    where: { id: params.id, clientId: user.clientId },
    include: { site: { select: { siteUrl: true, siteType: true } } },
  })
  if (!report) notFound()

  // Mark as viewed
  if (!report.viewedAt) {
    await prisma.siteReport.update({
      where: { id: report.id },
      data: { viewedAt: new Date() },
    })
  }

  return (
    <ReportDetailClient
      report={{
        id: report.id,
        siteUrl: report.site.siteUrl ?? null,
        periodStart: report.periodStart.toISOString(),
        periodEnd: report.periodEnd.toISOString(),
        generatedAt: report.generatedAt.toISOString(),
        data: report.data as Record<string, unknown>,
      }}
      whatsappNumber={process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? ''}
    />
  )
}
