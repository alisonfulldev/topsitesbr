const CF_GRAPHQL = 'https://api.cloudflare.com/client/v4/graphql'

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

const QUERY = `
  query SiteAnalytics($accountTag: String!, $siteTag: String!, $since: Date!, $until: Date!) {
    viewer {
      accounts(filter: { accountTag: $accountTag }) {
        total: rumPageloadEventsAdaptiveGroups(
          filter: { siteTag: $siteTag, date_geq: $since, date_leq: $until }
          limit: 1
        ) {
          sum { visits pageViews }
        }
        byReferrer: rumPageloadEventsAdaptiveGroups(
          filter: { siteTag: $siteTag, date_geq: $since, date_leq: $until }
          orderBy: [count_DESC]
          limit: 5
        ) {
          count
          dimensions { refererHost }
        }
        byPage: rumPageloadEventsAdaptiveGroups(
          filter: { siteTag: $siteTag, date_geq: $since, date_leq: $until }
          orderBy: [count_DESC]
          limit: 5
        ) {
          count
          dimensions { requestPath }
        }
      }
    }
  }
`

export async function getSiteAnalytics(
  siteTag: string,
  since: string,
  until: string,
): Promise<AnalyticsResult> {
  const token = process.env.CLOUDFLARE_API_TOKEN
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID

  if (!token || !accountId) {
    return { ok: false, message: 'Coletando dados...' }
  }

  try {
    const res = await fetch(CF_GRAPHQL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: QUERY,
        variables: { accountTag: accountId, siteTag, since, until },
      }),
      next: { revalidate: 3600 },
    })

    if (!res.ok) {
      return { ok: false, message: 'Coletando dados...' }
    }

    const json = await res.json()

    if (json.errors?.length) {
      return { ok: false, message: 'Coletando dados...' }
    }

    const accounts: unknown[] = json.data?.viewer?.accounts ?? []
    if (accounts.length === 0) {
      return { ok: false, message: 'Sem dados neste período.' }
    }

    const account = accounts[0] as Record<string, unknown[]>
    const totalRow = (account.total as { sum: { visits: number; pageViews: number } }[])?.[0]
    const visits = totalRow?.sum?.visits ?? 0
    const pageViews = totalRow?.sum?.pageViews ?? 0

    if (!visits && !pageViews) {
      return { ok: false, message: 'Sem visitas neste período.' }
    }

    type ReferrerRow = { count: number; dimensions: { refererHost: string } }
    type PageRow = { count: number; dimensions: { requestPath: string } }

    const byReferrer = (account.byReferrer as ReferrerRow[]) ?? []
    const byPage = (account.byPage as PageRow[]) ?? []

    const topReferrers = byReferrer
      .filter((r) => r.dimensions?.refererHost)
      .map((r) => ({ host: r.dimensions.refererHost, count: r.count }))

    const topPages = byPage
      .filter((p) => p.dimensions?.requestPath)
      .map((p) => ({ path: p.dimensions.requestPath, count: p.count }))

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
