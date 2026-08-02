'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function deleteFinanceiroEntry(
  type: 'order' | 'cost',
  id: string,
): Promise<{ error?: string; success?: boolean }> {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') {
    return { error: 'Acesso não autorizado.' }
  }

  if (type === 'order') {
    // Null out proposal.orderId before deleting to avoid FK constraint
    await prisma.proposal.updateMany({
      where: { orderId: id },
      data: { orderId: null },
    })
    await prisma.order.delete({ where: { id } })
  } else if (type === 'cost') {
    await prisma.cost.delete({ where: { id } })
  } else {
    return { error: 'Tipo inválido.' }
  }

  revalidatePath('/admin/financeiro')
  return { success: true }
}
