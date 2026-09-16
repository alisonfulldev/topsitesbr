import { prisma } from '@/lib/prisma'
import { AssinaturasClient } from './_components/AssinaturasClient'

export const metadata = { title: 'Assinaturas — Admin' }

export default async function AssinaturasPage() {
  const subs = await prisma.subscription.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      client: { select: { id: true, name: true } },
      plan: { select: { name: true, price: true } },
    },
  })

  const rows = subs.map((s) => ({
    id: s.id,
    clientId: s.client.id,
    clientName: s.client.name,
    planName: s.plan.name,
    planPrice: Number(s.plan.price),
    status: s.status,
    nextDueDate: s.nextDueDate?.toISOString() ?? null,
    asaasSubscriptionId: s.asaasSubscriptionId,
    createdAt: s.createdAt.toISOString(),
  }))

  const total = rows.length
  const active = rows.filter((r) => r.status === 'active').length
  const noAsaas = rows.filter((r) => !r.asaasSubscriptionId).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Assinaturas</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {total} total · {active} ativas · {noAsaas > 0 ? `${noAsaas} sem Asaas (possíveis testes)` : 'todas com registro Asaas'}
        </p>
      </div>

      <AssinaturasClient rows={rows} />
    </div>
  )
}
