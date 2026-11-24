// Processa o webhook da WhatsApp Cloud API (mesmo formato na Meta e no 360dialog).
// Campos assinados no app: messages, smb_message_echoes, history, smb_app_state_sync.
// Aqui só se grava no banco; quem responde/faz follow-up é o motor (lib/whatsapp/engine.ts), pelo cron.

import { prisma } from '@/lib/prisma'
import { getWaConfig } from './config'
import { deliver, ensureContact } from './engine'
import { isOptOut } from './rules'

// ── Tipos do payload (só o que usamos) ───────────────────────────────────────

export interface WaRawMessage {
  from?: string
  to?: string
  id: string
  timestamp: string
  type: string
  text?: { body?: string }
  image?: { caption?: string }
  video?: { caption?: string }
  document?: { caption?: string; filename?: string }
  button?: { text?: string }
  interactive?: { button_reply?: { title?: string }; list_reply?: { title?: string } }
  reaction?: { emoji?: string }
  location?: { name?: string; address?: string }
}

interface WaStatus {
  id: string
  status: 'sent' | 'delivered' | 'read' | 'failed' | string
  errors?: { code?: number; title?: string; message?: string; error_data?: { details?: string } }[]
}

interface WaValue {
  metadata?: { display_phone_number?: string }
  contacts?: { wa_id?: string; profile?: { name?: string } }[]
  messages?: WaRawMessage[]
  statuses?: WaStatus[]
  message_echoes?: WaRawMessage[]
  history?: {
    metadata?: { phase?: number; progress?: number }
    threads?: { id?: string; context?: { wa_id?: string }; messages?: WaRawMessage[] }[]
    errors?: { code?: number; message?: string }[]
  }[]
  state_sync?: { type?: string; action?: string; contact?: { full_name?: string; first_name?: string; phone_number?: string } }[]
}

export interface WaWebhookPayload {
  object?: string
  entry?: { changes?: { field?: string; value?: WaValue }[] }[]
}

// ── Conteúdo legível de cada tipo de mensagem ────────────────────────────────

export function messageText(m: WaRawMessage): string | null {
  switch (m.type) {
    case 'text': return m.text?.body ?? ''
    case 'image': return '[imagem]' + (m.image?.caption ? ' ' + m.image.caption : '')
    case 'video': return '[vídeo]' + (m.video?.caption ? ' ' + m.video.caption : '')
    case 'document': return '[documento' + (m.document?.filename ? ' ' + m.document.filename : '') + ']' + (m.document?.caption ? ' ' + m.document.caption : '')
    case 'audio': return '[áudio — a IA não consegue ouvir]'
    case 'sticker': return '[figurinha]'
    case 'location': return '[localização]' + (m.location?.name ? ' ' + m.location.name : '')
    case 'contacts': return '[contato compartilhado]'
    case 'button': return m.button?.text ?? '[botão]'
    case 'interactive': return m.interactive?.button_reply?.title ?? m.interactive?.list_reply?.title ?? '[resposta]'
    case 'reaction': return m.reaction?.emoji ? `[reagiu com ${m.reaction.emoji}]` : null
    case 'media_placeholder': return '[mídia]'
    default: return null // system, unsupported, ephemeral...
  }
}

const at = (ts: string) => new Date(Number(ts) * 1000)

// ── Handlers ────────────────────────────────────────────────────────────────

async function handleInbound(m: WaRawMessage, profileName: string | undefined) {
  if (!m.from) return
  const body = messageText(m)
  if (body === null) return
  if (await prisma.waMessage.findUnique({ where: { waMessageId: m.id }, select: { id: true } })) return

  const contact = await ensureContact(m.from, profileName)
  const sentAt = at(m.timestamp)
  await prisma.waMessage.create({
    data: { contactId: contact.id, waMessageId: m.id, direction: 'in', author: 'contato', type: m.type, body, status: 'recebida', sentAt },
  })

  // Reação não pede resposta, mas abre a janela de 24h
  const isReaction = m.type === 'reaction'
  const optOut = !isReaction && m.type === 'text' && isOptOut(body)
  await prisma.waContact.update({
    where: { id: contact.id },
    data: {
      lastInboundAt: sentAt,
      lastMessageAt: sentAt,
      ...(isReaction ? {} : { awaitingReply: !optOut, followUpCount: 0, needsAnalysis: true }),
      ...(optOut ? { optedOutAt: new Date() } : {}),
    },
  })

  if (optOut && !contact.optedOutAt) {
    const config = await getWaConfig()
    await deliver(
      contact,
      { text: 'Pronto, você não vai mais receber nossas mensagens automáticas. Se precisar de algo, é só chamar aqui. 👍' },
      { author: 'sistema', kind: 'descadastro', reason: 'Pediu para não receber mais mensagens' },
      config,
    )
  }
}

