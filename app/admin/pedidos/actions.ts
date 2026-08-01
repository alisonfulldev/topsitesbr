'use server'

import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') redirect('/login')
}

export async function markOrderDelivered(orderId: string) {
  await requireAdmin()
  await prisma.order.update({
    where: { id: orderId },
    data: { status: 'delivered' },
  })
  revalidatePath('/admin/pedidos')
}
