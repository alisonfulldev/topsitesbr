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

export async function getSiteAnalytics(
  websiteId: string,
  since: string,
  until: string,
): Promise<AnalyticsResult> {
  const apiUrl = process.env.UMAMI_API_URL
  const apiKey = process.env.UMAMI_API_KEY

  if (!apiUrl || !apiKey) {
    return { ok: false, message: 'Coletando dados...' }
  }

  const startAt = new Date(since).getTime()
  const endAt = new Date(until + 'T23:59:59').getTime()

  try {
    const [statsRes, pagesRes, referrersRes] = await Promise.all([
      fetch(`${apiUrl}/api/websites/${websiteId}/stats?startAt=${startAt}&endAt=${endAt}`, {
        headers: { Authorization: `Bearer ${apiKey}` },
        next: { revalidate: 3600 },
      }),
      fetch(`${apiUrl}/api/websites/${websiteId}/metrics?startAt=${startAt}&endAt=${endAt}&type=url&limit=5`, {
        headers: { Authorization: `Bearer ${apiKey}` },
        next: { revalidate: 3600 },
      }),
      fetch(`${apiUrl}/api/websites/${websiteId}/metrics?startAt=${startAt}&endAt=${endAt}&type=referrer&limit=5`, {
        headers: { Authorization: `Bearer ${apiKey}` },
        next: { revalidate: 3600 },
      }),
    ])

    if (!statsRes.ok) return { ok: false, message: 'Coletando dados...' }

    const stats = await statsRes.json()
    const visits = stats?.visits?.value ?? 0
    const pageViews = stats?.pageviews?.value ?? 0

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
