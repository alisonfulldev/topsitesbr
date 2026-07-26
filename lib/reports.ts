import { prisma } from '@/lib/prisma'
import { getWeeklyAnalytics, WeeklyAnalyticsData } from '@/lib/integrations/analytics'
import { sendNotification, sendWeeklyReportEmail } from '@/lib/notifications'
import { APP_URL } from '@/lib/config'

const REPORT_INTERVAL_DAYS = 7

function formatPeriodLabel(start: Date, end: Date): string {
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' }
  const s = start.toLocaleDateString('pt-BR', opts)
  const e = end.toLocaleDateString('pt-BR', opts)
  return `${s} a ${e}`
}

function buildInsights(data: WeeklyAnalyticsData): string[] {
  const insights: string[] = []

  // Source-based tip
  const topRef = data.topReferrers[0]
  if (topRef) {
    const host = topRef.host.toLowerCase()
    if (host.includes('instagram') || host.includes('ig.me')) {
      insights.push('A maior parte das visitas veio do Instagram. Postar com mais frequência e sempre incluir o link do site na bio ou nos Stories tende a aumentar ainda mais esse número.')
    } else if (host.includes('google') || host.includes('search')) {
      insights.push('O Google já está trazendo visitantes — ótimo sinal! Manter o site atualizado com textos relevantes ajuda a aparecer para mais pessoas ao longo do tempo.')
    } else if (host.includes('facebook')) {
      insights.push('O Facebook está enviando visitas para seu site. Publicações com o link direto (não apenas na bio) costumam gerar mais cliques.')
    } else if (host.includes('whatsapp') || host.includes('wa.me')) {
      insights.push('Muitas visitas chegaram via WhatsApp, o que indica que você está divulgando ativamente. Continue compartilhando o link em conversas e grupos relevantes.')
    } else {
      insights.push(`Boa parte das visitas veio de ${topRef.host}. Explorar outros canais de divulgação ajuda a diversificar o tráfego e reduzir a dependência de uma única fonte.`)
    }
  } else {
    insights.push('A maioria das visitas chegou diretamente (pessoas que digitaram ou salvaram o endereço). Divulgar o link em redes sociais, WhatsApp e Google Meu Negócio ajuda a ampliar o alcance.')
  }

  // Volume-based tip
  if (data.visits < 20) {
    insights.push('Sites novos levam alguns meses para ganhar tração — isso é completamente normal. Nesse início, o que mais acelera é a divulgação ativa: compartilhar o link com clientes, grupos de WhatsApp e redes sociais da área.')
  } else if (data.changePercent !== null && data.changePercent > 20) {
    insights.push(`Seu site cresceu ${data.changePercent}% em visitas em relação à semana passada — excelente resultado! Aproveite o momentum para pedir avaliações ou depoimentos de clientes satisfeitos, que reforçam a credibilidade.`)
  } else {
    insights.push('Manter uma frequência de publicação nas redes sociais — mesmo que seja só uma vez por semana — ajuda a levar mais pessoas ao seu site de forma consistente.')
  }

  return insights.slice(0, 2)
}

export async function generateReportForSite(
  siteId: string,
  clientId: string,
  analyticsSiteId: string,
  forceNow = false,
): Promise<boolean> {
  // Check if we need a new report
  const latest = await prisma.siteReport.findFirst({
    where: { siteId },
    orderBy: { generatedAt: 'desc' },
  })

  if (!forceNow && latest) {
    const daysSince = (Date.now() - latest.generatedAt.getTime()) / (1000 * 60 * 60 * 24)
    if (daysSince < REPORT_INTERVAL_DAYS) return false
  }

  // Period: last 7 days
  const periodEnd = new Date()
  periodEnd.setHours(23, 59, 59, 999)
  const periodStart = new Date(periodEnd)
  periodStart.setDate(periodStart.getDate() - 6)
  periodStart.setHours(0, 0, 0, 0)

  const result = await getWeeklyAnalytics(analyticsSiteId, periodStart, periodEnd)
  if (!result.ok) return false

  const insights = buildInsights(result.data)
  const periodLabel = formatPeriodLabel(periodStart, periodEnd)

  const reportData = {
    visits: result.data.visits,
    pageViews: result.data.pageViews,
    avgDailyVisits: result.data.avgDailyVisits,
    changePercent: result.data.changePercent,
    timeSeries: result.data.timeSeries,
    topReferrers: result.data.topReferrers,
    topPages: result.data.topPages,
    insights,
    periodLabel,
  }

  const report = await prisma.siteReport.create({
    data: {
      siteId,
      clientId,
      periodStart,
      periodEnd,
      data: reportData,
    },
  })

  // Notify client
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { email: true, name: true },
  })
  if (!client) return true

  const reportUrl = `${APP_URL}/painel/relatorios/${report.id}`
  const notifTitle = `Relatório semanal pronto — ${periodLabel}`
  const notifMsg = `Seu relatório de desempenho da semana de ${periodLabel} está disponível. Confira quantas pessoas visitaram seu site e dicas para crescer ainda mais.`

  await sendNotification(clientId, notifTitle, notifMsg, 'painel', 'weekly-report')
  await sendWeeklyReportEmail(client.email, client.name, reportUrl, periodLabel)

  return true
}

export async function maybeGenerateReportsForClient(clientId: string): Promise<void> {
  const sites = await prisma.site.findMany({
    where: { clientId, status: 'online', analyticsSiteId: { not: null } },
  })
  for (const site of sites) {
    if (!site.analyticsSiteId) continue
    await generateReportForSite(site.id, clientId, site.analyticsSiteId)
  }
}

export async function generateReportsForAllClients(): Promise<{ generated: number; skipped: number }> {
  const sites = await prisma.site.findMany({
    where: { status: 'online', analyticsSiteId: { not: null } },
    include: { client: { select: { id: true } } },
  })

  let generated = 0
  let skipped = 0

  for (const site of sites) {
    if (!site.analyticsSiteId) continue
    const ok = await generateReportForSite(site.id, site.client.id, site.analyticsSiteId, true)
    if (ok) generated++
    else skipped++
  }

  return { generated, skipped }
}
