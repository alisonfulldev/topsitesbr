import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getPageSpeedMetrics } from '@/lib/integrations/pagespeed'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })

  const url = req.nextUrl.searchParams.get('url')
  if (!url) return NextResponse.json({ ok: false, message: 'URL obrigatória' }, { status: 400 })

  const result = await getPageSpeedMetrics(url)
  return NextResponse.json(result)
}
