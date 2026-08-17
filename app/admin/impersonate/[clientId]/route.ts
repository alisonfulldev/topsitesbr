import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { IMP_COOKIE } from '@/lib/impersonation'

export async function GET(
  request: NextRequest,
  { params }: { params: { clientId: string } },
) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const adminUser = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { id: true },
  })
  if (!adminUser) return NextResponse.redirect(new URL('/login', request.url))

  const client = await prisma.client.findUnique({
    where: { id: params.clientId },
    select: { id: true },
  })
  if (!client) {
    return NextResponse.redirect(new URL('/admin/clientes', request.url))
  }

  const log = await prisma.impersonationLog.create({
    data: { adminId: adminUser.id, clientId: client.id },
  })

  const response = NextResponse.redirect(new URL('/painel', request.url))
  response.cookies.set(IMP_COOKIE, log.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/painel',
    maxAge: 4 * 60 * 60,
  })
  return response
}
