'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendNotification } from '@/lib/notifications'
import { revalidatePath } from 'next/cache'

export async function marcarRecompensado(
  referralId: string,
): Promise<{ error?: string }> {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') return { error: 'Não autorizado.' }

  const referral = await prisma.referral.findUnique({
    where: { id: referralId },
    include: {
      referrerClient: { select: { id: true, name: true } },
      referredClient: { select: { name: true } },
    },
  })

  if (!referral) return { error: 'Indicação não encontrada.' }
  if (referral.status === 'recompensado') return { error: 'Indicação já foi recompensada.' }

  await prisma.referral.update({
    where: { id: referralId },
    data: { status: 'recompensado', rewardedAt: new Date() },
  })

  await sendNotification(
    referral.referrerClient.id,
    'Você ganhou 1 mês grátis!',
    `Você ganhou 1 mês grátis por indicar ${referral.referredClient.name}! O desconto será aplicado na sua próxima cobrança.`,
    'painel',
    'referral-reward',
  )

  revalidatePath('/admin/indicacoes')
  return {}
}
