import { cookies } from 'next/headers'
import type { Session } from 'next-auth'
import { prisma } from '@/lib/prisma'

export const IMP_COOKIE = 'imp_id'
const TTL_MS = 4 * 60 * 60 * 1000 // 4 hours

export type ImpersonationContext = {
  logId: string
  adminId: string
  clientId: string
  clientName: string
}

/**
 * Reads the imp_id cookie and validates it against the DB.
 * Requires the caller to pass the already-fetched admin session to avoid
 * an extra getServerSession() call on every painel page.
 */
export async function getImpersonationContext(
  adminSession: Session,
): Promise<ImpersonationContext | null> {
  if (adminSession.user.role !== 'admin') return null

  const impId = cookies().get(IMP_COOKIE)?.value
  if (!impId) return null

  const cutoff = new Date(Date.now() - TTL_MS)
  const log = await prisma.impersonationLog.findFirst({
    where: { id: impId, endedAt: null, startedAt: { gte: cutoff } },
    select: { id: true, adminId: true, clientId: true },
  })
  if (!log) return null

  // Verify the log belongs to the current admin
  const adminUser = await prisma.user.findUnique({
    where: { email: adminSession.user.email! },
    select: { id: true },
  })
  if (!adminUser || adminUser.id !== log.adminId) return null

  const client = await prisma.client.findUnique({
    where: { id: log.clientId },
    select: { name: true },
  })

  return {
    logId: log.id,
    adminId: log.adminId,
    clientId: log.clientId,
    clientName: client?.name ?? '(cliente)',
  }
}

/**
 * Resolves the effective clientId for a painel page.
 * Works for both normal client sessions and admin-impersonating sessions.
 */
export async function resolveClientId(session: Session | null): Promise<{
  clientId: string
  isImpersonating: boolean
  impLogId?: string
  impClientName?: string
} | null> {
  if (!session) return null

  if (session.user.role === 'admin') {
    const imp = await getImpersonationContext(session)
    if (!imp) return null
    return {
      clientId: imp.clientId,
      isImpersonating: true,
      impLogId: imp.logId,
      impClientName: imp.clientName,
    }
  }

  if (session.user.role !== 'client') return null

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { clientId: true },
  })
  if (!user?.clientId) return null

  return { clientId: user.clientId, isImpersonating: false }
}

/**
 * Throws if the current request is an impersonation session.
 * Use at the top of any mutating server action in /painel.
 */
export async function assertNotImpersonating(): Promise<void> {
  const impId = cookies().get(IMP_COOKIE)?.value
  if (impId) {
    throw new Error(
      'Esta ação não está disponível durante uma sessão de visualização de suporte.',
    )
  }
}
