import { NextRequest, NextResponse } from 'next/server'
import { verifyTelnyxSignature } from '@/lib/whatsapp/telnyx'
import { handleTelnyxEvent } from '@/lib/whatsapp/webhook'

// Webhook da Telnyx (perfil de mensagens). Configure no portal: https://SEU_DOMINIO/api/webhooks/telnyx
// Assinatura Ed25519: cabeçalhos telnyx-signature-ed25519 e telnyx-timestamp; chave em TELNYX_PUBLIC_KEY
// (Portal → Keys & Credentials → Public Key). A Telnyx espera resposta 2xx em até 2 segundos.
export const maxDuration = 30

export async function POST(req: NextRequest) {
  const publicKey = process.env.TELNYX_PUBLIC_KEY
  if (!publicKey) return NextResponse.json({ error: 'Webhook não configurado' }, { status: 503 })

  const body = await req.text()
  const ok = verifyTelnyxSignature(body, req.headers.get('telnyx-signature-ed25519'), req.headers.get('telnyx-timestamp'), publicKey)
  if (!ok) return NextResponse.json({ error: 'Assinatura inválida' }, { status: 401 })

  try {
    await handleTelnyxEvent(JSON.parse(body))
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[webhooks/telnyx] erro:', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'Erro ao processar' }, { status: 500 })
  }
}
