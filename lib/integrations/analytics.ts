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
    // Umami v2 retorna número direto; v1 retorna { value: number }
    const visits = typeof stats?.visits === 'object' ? (stats.visits?.value ?? 0) : (stats?.visits ?? 0)
    const pageViews = typeof stats?.pageviews === 'object' ? (stats.pageviews?.value ?? 0) : (stats?.pageviews ?? 0)

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
