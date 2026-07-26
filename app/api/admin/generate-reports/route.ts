import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { generateReportsForAllClients, sendWeeklyEmailToAllActiveClients } from '@/lib/reports'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const body = await req.json().catch(() => ({}))
  if (body.emailOnly) {
    const result = await sendWeeklyEmailToAllActiveClients()
    return NextResponse.json({ ok: true, ...result })
  }
  const result = await generateReportsForAllClients()
  return NextResponse.json({ ok: true, ...result })
}
