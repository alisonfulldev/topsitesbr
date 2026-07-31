import { NextRequest, NextResponse } from 'next/server'
import { validateAsaasWebhook } from '@/lib/integrations/asaas'
import { sendNotification } from '@/lib/notifications'
import {
  handlePaymentReceived,
  handlePaymentOverdue,
  handleProposalPayment,
} from '@/lib/payments/webhook-handlers'

// Payload enviado pelo Asaas em cada evento
interface AsaasWebhookPayload {
  event: string
  payment?: { id: string; externalReference?: string }
}

export async function GET() {
  return NextResponse.json({ ok: true })
}

export async function POST(req: NextRequest) {
  const token = req.headers.get('asaas-access-token') ?? ''

  // Token presente mas inválido → rejeita. Sem token = health check do Asaas.
  if (token && !validateAsaasWebhook(token)) {
    console.warn('[webhook:asaas] Token inválido recebido.')
    return NextResponse.json({ error: 'Token inválido.' }, { status: 401 })
  }

  let body: AsaasWebhookPayload
  try {
    body = (await req.json()) as AsaasWebhookPayload
  } catch {
    // Corpo vazio ou inválido (ping de verificação do Asaas) — normal, ignora
    return NextResponse.json({ ok: true, message: 'Evento recebido.' })
  }

  const { event, payment } = body
  const chargeId = payment?.id ?? '(sem id)'
  const externalRef = payment?.externalReference ?? ''

  // Log de entrada — ajuda a identificar o tipo de evento que causou problemas
  console.log(`[webhook:asaas] evento=${event} chargeId=${chargeId} ref=${externalRef || '(vazio)'}`)

  // Evento sem payment relevante — normal para alguns tipos do Asaas
  if (!event || !payment?.id) {
    return NextResponse.json({ ok: true, message: 'Evento recebido.' })
  }

  try {
    // ── PAYMENT_RECEIVED / PAYMENT_CONFIRMED ──────────────────────────────────
    if (event === 'PAYMENT_RECEIVED' || event === 'PAYMENT_CONFIRMED') {
      let result: { ok: boolean; message: string }

      if (externalRef.startsWith('proposal:')) {
        const proposalId = externalRef.slice('proposal:'.length)
        result = await handleProposalPayment(proposalId, payment.id)
      } else {
        result = await handlePaymentReceived(payment.id)
      }

      if (!result.ok) {
        // Cobrança não encontrada no nosso banco — pode ser teste ou cobrança
        // criada diretamente no Asaas. Comportamento normal: logamos e ignoramos.
        console.log(`[webhook:asaas] cobrança desconhecida — ignorada. ${result.message}`)
      }

      return NextResponse.json({ ok: true, message: result.message })
    }

    // ── PAYMENT_OVERDUE ───────────────────────────────────────────────────────
    if (event === 'PAYMENT_OVERDUE') {
      const result = await handlePaymentOverdue(payment.id)

      if (!result.ok) {
        console.log(`[webhook:asaas] fatura desconhecida para overdue — ignorada. ${result.message}`)
      }

      return NextResponse.json({ ok: true, message: result.message })
    }

    // ── Outros eventos (PAYMENT_CREATED, SUBSCRIPTION_CREATED, etc.) ─────────
    console.log(`[webhook:asaas] evento não tratado — ignorado: ${event}`)
    return NextResponse.json({ ok: true, message: `Evento ${event} ignorado.` })

  } catch (err) {
    // ── Falha real no processamento de um evento aplicável ────────────────────
    // Respondemos 200 para não travar a fila, mas logamos e criamos notificação
    // interna para o admin não perder um pagamento real silenciosamente.
    const errMsg = err instanceof Error ? err.message : String(err)
    console.error(`[webhook:asaas] ERRO ao processar evento=${event} chargeId=${chargeId} ref=${externalRef}: ${errMsg}`)

    await sendNotification(
      null,
      `Falha ao processar webhook — verificar manualmente`,
      `Evento: ${event}\nCobrança: ${chargeId}\nReferência: ${externalRef || '(vazia)'}\nErro: ${errMsg}\n\nVerifique o pagamento diretamente no Asaas e processe manualmente se necessário.`,
    ).catch(() => {})

    return NextResponse.json({ ok: true, message: 'Evento recebido com erro interno — admin notificado.' })
  }
}
