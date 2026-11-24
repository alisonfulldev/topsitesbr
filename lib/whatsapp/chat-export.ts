// Leitor das conversas exportadas pelo próprio WhatsApp (⋮ → Mais → Exportar conversa → Sem mídia).
// Funciona no navegador e no servidor (sem dependências). Testes: tests/unit/whatsapp-export.test.ts
//
// Formatos aceitos (pt-BR):
//   Android: "24/11/2026 13:45 - Fulano: mensagem"   (ano com 2 ou 4 dígitos, segundos opcionais)
//   iPhone:  "[24/11/2026, 13:45:12] Fulano: mensagem"
// Linhas sem data continuam a mensagem anterior (mensagens com quebra de linha).

import { phoneVariants } from './rules'

export interface ExportedMessage {
  at: Date
  sender: string
  body: string
}

export interface ParsedChat {
  fileName: string
  // Nome do contato tirado do nome do arquivo ("Conversa do WhatsApp com Fulano.txt")
  title: string
  messages: ExportedMessage[]
  senders: string[]
  // Número achado no nome do arquivo ou no remetente (quando o contato não estava salvo)
  phone: string | null
}

const ANDROID = /^(\d{1,2})\/(\d{1,2})\/(\d{2,4}),?\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*-\s(.*)$/
const IOS = /^\[(\d{1,2})\/(\d{1,2})\/(\d{2,4}),?\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\]\s(.*)$/

// Horário do arquivo é o do celular (Brasília, UTC-3, sem horário de verão desde 2019)
function toDate(d: string, m: string, y: string, h: string, min: string, s?: string) {
  const year = y.length === 2 ? 2000 + Number(y) : Number(y)
  return new Date(Date.UTC(year, Number(m) - 1, Number(d), Number(h) + 3, Number(min), Number(s ?? 0)))
}

const MEDIA = /^(<m[ií]dia oculta>|<media omitted>|.*\b(imagem|v[ií]deo|[áa]udio|figurinha|documento|gif) ocultad[oa]\b.*)$/i
const DELETED = /^(esta mensagem foi apagada|essa mensagem foi apagada|voc[eê] apagou esta mensagem|this message was deleted)\.?$/i

function cleanBody(body: string) {
  const b = body.trim()
  if (MEDIA.test(b)) return '[mídia]'
  if (DELETED.test(b)) return '[mensagem apagada]'
  return b.replace(/\s*<(mensagem editada|this message was edited)>\s*$/i, '').trim()
}

export function titleFromFileName(fileName: string) {
  return fileName
    .replace(/\.(txt|zip)$/i, '')
    .replace(/^(conversa do whatsapp com|whatsapp chat with|whatsapp chat -)\s*/i, '')
    .replace(/\s*\(\d+\)$/, '')
    .trim()
}

export function phoneFrom(text: string): string | null {
  const digits = text.replace(/[^\d+]/g, '')
  if (!/^\+?\d{10,13}$/.test(digits)) return null
  return phoneVariants(digits)[0] ?? null
}

export function parseChatExport(fileName: string, text: string): ParsedChat {
  const lines = text.replace(/\r\n?/g, '\n').replace(/[‎‏‪-‮]/g, '').replace(/[  ]/g, ' ').split('\n')
  const messages: ExportedMessage[] = []
  let current: ExportedMessage | null = null

  for (const raw of lines) {
    const match = raw.match(ANDROID) ?? raw.match(IOS)
    if (match) {
      const [, d, m, y, h, min, s, rest] = match
      const sep = rest.indexOf(': ')
      // Sem "Nome: " é mensagem do sistema (criptografia, mudança de número...): ignora
      if (sep <= 0) {
        current = null
        continue
      }
      current = { at: toDate(d, m, y, h, min, s), sender: rest.slice(0, sep).trim(), body: rest.slice(sep + 2) }
      messages.push(current)
    } else if (current && raw.trim()) {
      current.body += '\n' + raw
    }
  }

  const cleaned = messages
    .map((msg) => ({ ...msg, body: cleanBody(msg.body) }))
    .filter((msg) => msg.body && !Number.isNaN(msg.at.getTime()))
  const senders = Array.from(new Set(cleaned.map((msg) => msg.sender)))
  const title = titleFromFileName(fileName)
  const phone = phoneFrom(title) ?? senders.map(phoneFrom).find(Boolean) ?? null

  return { fileName, title, messages: cleaned, senders, phone }
}

// Conversa lida do WhatsApp Web: cada mensagem traz o prefixo "[HH:MM, dd/mm/aaaa] Remetente: "
export interface WebExportItem {
  title: string
  phone: string | null
  messages: { pre: string; text: string }[]
}

const WEB_PRE = /^\[(\d{1,2}):(\d{2}),\s*(\d{1,2})\/(\d{1,2})\/(\d{2,4})\]\s(.*?):\s*$/

export function parseWebExport(item: WebExportItem): ParsedChat {
  const messages: ExportedMessage[] = []
  for (const m of item.messages) {
    const match = m.pre.replace(/[‎‏  ]/g, ' ').match(WEB_PRE)
    if (!match) continue
    const [, h, min, d, mo, y, sender] = match
    const body = cleanBody(m.text || '')
    if (!body) continue
    messages.push({ at: toDate(d, mo, y, h, min), sender: sender.trim(), body })
  }
  const senders = Array.from(new Set(messages.map((msg) => msg.sender)))
  const phone = (item.phone && phoneFrom(item.phone)) ?? phoneFrom(item.title) ?? senders.map(phoneFrom).find(Boolean) ?? null
  return { fileName: item.title, title: item.title, messages, senders, phone }
}

// Seu nome nas conversas: o remetente que aparece em mais arquivos (você está em todas)
export function guessOwnerName(chats: ParsedChat[]): string | null {
  const count = new Map<string, number>()
  for (const chat of chats) for (const s of chat.senders) count.set(s, (count.get(s) ?? 0) + 1)
  const ranked = Array.from(count.entries()).sort((a, b) => b[1] - a[1])
  if (!ranked.length) return null
  // Com um arquivo só, não dá para comparar: o remetente que NÃO é o título do arquivo
  if (chats.length === 1) return chats[0].senders.find((s) => s !== chats[0].title) ?? null
  return ranked[0][0]
}
