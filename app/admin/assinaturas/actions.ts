'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function deleteSubscription(
  subscriptionId: string,
): Promise<{ error?: string; success?: boolean }> {
  const sub = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
    select: { id: true },
  })
  if (!sub) return { error: 'Assinatura não encontrada.' }

  await prisma.$transaction([
    prisma.invoice.deleteMany({ where: { subscriptionId } }),
    prisma.subscription.delete({ where: { id: subscriptionId } }),
  ])

  revalidatePath('/admin/assinaturas')
  return { success: true }
}

/** Subtrai N meses do nextDueDate de uma assinatura específica */
export async function shiftDueDate(
  subscriptionId: string,
  months: number,
): Promise<{ error?: string; newDate?: string }> {
  const sub = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
    select: { nextDueDate: true },
  })
  if (!sub) return { error: 'Assinatura não encontrada.' }
  if (!sub.nextDueDate) return { error: 'Assinatura sem data de vencimento.' }

  const d = new Date(sub.nextDueDate)
  d.setMonth(d.getMonth() + months)

  await prisma.subscription.update({
    where: { id: subscriptionId },
    data: { nextDueDate: d },
  })

  revalidatePath('/admin/assinaturas')
  revalidatePath('/painel/assinatura')
  return { newDate: d.toISOString() }
}

/** Subtrai 1 mês de TODAS as assinaturas ativas/pendentes (correção em lote) */
export async function shiftAllDueDates(
  months: number,
): Promise<{ error?: string; count?: number }> {
  const subs = await prisma.subscription.findMany({
    where: {
      status: { in: ['active', 'pending'] },
      nextDueDate: { not: null },
    },
    select: { id: true, nextDueDate: true },
  })

  if (subs.length === 0) return { count: 0 }

  await prisma.$transaction(
    subs.map((s) => {
      const d = new Date(s.nextDueDate!)
      d.setMonth(d.getMonth() + months)
      return prisma.subscription.update({ where: { id: s.id }, data: { nextDueDate: d } })
    }),
  )

  revalidatePath('/admin/assinaturas')
  revalidatePath('/painel/assinatura')
  return { count: subs.length }
}
