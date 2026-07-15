import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { FinanceiroClient, type MonthlyRow, type OverdueItem, type CostBreakdown } from './_components/FinanceiroClient'

const MAINTENANCE_PRODUCTS = new Set([
  'Nova Seção',
  'Nova Página',
  'Alteração de Texto (avulsa)',
  'Alteração de Imagem (avulsa)',
  'Alteração de Texto e Imagem (avulsa)',
])

type Period = '1m' | '3m' | '6m' | '12m' | 'custom'

function getDateRange(period: Period, from?: string, to?: string): { start: Date; end: Date } {
  const now = new Date()
  if (period === 'custom' && from && to) {
    return {
      start: new Date(from + 'T00:00:00'),
      end: new Date(to + 'T23:59:59'),
    }
  }
  const monthsBack = period === '1m' ? 1 : period === '3m' ? 3 : period === '6m' ? 6 : 12
  const start = new Date(now.getFullYear(), now.getMonth() - (monthsBack - 1), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
  return { start, end }
}

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function monthLabel(key: string) {
  const [year, month] = key.split('-')
  const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  return `${MONTHS[parseInt(month) - 1]}/${year.slice(2)}`
}

function buildMonthsList(start: Date, end: Date): string[] {
  const months: string[] = []
  const cur = new Date(start.getFullYear(), start.getMonth(), 1)
  while (cur <= end) {
    months.push(monthKey(cur))
    cur.setMonth(cur.getMonth() + 1)
  }
  return months
}

export default async function AdminFinanceiroPage({
  searchParams,
}: {
  searchParams: { period?: string; from?: string; to?: string }
}) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') redirect('/login')

  const period = (searchParams.period as Period) ?? '3m'
  const { start, end } = getDateRange(period, searchParams.from, searchParams.to)
  const months = buildMonthsList(start, end)

  const [paidInvoices, paidOrders, allCosts, overdueInvoices, activeSubscriptions, newClients] =
    await Promise.all([
      prisma.invoice.findMany({
        where: { status: 'paid', paidAt: { gte: start, lte: end } },
        select: { amount: true, paidAt: true },
      }),
      prisma.order.findMany({
        where: { status: 'paid', createdAt: { gte: start, lte: end } },
        include: { product: { select: { name: true } } },
      }),
      prisma.cost.findMany({
        where: { costDate: { gte: start, lte: end } },
        select: { amount: true, category: true, costDate: true },
      }),
      prisma.invoice.findMany({
        where: { status: 'overdue' },
        include: {
          subscription: { include: { client: { select: { name: true } } } },
        },
      }),
      prisma.subscription.findMany({
        where: { status: 'active' },
        include: { plan: true },
        distinct: ['clientId'],
        orderBy: { createdAt: 'desc' },
      }),
      prisma.client.findMany({
        where: { createdAt: { gte: start, lte: end } },
        select: { createdAt: true, siteEntryFee: true },
      }),
    ])

  // Revenue maps
  const revMap: Record<string, { subscriptions: number; upsells: number; maintenance: number; siteRevenue: number }> =
    {}
  const costMap: Record<
    string,
    { ia: number; trafego_pago: number; hospedagem_ferramentas: number; outro: number }
  > = {}
  const clientMap: Record<string, number> = {}

  for (const m of months) {
    revMap[m] = { subscriptions: 0, upsells: 0, maintenance: 0, siteRevenue: 0 }
    costMap[m] = { ia: 0, trafego_pago: 0, hospedagem_ferramentas: 0, outro: 0 }
    clientMap[m] = 0
  }

  for (const inv of paidInvoices) {
    const k = monthKey(inv.paidAt!)
    if (revMap[k]) revMap[k].subscriptions += Number(inv.amount)
  }

  for (const ord of paidOrders) {
    const k = monthKey(ord.createdAt)
    if (!revMap[k]) continue
    if (MAINTENANCE_PRODUCTS.has(ord.product.name)) {
      revMap[k].maintenance += Number(ord.amount)
    } else {
      revMap[k].upsells += Number(ord.amount)
    }
  }

  for (const c of allCosts) {
    const k = monthKey(c.costDate)
    if (!costMap[k]) continue
    const cat = c.category as keyof (typeof costMap)[string]
    costMap[k][cat] += Number(c.amount)
  }

  for (const c of newClients) {
    const k = monthKey(c.createdAt)
    if (clientMap[k] !== undefined) clientMap[k]++
    if (revMap[k] && c.siteEntryFee != null) {
      revMap[k].siteRevenue += Number(c.siteEntryFee)
    }
  }

  const monthlyData: MonthlyRow[] = months.map((m) => {
    const rev = revMap[m]
    const cos = costMap[m]
    const totalRevenue = rev.subscriptions + rev.upsells + rev.maintenance + rev.siteRevenue
    const totalCosts = cos.ia + cos.trafego_pago + cos.hospedagem_ferramentas + cos.outro
    const profit = totalRevenue - totalCosts
    return {
      month: m,
      label: monthLabel(m),
      subscriptions: rev.subscriptions,
      upsells: rev.upsells,
      maintenance: rev.maintenance,
      siteRevenue: rev.siteRevenue,
      totalRevenue,
      ia: cos.ia,
      trafego_pago: cos.trafego_pago,
      hospedagem_ferramentas: cos.hospedagem_ferramentas,
      outro: cos.outro,
      totalCosts,
      profit,
      margin: totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0,
      newClients: clientMap[m] ?? 0,
    }
  })

  const totalRevenue = monthlyData.reduce((a, r) => a + r.totalRevenue, 0)
  const totalCosts = monthlyData.reduce((a, r) => a + r.totalCosts, 0)
  const totalProfit = totalRevenue - totalCosts
  const totalMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0
  const currentMRR = activeSubscriptions.reduce((a, s) => a + Number(s.plan.price), 0)

  const avgActiveClients = activeSubscriptions.length || 1
  const arpu = months.length > 0 ? totalRevenue / months.length / avgActiveClients : 0

  const overdueList: OverdueItem[] = overdueInvoices.map((inv) => ({
    clientName: inv.subscription.client.name,
    amount: Number(inv.amount),
    dueDate: inv.dueDate.toISOString(),
    daysOverdue: Math.max(
      0,
      Math.floor((Date.now() - inv.dueDate.getTime()) / (1000 * 60 * 60 * 24))
    ),
  }))
  const totalOverdue = overdueList.reduce((a, i) => a + i.amount, 0)

  const costBreakdown: CostBreakdown = {
    ia: allCosts.filter((c) => c.category === 'ia').reduce((a, c) => a + Number(c.amount), 0),
    trafego_pago: allCosts
      .filter((c) => c.category === 'trafego_pago')
      .reduce((a, c) => a + Number(c.amount), 0),
    hospedagem_ferramentas: allCosts
      .filter((c) => c.category === 'hospedagem_ferramentas')
      .reduce((a, c) => a + Number(c.amount), 0),
    outro: allCosts
      .filter((c) => c.category === 'outro')
      .reduce((a, c) => a + Number(c.amount), 0),
  }

  const mrrByMonth = months.map((m) => ({
    label: monthLabel(m),
    mrr: revMap[m].subscriptions,
  }))

  const clientGrowthByMonth = months.map((m) => ({
    label: monthLabel(m),
    new: clientMap[m] ?? 0,
  }))

  return (
    <FinanceiroClient
      period={period}
      from={searchParams.from}
      to={searchParams.to}
      monthlyData={monthlyData}
      totalRevenue={totalRevenue}
      totalCosts={totalCosts}
      totalProfit={totalProfit}
      totalMargin={totalMargin}
      currentMRR={currentMRR}
      arpu={arpu}
      overdueList={overdueList}
      totalOverdue={totalOverdue}
      costBreakdown={costBreakdown}
      mrrByMonth={mrrByMonth}
      clientGrowthByMonth={clientGrowthByMonth}
    />
  )
}
