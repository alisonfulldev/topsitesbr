import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { FinanceiroClient, type MonthlyRow, type OverdueItem, type CostBreakdown, type TransactionItem } from './_components/FinanceiroClient'

const MAINTENANCE_PRODUCTS = new Set([
  'Nova Seção',
  'Nova Página',
  'Alteração de Texto (avulsa)',
  'Alteração de Imagem (avulsa)',
  'Alteração de Texto e Imagem (avulsa)',
])

function orderOriginLabel(productName: string): string {
  if (productName === 'Criação de Site (Pago por Fora)') return 'Criação — pago por fora'
  if (MAINTENANCE_PRODUCTS.has(productName)) return `Manutenção — ${productName.replace(' (avulsa)', '')}`
  return `Upsell — ${productName}`
}

type Period = '1m' | '3m' | '6m' | '12m' | 'custom'
type Granularity = 'mes' | 'quinzena'

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

// ── Quinzena helpers ──────────────────────────────────────────────────────────

function quinzenaKeyFromDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}-${d.getDate() <= 15 ? '1' : '2'}`
}

function buildQuinzenaList(start: Date, end: Date): string[] {
  const list: string[] = []
  const cur = new Date(start.getFullYear(), start.getMonth(), 1)
  while (cur <= end) {
    const y = cur.getFullYear()
    const m = String(cur.getMonth() + 1).padStart(2, '0')
    list.push(`${y}-${m}-1`)
    list.push(`${y}-${m}-2`)
    cur.setMonth(cur.getMonth() + 1)
  }
  return list
}

function quinzenaLabel(key: string): string {
  const parts = key.split('-')
  const year = parts[0]
  const month = parts[1]
  const half = parts[2]
  const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  const monthName = MONTHS[parseInt(month) - 1]
  const yr = year.slice(2)
  if (half === '1') return `1-15/${monthName}/${yr}`
  const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate()
  return `16-${lastDay}/${monthName}/${yr}`
}

export default async function AdminFinanceiroPage({
  searchParams,
}: {
  searchParams: { period?: string; from?: string; to?: string; granularity?: string; selectedQuinzena?: string }
}) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') redirect('/login')

  const period = (searchParams.period as Period) ?? '3m'
  const granularity = (searchParams.granularity as Granularity) ?? 'mes'
  const { start, end } = getDateRange(period, searchParams.from, searchParams.to)
  const months = buildMonthsList(start, end)
  const quinzenas = buildQuinzenaList(start, end)

  const [paidInvoices, paidOrders, allCosts, overdueInvoices, activeSubscriptions, newClients, extraRevenues, reserveSetting] =
    await Promise.all([
      prisma.invoice.findMany({
        where: { status: 'paid', paidAt: { gte: start, lte: end } },
        include: {
          subscription: {
            include: {
              client: { select: { name: true } },
              plan: { select: { name: true } },
            },
          },
        },
      }),
      prisma.order.findMany({
        where: { status: 'paid', createdAt: { gte: start, lte: end } },
        include: {
          product: { select: { name: true } },
          client: { select: { name: true } },
        },
      }),
      prisma.cost.findMany({
        where: { costDate: { gte: start, lte: end } },
        select: { id: true, amount: true, category: true, costDate: true, description: true, isRecurring: true },
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
        select: { id: true, name: true, createdAt: true, siteEntryFee: true },
      }),
      prisma.extraRevenue.findMany({
        where: { revenueDate: { gte: start, lte: end } },
        select: { id: true, category: true, description: true, amount: true, revenueDate: true },
      }),
      prisma.systemSetting.findUnique({ where: { key: 'traffic_reserve_percent' } }),
    ])

  const trafficReservePercent = Number(reserveSetting?.value ?? '40')

  // ── Monthly maps ──────────────────────────────────────────────────────────────

  type RevBucket = { subscriptions: number; upsells: number; maintenance: number; siteRevenue: number; extraRevenue: number }
  type CostBucket = { ia: number; trafego_pago: number; hospedagem_ferramentas: number; outro: number }

  const revMap: Record<string, RevBucket> = {}
  const costMap: Record<string, CostBucket> = {}
  const clientMap: Record<string, number> = {}

  for (const m of months) {
    revMap[m] = { subscriptions: 0, upsells: 0, maintenance: 0, siteRevenue: 0, extraRevenue: 0 }
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
    if (MAINTENANCE_PRODUCTS.has(ord.product.name)) revMap[k].maintenance += Number(ord.amount)
    else revMap[k].upsells += Number(ord.amount)
  }
  for (const c of allCosts) {
    const k = monthKey(c.costDate)
    if (!costMap[k]) continue
    const cat = c.category as keyof CostBucket
    costMap[k][cat] += Number(c.amount)
  }
  for (const c of newClients) {
    const k = monthKey(c.createdAt)
    if (clientMap[k] !== undefined) clientMap[k]++
    if (revMap[k] && c.siteEntryFee != null) revMap[k].siteRevenue += Number(c.siteEntryFee)
  }
  for (const er of extraRevenues) {
    const k = monthKey(er.revenueDate)
    if (revMap[k]) revMap[k].extraRevenue += Number(er.amount)
  }

  const monthlyData: MonthlyRow[] = months.map((m) => {
    const rev = revMap[m]
    const cos = costMap[m]
    const totalRevenue = rev.subscriptions + rev.upsells + rev.maintenance + rev.siteRevenue + rev.extraRevenue
    const totalCosts = cos.ia + cos.trafego_pago + cos.hospedagem_ferramentas + cos.outro
    const profit = totalRevenue - totalCosts
    return {
      month: m,
      label: monthLabel(m),
      subscriptions: rev.subscriptions,
      upsells: rev.upsells,
      maintenance: rev.maintenance,
      siteRevenue: rev.siteRevenue,
      extraRevenue: rev.extraRevenue,
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

  // ── Quinzena maps ─────────────────────────────────────────────────────────────

  const qRevMap: Record<string, RevBucket> = {}
  const qCostMap: Record<string, CostBucket> = {}
  const qClientMap: Record<string, number> = {}

  for (const q of quinzenas) {
    qRevMap[q] = { subscriptions: 0, upsells: 0, maintenance: 0, siteRevenue: 0, extraRevenue: 0 }
    qCostMap[q] = { ia: 0, trafego_pago: 0, hospedagem_ferramentas: 0, outro: 0 }
    qClientMap[q] = 0
  }

  for (const inv of paidInvoices) {
    const k = quinzenaKeyFromDate(inv.paidAt!)
    if (qRevMap[k]) qRevMap[k].subscriptions += Number(inv.amount)
  }
  for (const ord of paidOrders) {
    const k = quinzenaKeyFromDate(ord.createdAt)
    if (!qRevMap[k]) continue
    if (MAINTENANCE_PRODUCTS.has(ord.product.name)) qRevMap[k].maintenance += Number(ord.amount)
    else qRevMap[k].upsells += Number(ord.amount)
  }
  for (const c of allCosts) {
    const cat = c.category as keyof CostBucket
    if (c.isRecurring) {
      // Divide 50 % para cada quinzena do mesmo mês
      const y = c.costDate.getFullYear()
      const m = String(c.costDate.getMonth() + 1).padStart(2, '0')
      const q1 = `${y}-${m}-1`
      const q2 = `${y}-${m}-2`
      const half = Number(c.amount) / 2
      if (qCostMap[q1]) qCostMap[q1][cat] += half
      if (qCostMap[q2]) qCostMap[q2][cat] += half
    } else {
      const k = quinzenaKeyFromDate(c.costDate)
      if (qCostMap[k]) qCostMap[k][cat] += Number(c.amount)
    }
  }
  for (const c of newClients) {
    const k = quinzenaKeyFromDate(c.createdAt)
    if (qClientMap[k] !== undefined) qClientMap[k]++
    if (qRevMap[k] && c.siteEntryFee != null) qRevMap[k].siteRevenue += Number(c.siteEntryFee)
  }
  for (const er of extraRevenues) {
    const k = quinzenaKeyFromDate(er.revenueDate)
    if (qRevMap[k]) qRevMap[k].extraRevenue += Number(er.amount)
  }

  const quinzenaData: MonthlyRow[] = quinzenas.map((q) => {
    const rev = qRevMap[q]
    const cos = qCostMap[q]
    const totalRevenue = rev.subscriptions + rev.upsells + rev.maintenance + rev.siteRevenue + rev.extraRevenue
    const totalCosts = cos.ia + cos.trafego_pago + cos.hospedagem_ferramentas + cos.outro
    const profit = totalRevenue - totalCosts
    return {
      month: q,
      label: quinzenaLabel(q),
      subscriptions: rev.subscriptions,
      upsells: rev.upsells,
      maintenance: rev.maintenance,
      siteRevenue: rev.siteRevenue,
      extraRevenue: rev.extraRevenue,
      totalRevenue,
      ia: cos.ia,
      trafego_pago: cos.trafego_pago,
      hospedagem_ferramentas: cos.hospedagem_ferramentas,
      outro: cos.outro,
      totalCosts,
      profit,
      margin: totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0,
      newClients: qClientMap[q] ?? 0,
    }
  })

  // ── Totals & ancillary data ───────────────────────────────────────────────────

  const totalRevenue = monthlyData.reduce((a, r) => a + r.totalRevenue, 0)
  const totalCosts = monthlyData.reduce((a, r) => a + r.totalCosts, 0)
  const totalProfit = totalRevenue - totalCosts
  const totalMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0

  // When viewing a specific quinzena, override KPI cards with that quinzena's values
  const selectedQuinzenaKey = granularity === 'quinzena' ? (searchParams.selectedQuinzena ?? undefined) : undefined
  const selectedQuinzenaRow = selectedQuinzenaKey
    ? (quinzenaData.find((r) => r.month === selectedQuinzenaKey) ?? null)
    : null
  const kpiRevenue = selectedQuinzenaRow ? selectedQuinzenaRow.totalRevenue : totalRevenue
  const kpiCosts = selectedQuinzenaRow ? selectedQuinzenaRow.totalCosts : totalCosts
  const kpiProfit = selectedQuinzenaRow ? selectedQuinzenaRow.profit : totalProfit
  const kpiMargin = selectedQuinzenaRow ? selectedQuinzenaRow.margin : totalMargin
  const currentMRR = activeSubscriptions.reduce((a, s) => a + Number(s.plan.price), 0)

  const avgActiveClients = activeSubscriptions.length || 1
  const arpu = months.length > 0 ? totalRevenue / months.length / avgActiveClients : 0

  const overdueList: OverdueItem[] = overdueInvoices.map((inv) => ({
    clientName: inv.subscription.client.name,
    amount: Number(inv.amount),
    dueDate: inv.dueDate.toISOString(),
    daysOverdue: Math.max(0, Math.floor((Date.now() - inv.dueDate.getTime()) / (1000 * 60 * 60 * 24))),
  }))
  const totalOverdue = overdueList.reduce((a, i) => a + i.amount, 0)

  const costBreakdown: CostBreakdown = {
    ia: allCosts.filter((c) => c.category === 'ia').reduce((a, c) => a + Number(c.amount), 0),
    trafego_pago: allCosts.filter((c) => c.category === 'trafego_pago').reduce((a, c) => a + Number(c.amount), 0),
    hospedagem_ferramentas: allCosts.filter((c) => c.category === 'hospedagem_ferramentas').reduce((a, c) => a + Number(c.amount), 0),
    outro: allCosts.filter((c) => c.category === 'outro').reduce((a, c) => a + Number(c.amount), 0),
  }

  const mrrByMonth = months.map((m) => ({ label: monthLabel(m), mrr: revMap[m].subscriptions }))
  const clientGrowthByMonth = months.map((m) => ({ label: monthLabel(m), new: clientMap[m] ?? 0 }))

  // ── Transaction list ──────────────────────────────────────────────────────────

  const COST_CATEGORY_LABELS: Record<string, string> = {
    ia: 'IA',
    trafego_pago: 'Tráfego Pago',
    hospedagem_ferramentas: 'Hospedagem/Ferramentas',
    outro: 'Outro',
  }

  const EXTRA_REVENUE_CATEGORY_LABELS: Record<string, string> = {
    servico_avulso: 'Serviço Avulso',
    consultoria: 'Consultoria',
    venda_site: 'Venda de Site',
    outro: 'Outro',
  }

  const transactions: TransactionItem[] = [
    ...paidInvoices.map((inv) => ({
      id: inv.id,
      type: 'receita' as const,
      deleteType: 'order' as const,
      date: (inv.paidAt ?? inv.createdAt).toISOString(),
      amount: Number(inv.amount),
      clientName: inv.subscription.client.name,
      origin: `Mensalidade — ${inv.subscription.plan.name}`,
      paymentMethod: 'asaas' as const,
      canDelete: false,
    })),
    ...paidOrders.map((ord) => ({
      id: ord.id,
      type: 'receita' as const,
      deleteType: 'order' as const,
      date: ord.createdAt.toISOString(),
      amount: Number(ord.amount),
      clientName: ord.client.name,
      origin: orderOriginLabel(ord.product.name),
      paymentMethod: (ord.asaasChargeId ? 'asaas' : 'externo') as 'asaas' | 'externo',
      canDelete: true,
    })),
    ...newClients
      .filter((c) => c.siteEntryFee != null)
      .map((c) => ({
        id: c.id,
        type: 'receita' as const,
        deleteType: 'site_revenue' as const,
        date: c.createdAt.toISOString(),
        amount: Number(c.siteEntryFee),
        clientName: c.name,
        origin: 'Criação — entrada (pago por fora)',
        paymentMethod: 'externo' as const,
        canDelete: true,
      })),
    ...extraRevenues.map((er) => ({
      id: er.id,
      type: 'receita' as const,
      deleteType: 'extra_revenue' as const,
      date: er.revenueDate.toISOString(),
      amount: Number(er.amount),
      origin: `Extra — ${EXTRA_REVENUE_CATEGORY_LABELS[er.category] ?? er.category}`,
      description: er.description,
      paymentMethod: 'externo' as const,
      canDelete: true,
    })),
    ...allCosts.map((c) => ({
      id: c.id,
      type: 'despesa' as const,
      deleteType: 'cost' as const,
      date: c.costDate.toISOString(),
      amount: Number(c.amount),
      origin: COST_CATEGORY_LABELS[c.category] ?? c.category,
      description: c.description,
      canDelete: true,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <FinanceiroClient
      period={period}
      granularity={granularity}
      from={searchParams.from}
      to={searchParams.to}
      monthlyData={monthlyData}
      quinzenaData={quinzenaData}
      selectedQuinzena={selectedQuinzenaKey}
      totalRevenue={kpiRevenue}
      totalCosts={kpiCosts}
      totalProfit={kpiProfit}
      totalMargin={kpiMargin}
      currentMRR={currentMRR}
      arpu={arpu}
      overdueList={overdueList}
      totalOverdue={totalOverdue}
      costBreakdown={costBreakdown}
      mrrByMonth={mrrByMonth}
      clientGrowthByMonth={clientGrowthByMonth}
      transactions={transactions}
      trafficReservePercent={trafficReservePercent}
    />
  )
}
