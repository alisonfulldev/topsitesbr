'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

async function assertAdmin() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') throw new Error('Não autorizado.')
}

export async function markAdminNotificationRead(id: string): Promise<void> {
  await assertAdmin()
  await prisma.notification.updateMany({
    where: { id, clientId: null },
    data: { read: true },
  })
  revalidatePath('/admin')
  revalidatePath('/admin/notificacoes')
}

export async function markAllAdminNotificationsRead(): Promise<void> {
  await assertAdmin()
  await prisma.notification.updateMany({
    where: { clientId: null, read: false },
    data: { read: true },
  })
  revalidatePath('/admin')
  revalidatePath('/admin/notificacoes')
}
