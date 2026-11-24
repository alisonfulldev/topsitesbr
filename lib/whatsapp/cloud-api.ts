// Envio pela WhatsApp Cloud API — direto na Meta ou por um provedor oficial (360dialog),
// que usa o mesmo formato de mensagem. O número fica em coexistência: continua no app
// WhatsApp Business do celular e também na API.
//
// Credenciais: as gravadas pela tela "Conectar número" (system_settings, via cadastro incorporado)
// têm prioridade; senão, as variáveis de ambiente:
//   WHATSAPP_PROVIDER         meta (padrão) | 360dialog
//   WHATSAPP_TOKEN            token de acesso da Meta ou API key do 360dialog
//   WHATSAPP_PHONE_NUMBER_ID  ID do número na Meta (só provider meta)
//   WHATSAPP_GRAPH_VERSION    versão da Graph API (padrão v27.0)
//   WHATSAPP_APP_ID / WHATSAPP_APP_SECRET   app da Meta (troca do código do cadastro incorporado)

import { prisma } from '@/lib/prisma'
import { telnyxConfigured, telnyxSendTemplate, telnyxSendText } from './telnyx'

export const CONNECTION_KEY = 'whatsapp_connection'

export interface WaConnection {
  token: string
  phoneNumberId: string
  wabaId: string | null
  displayPhone: string | null
  connectedAt: string
  tokenExpiresAt: string | null
}

type Provider = 'meta' | '360dialog' | 'telnyx'

export function provider(): Provider {
  const p = process.env.WHATSAPP_PROVIDER
  return p === '360dialog' || p === 'telnyx' ? p : 'meta'
}

export function graphVersion() {
  return process.env.WHATSAPP_GRAPH_VERSION || 'v27.0'
}

export const GRAPH = () => `https://graph.facebook.com/${graphVersion()}`

// Cache curto para não ir ao banco a cada mensagem
let cache: { at: number; value: WaConnection | null } | null = null

export async function getConnection(): Promise<WaConnection | null> {
  if (cache && Date.now() - cache.at < 60_000) return cache.value
  const row = await prisma.systemSetting.findUnique({ where: { key: CONNECTION_KEY } })
  let value: WaConnection | null = null
  try {
    value = row ? (JSON.parse(row.value) as WaConnection) : null
  } catch {
    value = null
  }
  cache = { at: Date.now(), value }
  return value
}

export async function saveConnection(conn: WaConnection) {
  const value = JSON.stringify(conn)
  await prisma.systemSetting.upsert({ where: { key: CONNECTION_KEY }, update: { value }, create: { key: CONNECTION_KEY, value } })
  cache = null
}

async function credentials(): Promise<{ token: string; phoneNumberId: string } | null> {
  const conn = await getConnection()
  if (conn?.token && conn.phoneNumberId) return { token: conn.token, phoneNumberId: conn.phoneNumberId }
  const token = process.env.WHATSAPP_TOKEN ?? ''
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID ?? ''
  // Valor curto = placeholder antigo do .env
  if (token.length < 20) return null
  if (provider() === 'meta' && !phoneNumberId) return null
  return { token, phoneNumberId }
}

export async function whatsappConfigured() {
  if (provider() === 'telnyx') return telnyxConfigured()
  return !!(await credentials())
}

export class WhatsAppApiError extends Error {
  constructor(message: string, public code?: number) {
    super(message)
  }
}

async function parse(res: Response): Promise<Record<string, unknown>> {
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>
  if (!res.ok) {
    const err = (data.error ?? {}) as { message?: string; code?: number; error_data?: { details?: string } }
    const detail = err.error_data?.details ? ` (${err.error_data.details})` : ''
    throw new WhatsAppApiError(`${err.message ?? `HTTP ${res.status}`}${detail}`, err.code)
  }
  return data
}

async function post(path: 'messages' | 'smb_app_data', body: unknown): Promise<Record<string, unknown>> {
  const creds = await credentials()
  if (!creds) throw new WhatsAppApiError('WhatsApp não conectado (Admin → WhatsApp IA → Conectar número)')
  const url = provider() === '360dialog' ? `https://waba-v2.360dialog.io/${path}` : `${GRAPH()}/${creds.phoneNumberId}/${path}`
  const headers: Record<string, string> = provider() === '360dialog'
    ? { 'D360-API-KEY': creds.token, 'Content-Type': 'application/json' }
    : { Authorization: `Bearer ${creds.token}`, 'Content-Type': 'application/json' }
  const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body), signal: AbortSignal.timeout(20_000) })
  return parse(res)
}

function messageId(data: Record<string, unknown>) {
  const messages = data.messages as { id?: string }[] | undefined
  return messages?.[0]?.id ?? null
}

export async function sendText(to: string, body: string) {
  if (provider() === 'telnyx') return telnyxSendText(to, body)
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
  if (provider() === 'telnyx') return telnyxSendTemplate(to, name, language, params)
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

// ── Cadastro incorporado (Embedded Signup) ─────────────────────────────────

async function graphGet(path: string, token: string, params: Record<string, string> = {}) {
  const url = new URL(`${GRAPH()}/${path}`)
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(20_000) })
  return parse(res)
}

// Troca o código do FB.login (vale 5 minutos) por um token de negócio. Só no servidor (usa a chave secreta).
export async function exchangeCode(code: string) {
  const appId = process.env.WHATSAPP_APP_ID
  const secret = process.env.WHATSAPP_APP_SECRET
  if (!appId || !secret) throw new WhatsAppApiError('WHATSAPP_APP_ID / WHATSAPP_APP_SECRET não configurados no servidor')
  const url = new URL(`${GRAPH()}/oauth/access_token`)
  url.searchParams.set('client_id', appId)
  url.searchParams.set('client_secret', secret)
  url.searchParams.set('code', code)
  const data = await parse(await fetch(url, { signal: AbortSignal.timeout(20_000) }))
  const token = data.access_token as string | undefined
  if (!token) throw new WhatsAppApiError('A Meta não devolveu o token')
  const expiresIn = Number(data.expires_in) || 0
  return { token, expiresAt: expiresIn ? new Date(Date.now() + expiresIn * 1000) : null }
}

export async function listPhoneNumbers(wabaId: string, token: string) {
  const data = await graphGet(`${wabaId}/phone_numbers`, token, { fields: 'id,display_phone_number,verified_name' })
  return (data.data as { id: string; display_phone_number?: string; verified_name?: string }[] | undefined) ?? []
}

// Sem isso a conta não manda webhooks para o app
export async function subscribeApp(wabaId: string, token: string) {
  const res = await fetch(`${GRAPH()}/${wabaId}/subscribed_apps`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(20_000),
  })
  return parse(res)
}

export async function phoneStatus(phoneNumberId: string, token: string) {
  const data = await graphGet(phoneNumberId, token, { fields: 'is_on_biz_app,platform_type,display_phone_number' })
  return {
    onBizApp: data.is_on_biz_app === true,
    platform: (data.platform_type as string | undefined) ?? null,
    displayPhone: (data.display_phone_number as string | undefined) ?? null,
  }
}
