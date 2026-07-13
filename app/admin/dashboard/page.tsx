import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { DashboardCharts } from './_components/DashboardCharts'

function fmtBRL(n: number) {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') redirect('/login')

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [
    activeSubscriptions,
    openTickets,
    referralsThisMonth,
    totalClients,
    upsellClients,
    allClientsForLtv,
  ] = await Promise.all([
    prisma.subscription.findMany({
      where: { status: 'active' },
      include: { plan: true },
      orderBy: { createdAt: 'desc' },
      distinct: ['clientId'],
    }),
    prisma.ticket.count({ where: { status: { in: ['open', 'in_progress'] } } }),
    prisma.referral.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.client.count(),
    prisma.order.findMany({
      where: { status: 'paid' },
      select: { clientId: true },
      distinct: ['clientId'],
    }),
    prisma.client.findMany({
      select: {
        id: true,
        subscriptions: {
          include: {
            invoices: { where: { status: 'paid' }, select: { amount: true } },
          },
        },
        orders: { where: { status: 'paid' }, select: { amount: true } },
      },
    }),
  ])

  const mrr = activeSubscriptions.reduce((acc, s) => acc + Number(s.plan.price), 0)
  const subscribedClientCount = new Set(activeSubscriptions.map((s) => s.clientId)).size
  const upsellCount = upsellClients.length

  const planMap: Record<string, { name: string; count: number }> = {}
  for (const s of activeSubscriptions) {
    if (!planMap[s.plan.name]) planMap[s.plan.name] = { name: s.plan.name, count: 0 }
    planMap[s.plan.name].count++
  }
  const clientsPerPlan = Object.values(planMap)

  let ltvTotal = 0
  let ltvCount = 0
  for (const c of allClientsForLtv) {
    const inv = c.subscriptions
      .flatMap((s) => s.invoices)
      .reduce((a, i) => a + Number(i.amount), 0)
    const ord = c.orders.reduce((a, o) => a + Number(o.amount), 0)
    const total = inv + ord
    if (total > 0) {
      ltvTotal += total
      ltvCount++
    }
  }
  const avgLtv = ltvCount > 0 ? ltvTotal / ltvCount : 0

  const funnelData = [
    { name: 'Cadastrados', value: totalClients },
    { name: 'Assinantes', value: subscribedClientCount },
    { name: 'Com Upsell', value: upsellCount },
  ]

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Dashboard</h2>
        <p className="text-sm text-gray-500 mt-0.5">Visão geral do negócio</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">MRR</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{fmtBRL(mrr)}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {subscribedClientCount} assinatura{subscribedClientCount !== 1 ? 's' : ''} ativa
            {subscribedClientCount !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">LTV Médio</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{fmtBRL(avgLtv)}</p>
          <p className="text-xs text-gray-400 mt-0.5">por cliente pagante</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Tickets em Aberto
          </p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{openTickets}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {openTickets !== 1 ? 'solicitações' : 'solicitação'} pendente{openTickets !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Indicações no Mês
          </p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{referralsThisMonth}</p>
          <p className="text-xs text-gray-400 mt-0.5">confirmadas</p>
        </div>
      </div>

      <DashboardCharts clientsPerPlan={clientsPerPlan} funnelData={funnelData} />
    </div>
  )
}
