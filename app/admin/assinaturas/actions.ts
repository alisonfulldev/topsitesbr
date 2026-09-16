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
