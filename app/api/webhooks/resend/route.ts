import { createHmac, timingSafeEqual } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { handleResendEvent } from '@/lib/prospecting/service'

// Webhook do Resend (assinado via Svix). Eventos: delivered, opened, clicked, bounced, complained.
// RESEND_WEBHOOK_SECRET é o "Signing secret" (whsec_...) mostrado ao criar o webhook no painel do Resend.
const TOLERANCE_SECONDS = 5 * 60

function verifySignature(body: string, headers: Headers, secret: string) {
  const id = headers.get('svix-id')
  const timestamp = headers.get('svix-timestamp')
  const signatures = headers.get('svix-signature')
  if (!id || !timestamp || !signatures) return false
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > TOLERANCE_SECONDS) return false

  const key = Buffer.from(secret.replace(/^whsec_/, ''), 'base64')
  const expected = createHmac('sha256', key).update(`${id}.${timestamp}.${body}`).digest()
  return signatures.split(' ').some((entry) => {
    const [, signature] = entry.split(',')
    if (!signature) return false
    const received = Buffer.from(signature, 'base64')
    return received.length === expected.length && timingSafeEqual(received, expected)
  })
}

export async function POST(req: NextRequest) {
  const secret = process.env.RESEND_WEBHOOK_SECRET
  if (!secret) return NextResponse.json({ error: 'Webhook não configurado' }, { status: 503 })

  const body = await req.text()
  if (!verifySignature(body, req.headers, secret)) {
    return NextResponse.json({ error: 'Assinatura inválida' }, { status: 401 })
  }

  try {
    await handleResendEvent(JSON.parse(body))
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[webhooks/resend] erro:', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'Erro ao processar' }, { status: 500 })
  }
}
