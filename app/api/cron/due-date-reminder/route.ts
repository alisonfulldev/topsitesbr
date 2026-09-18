import { NextRequest, NextResponse } from 'next/server'
import { sendDueDateReminders } from '@/lib/reminders'

export const maxDuration = 120

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await sendDueDateReminders()
    console.log('[cron/due-date-reminder]', result)
    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[cron/due-date-reminder] erro:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
