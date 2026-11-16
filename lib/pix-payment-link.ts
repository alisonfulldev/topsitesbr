import { createHmac, timingSafeEqual } from 'crypto'
import { SITE_URL } from '@/lib/marketing'

// Link público de pagamento da mensalidade por Pix (/pagar/<token>), sem login.
// O token é o id da assinatura assinado com HMAC: só o sistema gera links válidos.

const BASE_URL = (process.env.NEXT_PUBLIC_APP_URL || SITE_URL).replace(/\/$/, '')

function secret() {
  const key = process.env.NEXTAUTH_SECRET
  if (!key) throw new Error('NEXTAUTH_SECRET ausente — não é possível assinar o link de pagamento.')
  return key
}

function sign(subscriptionId: string) {
  return createHmac('sha256', secret()).update(`pix-payment:${subscriptionId}`).digest('base64url').slice(0, 32)
}

export function paymentToken(subscriptionId: string) {
  return `${Buffer.from(subscriptionId).toString('base64url')}.${sign(subscriptionId)}`
}

export function paymentLink(subscriptionId: string) {
  return `${BASE_URL}/pagar/${paymentToken(subscriptionId)}`
}

/** Devolve o id da assinatura se o token for válido; senão, null. */
export function verifyPaymentToken(token: string): string | null {
  const [encoded, signature] = token.split('.')
  if (!encoded || !signature) return null
  let subscriptionId: string
  try {
    subscriptionId = Buffer.from(encoded, 'base64url').toString('utf8')
  } catch {
    return null
  }
  const expected = sign(subscriptionId)
  if (expected.length !== signature.length) return null
  return timingSafeEqual(Buffer.from(expected), Buffer.from(signature)) ? subscriptionId : null
}
