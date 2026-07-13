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

export async function POST(req: NextRequest) {
  // O Asaas envia o token no header "asaas-access-token"
  const token = req.headers.get('asaas-access-token') ?? ''
  if (!validateAsaasWebhook(token)) {
    return NextResponse.json({ error: 'Token inválido.' }, { status: 401 })
  }

  let body: AsaasWebhookPayload
  try {
    body = (await req.json()) as AsaasWebhookPayload
  } catch {
    return NextResponse.json({ error: 'Payload inválido.' }, { status: 400 })
  }

  const { event, payment } = body

  if (!event || !payment?.id) {
    return NextResponse.json({ error: 'Campos event e payment.id são obrigatórios.' }, { status: 400 })
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
