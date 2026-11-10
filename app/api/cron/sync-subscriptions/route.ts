import { NextRequest, NextResponse } from 'next/server'
import { syncSubscriptionStatuses } from '@/lib/payments/sync'
import { processPixAutomaticCycles } from '@/lib/monthly-plan-service'
import { processQueue } from '@/lib/prospecting/service'

export const maxDuration = 120

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await syncSubscriptionStatuses()
    console.log('[cron/sync-subscriptions]', result)

    // Novos clientes do Site no Ar: Pix da mensalidade (com débito automático) e atrasos
    const pixCycles = await processPixAutomaticCycles().catch((err) => ({ error: err instanceof Error ? err.message : String(err) }))
    console.log('[cron/sync-subscriptions] pix automático', pixCycles)

    // Este cron roda às 9h de Brasília, no início da janela de envio: aproveita para disparar a fila da prospecção.
    // Uma falha na prospecção não derruba a sincronização das assinaturas.
    const prospecting = await processQueue().catch((err) => ({ error: err instanceof Error ? err.message : String(err) }))
    console.log('[cron/sync-subscriptions] prospecção', prospecting)

    return NextResponse.json({ ok: true, ...result, pixCycles, prospecting })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[cron/sync-subscriptions] erro:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
