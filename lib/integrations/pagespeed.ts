export type PageSpeedResult =
  | {
      ok: true
      scores: {
        performance: number
        seo: number
        accessibility: number
        bestPractices: number
      }
    }
  | { ok: false; message: string }

export async function getPageSpeedMetrics(siteUrl: string): Promise<PageSpeedResult> {
  const apiKey = process.env.GOOGLE_PAGESPEED_API_KEY
  if (!apiKey) return { ok: false, message: 'not_configured' }

  const params = new URLSearchParams({
    url: siteUrl,
    strategy: 'mobile',
    key: apiKey,
  })
  ;['performance', 'seo', 'accessibility', 'best-practices'].forEach((c) =>
    params.append('category', c),
  )

  try {
    const res = await fetch(
      `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${params}`,
      { next: { revalidate: 3600 } },
    )
    if (!res.ok) return { ok: false, message: 'api_error' }

    const data = await res.json()
    const cats = data?.lighthouseResult?.categories
    if (!cats) return { ok: false, message: 'invalid_response' }

    return {
      ok: true,
      scores: {
        performance: Math.round((cats.performance?.score ?? 0) * 100),
        seo: Math.round((cats.seo?.score ?? 0) * 100),
        accessibility: Math.round((cats.accessibility?.score ?? 0) * 100),
        bestPractices: Math.round((cats['best-practices']?.score ?? 0) * 100),
      },
    }
  } catch {
    return { ok: false, message: 'connection_error' }
  }
}
