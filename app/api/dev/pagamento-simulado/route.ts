import { NextRequest, NextResponse } from 'next/server'
import {
  handlePaymentReceived,
  handlePaymentOverdue,
} from '@/lib/payments/webhook-handlers'

// Dev-only endpoint — disable in production via middleware or env guard
export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  const { chargeId, event } = await req.json()

  if (!chargeId || !event) {
    return NextResponse.json({ error: 'chargeId e event são obrigatórios' }, { status: 400 })
  }

  let result: { ok: boolean; message: string }

  if (event === 'PAYMENT_RECEIVED') {
    result = await handlePaymentReceived(chargeId)
  } else if (event === 'PAYMENT_OVERDUE') {
    result = await handlePaymentOverdue(chargeId)
  } else {
    return NextResponse.json({ error: `Evento desconhecido: ${event}` }, { status: 400 })
  }

  return NextResponse.json(result, { status: result.ok ? 200 : 404 })
}
