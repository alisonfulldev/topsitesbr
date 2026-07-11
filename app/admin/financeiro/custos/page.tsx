import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { CostRow, CustosPageClient } from './_components/CustosPageClient'
import Link from 'next/link'

async function generateRecurringCostsForCurrentMonth(): Promise<number> {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

  const recurringCosts = await prisma.cost.findMany({
    where: { isRecurring: true },
    orderBy: { costDate: 'desc' },
  })

  const processed = new Set<string>()
  let generated = 0

  for (const cost of recurringCosts) {
    const key = `${cost.category}:${cost.description}`
    if (processed.has(key)) continue
    processed.add(key)

    if (cost.recurrenceFrequency === 'anual') continue

    const existsThisMonth = await prisma.cost.findFirst({
      where: {
        category: cost.category,
        description: cost.description,
        isRecurring: true,
        costDate: { gte: startOfMonth, lte: endOfMonth },
      },
    })

    if (!existsThisMonth) {
      await prisma.cost.create({
        data: {
          category: cost.category,
          description: cost.description,
          amount: cost.amount,
          costDate: startOfMonth,
          isRecurring: true,
          recurrenceFrequency: cost.recurrenceFrequency,
        },
      })
      generated++
    }
  }

  return generated
}

export default async function AdminCustosPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') redirect('/login')

  const generatedCount = await generateRecurringCostsForCurrentMonth()

  const costs = await prisma.cost.findMany({
    orderBy: { costDate: 'desc' },
  })

  const rows: CostRow[] = costs.map((c) => ({
    id: c.id,
    category: c.category,
    description: c.description,
    amount: Number(c.amount),
    costDate: c.costDate.toISOString(),
    isRecurring: c.isRecurring,
    recurrenceFrequency: c.recurrenceFrequency,
  }))

  const totalMonth = rows
    .filter((c) => {
      const now = new Date()
      const month = c.costDate.slice(0, 7)
      return month === `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    })
    .reduce((a, c) => a + c.amount, 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Link href="/admin/financeiro" className="hover:text-brand-text">
              Financeiro
            </Link>
            <span>/</span>
            <span className="text-gray-800">Custos</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Cadastro de Custos</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {rows.length} registro{rows.length !== 1 ? 's' : ''} — mês atual:{' '}
            <span className="font-medium text-gray-700">
              {totalMonth.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </p>
        </div>
      </div>

      <CustosPageClient costs={rows} generatedCount={generatedCount} />
    </div>
  )
}
