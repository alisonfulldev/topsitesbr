import { NextRequest, NextResponse } from 'next/server'
import { runWhatsappAi } from '@/lib/whatsapp/engine'

export const maxDuration = 120

// Rodada da IA do WhatsApp (respostas, classificação, follow-ups, campanhas). Roda a cada minuto (deploy/crontab).
export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const result = await runWhatsappAi()
    const busy = result.respostas + result.classificados + result.followUps + result.ofertas + result.erros
    if (busy) console.log('[cron/whatsapp-ia]', result)
    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[cron/whatsapp-ia] erro:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
