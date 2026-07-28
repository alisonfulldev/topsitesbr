import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { siteId, path, referrer, sessionId } = body

    if (!siteId || typeof siteId !== 'string' || !sessionId || typeof sessionId !== 'string') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400, headers: CORS })
    }

    // Verify site exists (avoids phantom data)
    const site = await prisma.site.findUnique({ where: { id: siteId }, select: { id: true } })
    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404, headers: CORS })
    }

    await prisma.pageView.create({
      data: {
        siteId,
        path: typeof path === 'string' ? path.slice(0, 500) : '/',
        referrer: typeof referrer === 'string' && referrer ? referrer.slice(0, 1000) : null,
        sessionId: sessionId.slice(0, 100),
      },
    })

    // Probabilistic cleanup: ~1% of requests delete data older than 30 days (no cron needed)
    if (Math.random() < 0.01) {
      const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      prisma.pageView.deleteMany({ where: { timestamp: { lt: cutoff } } }).catch(() => {})
    }

    return NextResponse.json({ ok: true }, { headers: CORS })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500, headers: CORS })
  }
}
