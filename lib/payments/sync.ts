import { prisma } from '@/lib/prisma'
import { asaasFetch } from '@/lib/integrations/asaas'
import { handlePaymentReceived, handlePaymentOverdue } from '@/lib/payments/webhook-handlers'

interface AsaasCharge {
  id: string
  status: string
}

// Busca ativamente no Asaas o status das assinaturas cujo nextDueDate já passou
// mas ainda estão marcadas como 'active' ou 'pending' no banco — necessário quando
// o webhook do Asaas não chegou (ou chegou antes do invoice local existir).
export async function syncSubscriptionStatuses(): Promise<{ synced: number; errors: number }> {
  if (process.env.PAYMENT_DRIVER !== 'asaas') return { synced: 0, errors: 0 }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const subs = await prisma.subscription.findMany({
    where: {
      status: { in: ['active', 'pending'] },
      nextDueDate: { lt: today },
      asaasSubscriptionId: { not: null },
    },
    select: { id: true, asaasSubscriptionId: true },
  })

  let synced = 0
  let errors = 0

  for (const sub of subs) {
    try {
      const list = await asaasFetch<{ data: AsaasCharge[] }>(
        `/subscriptions/${sub.asaasSubscriptionId}/payments?limit=5&offset=0`,
      )

      for (const charge of list.data) {
        const existing = await prisma.invoice.findFirst({
          where: { asaasChargeId: charge.id },
          select: { id: true, status: true },
        })

        if (['RECEIVED', 'CONFIRMED', 'RECEIVED_IN_CASH'].includes(charge.status)) {
          if (!existing || existing.status !== 'paid') {
            await handlePaymentReceived(charge.id)
            synced++
            break
          }
        } else if (charge.status === 'OVERDUE') {
          if (!existing || existing.status === 'pending') {
            await handlePaymentOverdue(charge.id)
            synced++
            break
          }
        }
      }
    } catch {
      errors++
    }
  }

  return { synced, errors }
}
