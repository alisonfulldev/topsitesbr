import { NextRequest, NextResponse } from 'next/server'
import { processQueue } from '@/lib/prospecting/service'

export const maxDuration = 120

// Fila da prospecção. Na Vercel roda junto do cron diário de sync-subscriptions (9h de Brasília);
// esta rota fica disponível para um agendador externo, se um dia o volume pedir execuções mais frequentes.
export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const result = await processQueue()
    console.log('[cron/prospeccao]', result)
    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[cron/prospeccao] erro:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