// Mensagem que VOCÊ mandou pelo app no celular: a IA sai de cena com esse contato por um tempo
async function handleEcho(m: WaRawMessage, humanTakeoverHours: number) {
  if (!m.to) return
  const body = messageText(m)
  if (body === null) return
  if (await prisma.waMessage.findUnique({ where: { waMessageId: m.id }, select: { id: true } })) return

  const contact = await ensureContact(m.to)
  const sentAt = at(m.timestamp)
  await prisma.waMessage.create({
    data: { contactId: contact.id, waMessageId: m.id, direction: 'out', author: 'voce', type: m.type, body, status: 'enviada', sentAt },
  })
  await prisma.waContact.update({
    where: { id: contact.id },
    data: {
      lastOutboundAt: sentAt,
      lastMessageAt: sentAt,
      awaitingReply: false,
      followUpCount: 0,
      needsAnalysis: true,
      humanUntil: new Date(Date.now() + humanTakeoverHours * 60 * 60 * 1000),
    },
  })
}

const STATUS_RANK: Record<string, number> = { simulada: 0, enviada: 1, entregue: 2, lida: 3 }
const STATUS_MAP: Record<string, string> = { sent: 'enviada', delivered: 'entregue', read: 'lida', failed: 'falhou' }

async function handleStatus(s: WaStatus) {
  const next = STATUS_MAP[s.status]
  if (!next) return
  const msg = await prisma.waMessage.findUnique({ where: { waMessageId: s.id }, select: { id: true, status: true } })
  if (!msg) return
  if (next === 'falhou') {
    const e = s.errors?.[0]
    const error = e ? `${e.code ?? ''} ${e.title ?? e.message ?? ''}${e.error_data?.details ? ' — ' + e.error_data.details : ''}`.trim() : 'Falha na entrega'
    await prisma.waMessage.update({ where: { id: msg.id }, data: { status: 'falhou', error } })
    return
  }
  // Status chegam fora de ordem às vezes: nunca rebaixa (lida → entregue)
  if ((STATUS_RANK[next] ?? 0) > (STATUS_RANK[msg.status] ?? -1)) {
    await prisma.waMessage.update({ where: { id: msg.id }, data: { status: next } })
  }
}

// Recalcula as datas e o "aguardando resposta" a partir das mensagens gravadas (usado após importar histórico)
export async function refreshTimeline(contactId: string) {
  const [lastIn, lastOut, last] = await Promise.all([
    prisma.waMessage.findFirst({ where: { contactId, direction: 'in' }, orderBy: { sentAt: 'desc' }, select: { sentAt: true } }),
    prisma.waMessage.findFirst({ where: { contactId, direction: 'out', status: { not: 'simulada' } }, orderBy: { sentAt: 'desc' }, select: { sentAt: true } }),
    prisma.waMessage.findFirst({ where: { contactId, type: { not: 'reaction' } }, orderBy: { sentAt: 'desc' }, select: { sentAt: true, direction: true } }),
  ])
  await prisma.waContact.update({
    where: { id: contactId },
    data: {
      lastInboundAt: lastIn?.sentAt ?? null,
      lastOutboundAt: lastOut?.sentAt ?? null,
      lastMessageAt: last?.sentAt ?? null,
      awaitingReply: last?.direction === 'in',
      needsAnalysis: true,
    },
  })
}

async function handleHistory(value: WaValue) {
  for (const chunk of value.history ?? []) {
    if (chunk.errors?.length) {
      console.warn('[whatsapp/history] histórico não compartilhado:', chunk.errors.map((e) => `${e.code} ${e.message ?? ''}`).join('; '))
      continue
    }
    for (const thread of chunk.threads ?? []) {
      const waId = thread.context?.wa_id ?? thread.id
      if (!waId || !/^\d+$/.test(waId)) continue
      const rows = (thread.messages ?? []).flatMap((m) => {
        const body = messageText(m)
        if (body === null) return []
        const inbound = m.from === waId
        return [{ waMessageId: m.id, direction: inbound ? 'in' : 'out', author: inbound ? 'contato' : 'voce', type: m.type, body, status: 'historico', sentAt: at(m.timestamp) }]
      })
      if (!rows.length) continue
      const contact = await ensureContact(waId)
      await prisma.waMessage.createMany({ data: rows.map((r) => ({ ...r, contactId: contact.id })), skipDuplicates: true })
      await refreshTimeline(contact.id)
    }
  }
}

async function handleContactsSync(value: WaValue) {
  for (const item of value.state_sync ?? []) {
    if (item.type !== 'contact' || item.action !== 'add') continue
    const phone = item.contact?.phone_number?.replace(/\D/g, '')
    if (!phone) continue
    await ensureContact(phone, item.contact?.full_name || item.contact?.first_name)
  }
}

export async function handleWhatsappWebhook(payload: WaWebhookPayload) {
  const changes = (payload.entry ?? []).flatMap((e) => e.changes ?? [])
  let config: Awaited<ReturnType<typeof getWaConfig>> | null = null

  for (const { field, value } of changes) {
    if (!value) continue
    switch (field) {
      case 'messages': {
        const names = new Map((value.contacts ?? []).map((c) => [c.wa_id, c.profile?.name]))
        for (const m of value.messages ?? []) await handleInbound(m, names.get(m.from))
        for (const s of value.statuses ?? []) await handleStatus(s)
        break
      }
      case 'smb_message_echoes':
        config ??= await getWaConfig()
        for (const m of value.message_echoes ?? []) await handleEcho(m, config.humanTakeoverHours)
        break
      case 'history':
        await handleHistory(value)
        break
      case 'smb_app_state_sync':
        await handleContactsSync(value)
        break
    }
  }
}
