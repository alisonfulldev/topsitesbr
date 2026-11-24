// WhatsApp pela Telnyx (provedor oficial, sem mensalidade, com coexistência: o número segue no app).
// Docs: developers.telnyx.com/docs/messaging/whatsapp (send-messages, coexistence, manage-templates)
//
// Variáveis: WHATSAPP_PROVIDER=telnyx, TELNYX_API_KEY, TELNYX_PUBLIC_KEY (webhooks),
//            TELNYX_WHATSAPP_FROM (número no formato +5518996742364)

import { createPublicKey, verify } from 'crypto'

const API = 'https://api.telnyx.com/v2'

export function telnyxConfigured() {
  return !!process.env.TELNYX_API_KEY && !!process.env.TELNYX_WHATSAPP_FROM
}

export class TelnyxError extends Error {
  constructor(message: string, public code?: string) {
    super(message)
  }
}

async function request(method: 'GET' | 'POST', path: string, body?: unknown): Promise<Record<string, unknown>> {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { Authorization: `Bearer ${process.env.TELNYX_API_KEY}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(20_000),
  })
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>
  if (!res.ok) {
    const err = ((data.errors as { code?: string; title?: string; detail?: string }[] | undefined) ?? [])[0]
    throw new TelnyxError(err ? `${err.code ?? ''} ${err.title ?? ''}${err.detail ? ' — ' + err.detail : ''}`.trim() : `HTTP ${res.status}`, err?.code)
  }
  return data
}

const e164 = (digits: string) => (digits.startsWith('+') ? digits : '+' + digits)

async function sendWhatsapp(to: string, whatsappMessage: Record<string, unknown>) {
  if (!telnyxConfigured()) throw new TelnyxError('Telnyx não configurada (TELNYX_API_KEY / TELNYX_WHATSAPP_FROM)')
  const data = await request('POST', '/messages/whatsapp', {
    from: process.env.TELNYX_WHATSAPP_FROM,
    to: e164(to),
    whatsapp_message: whatsappMessage,
  })
  return ((data.data as { id?: string } | undefined)?.id) ?? null
}

export function telnyxSendText(to: string, body: string) {
  return sendWhatsapp(to, { type: 'text', text: { body, preview_url: true } })
}

export function telnyxSendTemplate(to: string, name: string, language: string, params: string[]) {
  return sendWhatsapp(to, {
    type: 'template',
    template: {
      name,
      language: { policy: 'deterministic', code: language },
      ...(params.length ? { components: [{ type: 'body', parameters: params.map((text) => ({ type: 'text', text })) }] } : {}),
    },
  })
}

// ── Modelos (Meta aprova em 24-48h; a Telnyx expõe o status) ───────────────

export interface TemplateDraft {
  name: string
  category: 'MARKETING' | 'UTILITY'
  language: string
  body: string
  examples: string[]
  quickReplies?: string[]
}

export function telnyxCreateTemplate(t: TemplateDraft) {
  return request('POST', '/whatsapp/message_templates', {
    name: t.name,
    category: t.category,
    language: t.language,
    components: [
      { type: 'BODY', text: t.body, example: { body_text: [t.examples] } },
      ...(t.quickReplies?.length ? [{ type: 'BUTTONS', buttons: t.quickReplies.map((text) => ({ type: 'QUICK_REPLY', text })) }] : []),
    ],
  })
}

export async function telnyxListTemplates() {
  const data = await request('GET', '/whatsapp/message_templates')
  return (data.data as { id: string; name: string; status: string; language?: string; quality_rating?: string }[] | undefined) ?? []
}

// ── Assinatura dos webhooks: Ed25519 sobre "{timestamp}|{corpo}" ────────────

const ED25519_SPKI_PREFIX = Buffer.from('302a300506032b6570032100', 'hex')
const TOLERANCE_SECONDS = 5 * 60

export function verifyTelnyxSignature(rawBody: string, signatureB64: string | null, timestamp: string | null, publicKeyB64: string, now = Date.now()) {
  if (!signatureB64 || !timestamp) return false
  if (Math.abs(now / 1000 - Number(timestamp)) > TOLERANCE_SECONDS) return false
  try {
    const raw = Buffer.from(publicKeyB64, 'base64')
    const key = createPublicKey({ key: raw.length === 32 ? Buffer.concat([ED25519_SPKI_PREFIX, raw]) : raw, format: 'der', type: 'spki' })
    return verify(null, Buffer.from(`${timestamp}|${rawBody}`), key, Buffer.from(signatureB64, 'base64'))
  } catch {
    return false
  }
}
