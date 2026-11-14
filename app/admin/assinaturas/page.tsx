import { prisma } from '@/lib/prisma'
import { AssinaturasClient } from './_components/AssinaturasClient'
import { subscriptionPrice } from '@/lib/monthly-plan'
import { isPixMigrationEnabled } from '@/lib/monthly-plan-service'
import { PixMigrationCard } from './_components/PixMigrationCard'

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
    planPrice: subscriptionPrice(s),
    status: s.status,
    nextDueDate: s.nextDueDate?.toISOString() ?? null,
    asaasSubscriptionId: s.asaasSubscriptionId,
    createdAt: s.createdAt.toISOString(),
  }))

  const total = rows.length
  const active = rows.filter((r) => r.status === 'active').length
  // Sem assinatura no Asaas e sem Pix Automático: possíveis testes (o fluxo novo fica sem Asaas até o 1º Pix)
  const noAsaas = subs.filter((s) => !s.asaasSubscriptionId && s.customPrice == null && !s.pixAutomaticAuthorizationId).length
  const migrationEnabled = await isPixMigrationEnabled()
  const legacyRemaining = subs.filter((s) => s.status !== 'canceled' && s.asaasSubscriptionId && !s.pixAutomaticAuthorizationId).length
  const onPix = subs.filter((s) => s.status !== 'canceled' && (s.pixAutomaticAuthorizationId || s.customPrice != null)).length
  const mrr = rows
    .filter((r) => r.status === 'active' || r.status === 'pending')
    .reduce((sum, r) => sum + r.planPrice, 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end gap-4">
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-gray-900">Assinaturas</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {total} total · {active} ativas · {noAsaas > 0 ? `${noAsaas} sem Asaas (possíveis testes)` : 'todas com registro Asaas'}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl px-5 py-3 text-right shrink-0">
          <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">MRR</p>
          <p className="text-2xl font-bold text-gray-900">
            R$ {mrr.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">ativas + aguardando pagamento</p>
        </div>
      </div>

      <PixMigrationCard enabled={migrationEnabled} remaining={legacyRemaining} migrated={onPix} />

      <AssinaturasClient rows={rows} />
    </div>
  )
}
