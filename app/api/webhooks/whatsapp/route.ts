import { createHmac, timingSafeEqual } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { handleWhatsappWebhook, type WaWebhookPayload } from '@/lib/whatsapp/webhook'

// Webhook da WhatsApp Cloud API.
// - Meta direto: configure a URL https://SEU_DOMINIO/api/webhooks/whatsapp, o "verify token" = WHATSAPP_VERIFY_TOKEN,
//   e WHATSAPP_APP_SECRET (chave secreta do app) para validar a assinatura X-Hub-Signature-256.
// - 360dialog (não assina): use https://SEU_DOMINIO/api/webhooks/whatsapp?token=WHATSAPP_WEBHOOK_TOKEN
export const maxDuration = 60

// Verificação da Meta ao cadastrar o webhook
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams
  const expected = process.env.WHATSAPP_VERIFY_TOKEN
  if (expected && params.get('hub.mode') === 'subscribe' && params.get('hub.verify_token') === expected) {
    return new NextResponse(params.get('hub.challenge') ?? '', { status: 200, headers: { 'Content-Type': 'text/plain' } })
  }
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

function safeEqual(a: string, b: string) {
  const ba = Buffer.from(a)
  const bb = Buffer.from(b)
  return ba.length === bb.length && timingSafeEqual(ba, bb)
}

function authorized(req: NextRequest, body: string) {
  const appSecret = process.env.WHATSAPP_APP_SECRET
  if (appSecret) {
    const signature = req.headers.get('x-hub-signature-256') ?? ''
    const expected = 'sha256=' + createHmac('sha256', appSecret).update(body).digest('hex')
    return safeEqual(signature, expected)
  }
  const token = process.env.WHATSAPP_WEBHOOK_TOKEN
  if (token) return safeEqual(req.nextUrl.searchParams.get('token') ?? '', token)
  return null // nada configurado
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const ok = authorized(req, body)
  if (ok === null) return NextResponse.json({ error: 'Webhook não configurado' }, { status: 503 })
  if (!ok) return NextResponse.json({ error: 'Assinatura inválida' }, { status: 401 })

  let payload: WaWebhookPayload
  try {
    payload = JSON.parse(body)
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  try {
    await handleWhatsappWebhook(payload)
    return NextResponse.json({ ok: true })
  } catch (err) {
    // 500 faz a Meta reenviar depois; as mensagens são gravadas sem duplicar (id único)
    console.error('[webhooks/whatsapp] erro:', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'Erro ao processar' }, { status: 500 })
  }
}
