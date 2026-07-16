import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { DistribuicaoClient, type FixedCostRow, type RuleRow } from './_components/DistribuicaoClient'

function monthLabel(d: Date) {
  const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

export default async function DistribuicaoPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') redirect('/login')

  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

  const [fixedCosts, rules, paidInvoices, paidOrders, newClients, extraRevenues] = await Promise.all([
    prisma.allocationFixedCost.findMany({ orderBy: { order: 'asc' } }),
    prisma.allocationRule.findMany({ orderBy: { order: 'asc' } }),
    prisma.invoice.findMany({
      where: { status: 'paid', paidAt: { gte: start, lte: end } },
      select: { amount: true },
    }),
    prisma.order.findMany({
      where: { status: 'paid', createdAt: { gte: start, lte: end } },
      select: { amount: true },
    }),
    prisma.client.findMany({
      where: { createdAt: { gte: start, lte: end } },
      select: { siteEntryFee: true },
    }),
    prisma.extraRevenue.findMany({
      where: { revenueDate: { gte: start, lte: end } },
      select: { amount: true },
    }),
  ])

  const monthRevenue =
    paidInvoices.reduce((a, i) => a + Number(i.amount), 0) +
    paidOrders.reduce((a, o) => a + Number(o.amount), 0) +
    newClients.reduce((a, c) => a + (c.siteEntryFee != null ? Number(c.siteEntryFee) : 0), 0) +
    extraRevenues.reduce((a, e) => a + Number(e.amount), 0)

  const fixedRows: FixedCostRow[] = fixedCosts.map(c => ({
    id: c.id, name: c.name, amount: Number(c.amount), order: c.order,
  }))

  const ruleRows: RuleRow[] = rules.map(r => ({
    id: r.id, name: r.name, percent: Number(r.percent), color: r.color, order: r.order,
  }))

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
          <Link href="/admin/financeiro" className="hover:text-brand-text">Financeiro</Link>
          <span>/</span>
          <span className="text-gray-800">Distribuição</span>
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Distribuição de Receita</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Para onde vai cada real que entra — custos fixos e alocação do lucro
        </p>
      </div>

      <DistribuicaoClient
        fixedCosts={fixedRows}
        rules={ruleRows}
        monthRevenue={monthRevenue}
        monthLabel={monthLabel(now)}
      />
    </div>
  )
}
