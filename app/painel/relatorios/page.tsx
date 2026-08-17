import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { isClientInProduction } from '@/lib/painel-guard'
import { maybeGenerateReportsForClient } from '@/lib/reports'
import { ReportListClient } from './_components/ReportListClient'

export default async function RelatoriosPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const { resolveClientId } = await import('@/lib/impersonation')
  const ctx = await resolveClientId(session)
  if (!ctx) redirect('/painel')
  const clientId = ctx.clientId

  if (await isClientInProduction(clientId)) {
    redirect('/painel/projeto')
  }

  // Generate new reports if 7 days have passed (non-blocking on first load)
  try {
    await maybeGenerateReportsForClient(clientId)
  } catch {
    // Don't fail page if generation fails
  }

  const now = new Date()
  const archiveThreshold = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)

  // Auto-archive viewed reports older than 3 days
  await prisma.siteReport.updateMany({
    where: {
      clientId,
      viewedAt: { not: null, lt: archiveThreshold },
      archivedAt: null,
    },
    data: { archivedAt: now },
  })

  const allReports = await prisma.siteReport.findMany({
    where: { clientId },
    orderBy: { generatedAt: 'desc' },
    include: { site: { select: { siteUrl: true, siteType: true } } },
  })

  const active = allReports.filter((r) => !r.archivedAt)
  const archived = allReports.filter((r) => r.archivedAt)

  const toClient = (r: typeof allReports[0]) => ({
    id: r.id,
    siteUrl: r.site.siteUrl ?? null,
    siteType: r.site.siteType,
    periodStart: r.periodStart.toISOString(),
    periodEnd: r.periodEnd.toISOString(),
    generatedAt: r.generatedAt.toISOString(),
    viewedAt: r.viewedAt?.toISOString() ?? null,
    data: r.data as Record<string, unknown>,
  })

  return (
    <ReportListClient
      active={active.map(toClient)}
      archived={archived.map(toClient)}
    />
  )
}
