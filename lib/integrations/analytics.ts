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
  changePercent: number | null  // null = no previous period data
  timeSeries: { date: string; pageviews: number; sessions: number }[]
  topReferrers: { host: string; count: number }[]
  topPages: { path: string; count: number }[]
}

export type WeeklyAnalyticsResult =
  | { ok: true; data: WeeklyAnalyticsData }
  | { ok: false; message: string }

async function getUmamiToken(apiUrl: string): Promise<string | null> {
  const username = process.env.UMAMI_USERNAME?.trim()
  const password = process.env.UMAMI_PASSWORD?.trim()
  if (!username || !password) return null
  try {
    const res = await fetch(`${apiUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
      cache: 'no-store',
    })
    if (!res.ok) return null
    const data = await res.json()
    return data?.token ?? null
  } catch {
    return null
  }
}

function extractCount(value: unknown): number {
  if (typeof value === 'number') return value
  if (typeof value === 'object' && value !== null && 'value' in value) {
    return (value as { value: number }).value ?? 0
  }
  return 0
}

export async function getSiteAnalytics(
  websiteId: string,
  since: string,
  until: string,
): Promise<AnalyticsResult> {
  const apiUrl = process.env.UMAMI_API_URL?.trim()
  const apiKey = process.env.UMAMI_API_KEY?.trim()

  if (!apiUrl) {
    return { ok: false, message: 'Coletando dados...' }
  }

  const token = apiKey ?? (await getUmamiToken(apiUrl))
  if (!token) {
    return { ok: false, message: 'Coletando dados...' }
  }

  const startAt = new Date(since).getTime()
  const endAt = new Date(until + 'T23:59:59').getTime()

  try {
    const headers = { Authorization: `Bearer ${token}` }
    const [statsRes, pagesRes, referrersRes] = await Promise.all([
      fetch(`${apiUrl}/api/websites/${websiteId}/stats?startAt=${startAt}&endAt=${endAt}`, {
        headers,
        next: { revalidate: 3600 },
      }),
      fetch(`${apiUrl}/api/websites/${websiteId}/metrics?startAt=${startAt}&endAt=${endAt}&type=url&limit=5`, {
        headers,
        next: { revalidate: 3600 },
      }),
      fetch(`${apiUrl}/api/websites/${websiteId}/metrics?startAt=${startAt}&endAt=${endAt}&type=referrer&limit=5`, {
        headers,
        next: { revalidate: 3600 },
      }),
    ])

    if (!statsRes.ok) return { ok: false, message: 'Coletando dados...' }

    const stats = await statsRes.json()
    const visits = extractCount(stats?.visits)
    const pageViews = extractCount(stats?.pageviews)

    if (!visits && !pageViews) {
      return { ok: false, message: 'Sem visitas neste período.' }
    }

    const pagesData = pagesRes.ok ? await pagesRes.json() : []
    const referrersData = referrersRes.ok ? await referrersRes.json() : []

    const topPages = (Array.isArray(pagesData) ? pagesData : [])
      .map((p: { x: string; y: number }) => ({ path: p.x, count: p.y }))

    const topReferrers = (Array.isArray(referrersData) ? referrersData : [])
      .filter((r: { x: string; y: number }) => r.x)
      .map((r: { x: string; y: number }) => ({ host: r.x, count: r.y }))

    const periodLabel = new Date(since + 'T12:00:00').toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric',
    })

    return {
      ok: true,
      data: { visits, pageViews, topReferrers, topPages, period: periodLabel },
    }
  } catch {
    return { ok: false, message: 'Coletando dados...' }
  }
}

export async function getWeeklyAnalytics(
  websiteId: string,
  periodStart: Date,
  periodEnd: Date,
): Promise<WeeklyAnalyticsResult> {
  const apiUrl = process.env.UMAMI_API_URL?.trim()
  const apiKey = process.env.UMAMI_API_KEY?.trim()

  if (!apiUrl) return { ok: false, message: 'Umami não configurado' }

  const token = apiKey ?? (await getUmamiToken(apiUrl))
  if (!token) return { ok: false, message: 'Sem token Umami' }

  const startAt = periodStart.getTime()
  const endAt = periodEnd.getTime()

  // Previous period (same duration, immediately before)
  const durationMs = endAt - startAt
  const prevStartAt = startAt - durationMs
  const prevEndAt = startAt - 1

  const headers = { Authorization: `Bearer ${token}` }

  try {
    const [statsRes, prevStatsRes, seriesRes, pagesRes, referrersRes] = await Promise.all([
      fetch(`${apiUrl}/api/websites/${websiteId}/stats?startAt=${startAt}&endAt=${endAt}`, {
        headers, cache: 'no-store',
      }),
      fetch(`${apiUrl}/api/websites/${websiteId}/stats?startAt=${prevStartAt}&endAt=${prevEndAt}`, {
        headers, cache: 'no-store',
      }),
      fetch(`${apiUrl}/api/websites/${websiteId}/pageviews?startAt=${startAt}&endAt=${endAt}&unit=day&timezone=America/Sao_Paulo`, {
        headers, cache: 'no-store',
      }),
      fetch(`${apiUrl}/api/websites/${websiteId}/metrics?startAt=${startAt}&endAt=${endAt}&type=url&limit=5`, {
        headers, cache: 'no-store',
      }),
      fetch(`${apiUrl}/api/websites/${websiteId}/metrics?startAt=${startAt}&endAt=${endAt}&type=referrer&limit=5`, {
        headers, cache: 'no-store',
      }),
    ])

    if (!statsRes.ok) return { ok: false, message: 'Erro ao consultar Umami' }

    const stats = await statsRes.json()
    const visits = extractCount(stats?.visits)
    const pageViews = extractCount(stats?.pageviews)

    if (!visits && !pageViews) return { ok: false, message: 'Sem dados suficientes' }

    const days = Math.max(1, Math.round(durationMs / (1000 * 60 * 60 * 24)))
    const avgDailyVisits = Math.round((visits / days) * 10) / 10

    let changePercent: number | null = null
    if (prevStatsRes.ok) {
      const prevStats = await prevStatsRes.json()
      const prevVisits = extractCount(prevStats?.visits)
      if (prevVisits > 0) {
        changePercent = Math.round(((visits - prevVisits) / prevVisits) * 100)
      }
    }

    let timeSeries: { date: string; pageviews: number; sessions: number }[] = []
    if (seriesRes.ok) {
      const seriesData = await seriesRes.json()
      // Umami returns { pageviews: [{t,y}], sessions: [{t,y}] } or [{x,y}]
      if (seriesData?.pageviews && Array.isArray(seriesData.pageviews)) {
        const pvMap: Record<string, number> = {}
        const sessMap: Record<string, number> = {}
        for (const item of seriesData.pageviews) {
          const d = String(item.t ?? item.x ?? '').substring(0, 10)
          pvMap[d] = (pvMap[d] ?? 0) + (item.y ?? 0)
        }
        for (const item of (seriesData.sessions ?? [])) {
          const d = String(item.t ?? item.x ?? '').substring(0, 10)
          sessMap[d] = (sessMap[d] ?? 0) + (item.y ?? 0)
        }
        timeSeries = Object.keys(pvMap).sort().map((d) => ({
          date: d,
          pageviews: pvMap[d],
          sessions: sessMap[d] ?? 0,
        }))
      } else if (Array.isArray(seriesData)) {
        timeSeries = seriesData.map((item: { x: string; y: number }) => ({
          date: String(item.x).substring(0, 10),
          pageviews: item.y,
          sessions: 0,
        }))
      }
    }

    const pagesData = pagesRes.ok ? await pagesRes.json() : []
    const referrersData = referrersRes.ok ? await referrersRes.json() : []

    const topPages = (Array.isArray(pagesData) ? pagesData : [])
      .map((p: { x: string; y: number }) => ({ path: p.x, count: p.y }))

    const topReferrers = (Array.isArray(referrersData) ? referrersData : [])
      .filter((r: { x: string }) => r.x)
      .map((r: { x: string; y: number }) => ({ host: r.x, count: r.y }))

    return {
      ok: true,
      data: { visits, pageViews, avgDailyVisits, changePercent, timeSeries, topReferrers, topPages },
    }
  } catch (err) {
    console.error('[getWeeklyAnalytics]', err)
    return { ok: false, message: 'Erro ao buscar analytics' }
  }
}
