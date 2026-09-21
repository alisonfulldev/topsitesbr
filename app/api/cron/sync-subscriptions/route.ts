import { NextRequest, NextResponse } from 'next/server'
import { syncSubscriptionStatuses } from '@/lib/payments/sync'

export const maxDuration = 120

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await syncSubscriptionStatuses()
    console.log('[cron/sync-subscriptions]', result)
    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[cron/sync-subscriptions] erro:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
