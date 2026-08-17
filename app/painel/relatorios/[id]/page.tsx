import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ReportDetailClient } from '../_components/ReportDetailClient'

export default async function ReportDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const { resolveClientId } = await import('@/lib/impersonation')
  const ctx = await resolveClientId(session)
  if (!ctx) redirect('/painel')
  const clientId = ctx.clientId

  const report = await prisma.siteReport.findFirst({
    where: { id: params.id, clientId },
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
