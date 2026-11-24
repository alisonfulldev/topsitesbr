// Envio pela WhatsApp Cloud API — direto na Meta ou por um provedor oficial (360dialog),
// que usa o mesmo formato de mensagem. O número fica em coexistência: continua no app
// WhatsApp Business do celular e também na API.
//
// Variáveis de ambiente:
//   WHATSAPP_PROVIDER         meta (padrão) | 360dialog
//   WHATSAPP_TOKEN            token de acesso da Meta (System User) ou API key do 360dialog
//   WHATSAPP_PHONE_NUMBER_ID  ID do número na Meta (só provider meta)
//   WHATSAPP_GRAPH_VERSION    versão da Graph API (padrão v23.0)

type Provider = 'meta' | '360dialog'

function provider(): Provider {
  return process.env.WHATSAPP_PROVIDER === '360dialog' ? '360dialog' : 'meta'
}

export function whatsappConfigured() {
  if (!process.env.WHATSAPP_TOKEN) return false
  return provider() === '360dialog' || !!process.env.WHATSAPP_PHONE_NUMBER_ID
}

function endpoint(path: 'messages' | 'smb_app_data') {
  if (provider() === '360dialog') return `https://waba-v2.360dialog.io/${path}`
  const version = process.env.WHATSAPP_GRAPH_VERSION || 'v23.0'
  return `https://graph.facebook.com/${version}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/${path}`
}

function headers(): Record<string, string> {
  const token = process.env.WHATSAPP_TOKEN ?? ''
  return provider() === '360dialog'
    ? { 'D360-API-KEY': token, 'Content-Type': 'application/json' }
    : { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
}

export class WhatsAppApiError extends Error {
  constructor(message: string, public code?: number) {
    super(message)
  }
}

async function post(path: 'messages' | 'smb_app_data', body: unknown): Promise<Record<string, unknown>> {
  if (!whatsappConfigured()) throw new WhatsAppApiError('WhatsApp não configurado (WHATSAPP_TOKEN / WHATSAPP_PHONE_NUMBER_ID)')
  const res = await fetch(endpoint(path), {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(20_000),
  })
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>
  if (!res.ok) {
    const err = (data.error ?? {}) as { message?: string; code?: number; error_data?: { details?: string } }
    const detail = err.error_data?.details ? ` (${err.error_data.details})` : ''
    throw new WhatsAppApiError(`${err.message ?? `HTTP ${res.status}`}${detail}`, err.code)
  }
  return data
}

function messageId(data: Record<string, unknown>) {
  const messages = data.messages as { id?: string }[] | undefined
  return messages?.[0]?.id ?? null
}

export async function sendText(to: string, body: string) {
  const data = await post('messages', {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to,
    type: 'text',
    text: { preview_url: true, body },
  })
  return messageId(data)
}

export async function sendTemplate(to: string, name: string, language: string, params: string[]) {
  const data = await post('messages', {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to,
    type: 'template',
    template: {
      name,
      language: { code: language },
      ...(params.length ? { components: [{ type: 'body', parameters: params.map((text) => ({ type: 'text', text })) }] } : {}),
    },
  })
  return messageId(data)
}

// Sincronização única (só nas primeiras 24h depois de conectar o número em coexistência):
// "smb_app_state_sync" = contatos; "history" = até 180 dias de conversas.
export async function requestSync(syncType: 'smb_app_state_sync' | 'history') {
  const data = await post('smb_app_data', { messaging_product: 'whatsapp', sync_type: syncType })
  return (data.request_id as string | undefined) ?? null
}
