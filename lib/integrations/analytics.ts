import { prisma } from '@/lib/prisma'

export type SiteAnalytics = {
  visits: number
  pageViews: number
  topReferrers: { host: string; count: number }[]
  topPages: { path: string; count: number }[]
  period: string
}

export type AnalyticsResult =
  | { ok: true; data: SiteAnalytics }
  | { ok: false; message: string }

export type WeeklyAnalyticsData = {
  visits: number
  pageViews: number
  avgDailyVisits: number
  changePercent: number | null
  timeSeries: { date: string; pageviews: number; sessions: number }[]
  topReferrers: { host: string; count: number }[]
  topPages: { path: string; count: number }[]
}

export type WeeklyAnalyticsResult =
  | { ok: true; data: WeeklyAnalyticsData }
  | { ok: false; message: string }

function parseReferrers(rows: { referrer: string | null }[]): { host: string; count: number }[] {
  const map: Record<string, number> = {}
  for (const row of rows) {
    if (!row.referrer) continue
    try {
      const host = new URL(row.referrer).hostname.replace(/^www\./, '')
      if (host) map[host] = (map[host] ?? 0) + 1
    } catch {}
  }
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([host, count]) => ({ host, count }))
}

// siteId = the site's own UUID in our database
export async function getSiteAnalytics(
  siteId: string,
  since: string,
  until: string,
): Promise<AnalyticsResult> {
  const start = new Date(since)
  const end = new Date(until + 'T23:59:59.999Z')

  try {
    const [pageViews, sessionGroups, topPagesRaw, topReferrersRaw] = await Promise.all([
      prisma.pageView.count({ where: { siteId, timestamp: { gte: start, lte: end } } }),
      prisma.pageView.groupBy({
        by: ['sessionId'],
        where: { siteId, timestamp: { gte: start, lte: end } },
      }),
      prisma.pageView.groupBy({
        by: ['path'],
        where: { siteId, timestamp: { gte: start, lte: end } },
        _count: { path: true },
        orderBy: { _count: { path: 'desc' } },
        take: 5,
      }),
      prisma.pageView.findMany({
        where: { siteId, timestamp: { gte: start, lte: end }, referrer: { not: null } },
        select: { referrer: true },
      }),
    ])

    const visits = sessionGroups.length

    if (!visits && !pageViews) {
      return { ok: false, message: 'Sem visitas neste período.' }
    }

    const topPages = topPagesRaw.map((p) => ({ path: p.path, count: p._count.path }))
    const topReferrers = parseReferrers(topReferrersRaw)

    const periodLabel = new Date(since + 'T12:00:00').toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric',
    })

    return { ok: true, data: { visits, pageViews, topReferrers, topPages, period: periodLabel } }
  } catch (err) {
    console.error('[getSiteAnalytics]', err)
    return { ok: false, message: 'Erro ao buscar dados.' }
  }
}

export async function getWeeklyAnalytics(
  siteId: string,
  periodStart: Date,
  periodEnd: Date,
): Promise<WeeklyAnalyticsResult> {
  const durationMs = periodEnd.getTime() - periodStart.getTime()
  const prevEnd = new Date(periodStart.getTime() - 1)
  const prevStart = new Date(prevEnd.getTime() - durationMs)

  try {
    const [pageViews, sessions, prevSessions, seriesRaw, topPagesRaw, topReferrersRaw] =
      await Promise.all([
        prisma.pageView.count({ where: { siteId, timestamp: { gte: periodStart, lte: periodEnd } } }),
        prisma.pageView.groupBy({
          by: ['sessionId'],
          where: { siteId, timestamp: { gte: periodStart, lte: periodEnd } },
        }),
        prisma.pageView.groupBy({
          by: ['sessionId'],
          where: { siteId, timestamp: { gte: prevStart, lte: prevEnd } },
        }),
        prisma.$queryRaw<{ date: string; pv: bigint; sv: bigint }[]>`
          SELECT
            TO_CHAR(timestamp AT TIME ZONE 'America/Sao_Paulo', 'YYYY-MM-DD') AS date,
            COUNT(*) AS pv,
            COUNT(DISTINCT session_id) AS sv
          FROM page_views
          WHERE site_id = ${siteId}
            AND timestamp >= ${periodStart}
            AND timestamp <= ${periodEnd}
          GROUP BY 1
          ORDER BY 1
        `,
        prisma.pageView.groupBy({
          by: ['path'],
          where: { siteId, timestamp: { gte: periodStart, lte: periodEnd } },
          _count: { path: true },
          orderBy: { _count: { path: 'desc' } },
          take: 5,
        }),
        prisma.pageView.findMany({
          where: { siteId, timestamp: { gte: periodStart, lte: periodEnd }, referrer: { not: null } },
          select: { referrer: true },
        }),
      ])

    const visits = sessions.length
    if (!visits && !pageViews) return { ok: false, message: 'Sem dados suficientes' }

    const days = Math.max(1, Math.round(durationMs / (1000 * 60 * 60 * 24)))
    const avgDailyVisits = Math.round((visits / days) * 10) / 10

    const prevVisits = prevSessions.length
    const changePercent = prevVisits > 0 ? Math.round(((visits - prevVisits) / prevVisits) * 100) : null

    const timeSeries = seriesRaw.map((r) => ({
      date: r.date,
      pageviews: Number(r.pv),
      sessions: Number(r.sv),
    }))

    const topPages = topPagesRaw.map((p) => ({ path: p.path, count: p._count.path }))
    const topReferrers = parseReferrers(topReferrersRaw)

    return {
      ok: true,
      data: { visits, pageViews, avgDailyVisits, changePercent, timeSeries, topReferrers, topPages },
    }
  } catch (err) {
    console.error('[getWeeklyAnalytics]', err)
    return { ok: false, message: 'Erro ao buscar analytics' }
  }
}
