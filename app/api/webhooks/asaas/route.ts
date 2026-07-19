import { NextRequest, NextResponse } from 'next/server'
import { validateAsaasWebhook } from '@/lib/integrations/asaas'
import {
  handlePaymentReceived,
  handlePaymentOverdue,
} from '@/lib/payments/webhook-handlers'

// Payload enviado pelo Asaas em cada evento
interface AsaasWebhookPayload {
  event: string
  payment?: { id: string }
}

export async function GET() {
  return NextResponse.json({ ok: true })
}

export async function POST(req: NextRequest) {
  const token = req.headers.get('asaas-access-token') ?? ''
  // Sem token = health check do Asaas; token errado = rejeitar
  if (token && !validateAsaasWebhook(token)) {
    return NextResponse.json({ error: 'Token inválido.' }, { status: 401 })
  }

  let body: AsaasWebhookPayload
  try {
    body = (await req.json()) as AsaasWebhookPayload
  } catch {
    return NextResponse.json({ error: 'Payload inválido.' }, { status: 400 })
  }

  const { event, payment } = body

  // Evento sem payment (ex: teste de verificação do Asaas) — retorna 200 para não pausar a fila
  if (!event || !payment?.id) {
    return NextResponse.json({ ok: true, message: 'Evento recebido.' })
  }

  const chargeId = payment.id

  // PAYMENT_CONFIRMED = boleto confirmado (D+1/D+2); PAYMENT_RECEIVED = Pix/cartão em tempo real
  if (event === 'PAYMENT_RECEIVED' || event === 'PAYMENT_CONFIRMED') {
    const result = await handlePaymentReceived(chargeId)
    return NextResponse.json(result, { status: result.ok ? 200 : 404 })
  }

  if (event === 'PAYMENT_OVERDUE') {
    const result = await handlePaymentOverdue(chargeId)
    return NextResponse.json(result, { status: result.ok ? 200 : 404 })
  }

  // Outros eventos (PAYMENT_CREATED, etc.) — retorna 200 para o Asaas não retentar
  return NextResponse.json({ ok: true, message: `Evento ${event} recebido e ignorado.` })
}
