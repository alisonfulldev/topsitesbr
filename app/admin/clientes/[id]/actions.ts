'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { IMP_COOKIE } from '@/lib/impersonation'

export async function startImpersonationAction(
  clientId: string,
  clientName: string,
): Promise<void> {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') {
    throw new Error('Acesso negado.')
  }

  const adminUser = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { id: true },
  })
  if (!adminUser) throw new Error('Usuário admin não encontrado.')

  // Verify the target client exists
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { id: true },
  })
  if (!client) throw new Error('Cliente não encontrado.')

  const log = await prisma.impersonationLog.create({
    data: { adminId: adminUser.id, clientId },
  })

  cookies().set(IMP_COOKIE, log.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/painel',
    maxAge: 4 * 60 * 60, // 4 hours
  })

  redirect('/painel')
}

export async function stopImpersonationAction(): Promise<void> {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') {
    throw new Error('Acesso negado.')
  }

  const impId = cookies().get(IMP_COOKIE)?.value

  let clientId: string | undefined
  if (impId) {
    const log = await prisma.impersonationLog.findUnique({
      where: { id: impId },
      select: { clientId: true },
    })
    clientId = log?.clientId
    await prisma.impersonationLog.updateMany({
      where: { id: impId, endedAt: null },
      data: { endedAt: new Date() },
    })
  }

  cookies().delete({ name: IMP_COOKIE, path: '/painel' })

  redirect(clientId ? `/admin/clientes/${clientId}` : '/admin/clientes')
}
