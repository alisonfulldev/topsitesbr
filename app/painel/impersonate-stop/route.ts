import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { IMP_COOKIE } from '@/lib/impersonation'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const impId = request.cookies.get(IMP_COOKIE)?.value
  let clientId: string | null = null

  if (impId) {
    const log = await prisma.impersonationLog.findUnique({
      where: { id: impId },
      select: { id: true, clientId: true, adminId: true, endedAt: true },
    })

    if (log && !log.endedAt) {
      const adminUser = await prisma.user.findUnique({
        where: { email: session.user.email! },
        select: { id: true },
      })

      if (adminUser && adminUser.id === log.adminId) {
        clientId = log.clientId
        await prisma.impersonationLog.update({
          where: { id: impId },
          data: { endedAt: new Date() },
        })
      }
    }
  }

  const redirectUrl = clientId
    ? new URL(`/admin/clientes/${clientId}`, request.url)
    : new URL('/admin/clientes', request.url)

  const response = NextResponse.redirect(redirectUrl)
  response.cookies.set(IMP_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/painel',
    maxAge: 0,
  })
  return response
}
