'use server'

import { prisma } from '@/lib/prisma'
import { verifyPaymentToken } from '@/lib/pix-payment-link'
import { getMonthlyPix, type MonthlyPix } from '@/lib/monthly-plan-service'

/** Polling da página pública de pagamento: devolve o Pix atual (gera outro se expirou). */
export async function checkPublicPixAction(token: string): Promise<{ pix: MonthlyPix | null; paid: boolean }> {
  const subscriptionId = verifyPaymentToken(token)
  if (!subscriptionId) return { pix: null, paid: false }
  const sub = await prisma.subscription.findUnique({ where: { id: subscriptionId }, select: { clientId: true } })
  if (!sub) return { pix: null, paid: false }
  const pix = await getMonthlyPix(sub.clientId).catch(() => null)
  return { pix, paid: pix?.status === 'ACTIVE' }
}
