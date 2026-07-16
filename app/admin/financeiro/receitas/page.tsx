import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ReceitasPageClient, type RevenueRow } from './_components/ReceitasPageClient'

export default async function AdminReceitasPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') redirect('/login')

  const revenues = await prisma.extraRevenue.findMany({
    orderBy: { revenueDate: 'desc' },
  })

  const rows: RevenueRow[] = revenues.map((r) => ({
    id: r.id,
    category: r.category,
    description: r.description,
    amount: Number(r.amount),
    revenueDate: r.revenueDate.toISOString(),
  }))

  const now = new Date()
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const totalMonth = rows
    .filter((r) => r.revenueDate.slice(0, 7) === currentMonth)
    .reduce((a, r) => a + r.amount, 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Link href="/admin/financeiro" className="hover:text-brand-text">
              Financeiro
            </Link>
            <span>/</span>
            <span className="text-gray-800">Receitas Avulsas</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Receitas Avulsas</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {rows.length} registro{rows.length !== 1 ? 's' : ''} — mês atual:{' '}
            <span className="font-medium text-gray-700">
              {totalMonth.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </p>
        </div>
      </div>

      <ReceitasPageClient revenues={rows} />
    </div>
  )
}
