'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function deleteFinanceiroEntry(
  type: 'order' | 'cost' | 'extra_revenue' | 'site_revenue',
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
  } else if (type === 'extra_revenue') {
    await prisma.extraRevenue.delete({ where: { id } })
  } else if (type === 'site_revenue') {
    // Nullify the entry fee on the client record (client itself is preserved)
    await prisma.client.update({ where: { id }, data: { siteEntryFee: null } })
  } else {
    return { error: 'Tipo inválido.' }
  }

  revalidatePath('/admin/financeiro')
  return { success: true }
}

export async function updateSystemSetting(
  key: string,
  value: string,
): Promise<{ error?: string; success?: boolean }> {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') {
    return { error: 'Acesso não autorizado.' }
  }
  await prisma.systemSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  })
  revalidatePath('/admin/financeiro')
  return { success: true }
}
