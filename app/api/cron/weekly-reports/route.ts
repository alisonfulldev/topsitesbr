import { NextRequest, NextResponse } from 'next/server'
import { generateReportsForAllClients } from '@/lib/reports'

// Vercel allows up to 300s for Pro/Enterprise plans
export const maxDuration = 300

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await generateReportsForAllClients()
    console.log('[cron/weekly-reports]', result)
    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[cron/weekly-reports] erro:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
