// Regras do WhatsApp com IA — funções puras (sem banco), testadas em tests/unit/whatsapp.test.ts.
// A IA escreve as mensagens, mas QUEM pode receber e QUANDO é decidido aqui, sempre.

import type { WaCategory } from '@prisma/client'

export const WINDOW_MS = 24 * 60 * 60 * 1000
export const HOUR_MS = 60 * 60 * 1000
export const DAY_MS = 24 * HOUR_MS
// Espera depois da última mensagem do contato antes de responder (a pessoa costuma mandar várias seguidas)
export const REPLY_DEBOUNCE_MS = 45 * 1000

export function digits(value: string | null | undefined) {
  return (value ?? '').replace(/\D/g, '')
}

// Formas possíveis de um número brasileiro: com/sem DDI e com/sem o 9º dígito do celular.
// O WhatsApp às vezes entrega números antigos sem o 9 (5518 9674-2364 vs 5518 99674-2364).
export function phoneVariants(raw: string | null | undefined): string[] {
  let d = digits(raw)
  if (!d) return []
  if (d.length === 10 || d.length === 11) d = '55' + d
  const out = new Set([d])
  if (d.startsWith('55')) {
    const ddd = d.slice(2, 4)
    const rest = d.slice(4)
    if (rest.length === 9 && rest.startsWith('9')) out.add('55' + ddd + rest.slice(1))
    if (rest.length === 8 && /^[6-9]/.test(rest)) out.add('55' + ddd + '9' + rest)
  }
  return Array.from(out)
}

export function samePhone(a: string | null | undefined, b: string | null | undefined) {
  const va = phoneVariants(a)
  return va.length > 0 && phoneVariants(b).some((v) => va.includes(v))
}

const OPT_OUT_EXACT = new Set(['sair', 'parar', 'pare', 'stop', 'cancelar', 'descadastrar', 'remover'])
const OPT_OUT_PHRASES = [
  'nao quero mais receber',
  'nao quero receber',
  'nao me mande mais',
  'para de me mandar',
  'pare de me mandar',
  'parem de me mandar',
  'me tira da lista',
  'me tire da lista',
  'me remove da lista',
  'me remova da lista',
]

export function normalizeText(text: string) {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim()
}

// Pedido explícito para parar de receber mensagens (o resto a IA avalia com contexto)
export function isOptOut(text: string) {
  const t = normalizeText(text)
  if (!t) return false
  return OPT_OUT_EXACT.has(t) || OPT_OUT_PHRASES.some((p) => t.includes(p))
}

export interface ContactState {
  category: WaCategory
  aiPaused: boolean
  humanUntil: Date | null
  optedOutAt: Date | null
  lastInboundAt: Date | null
  lastMessageAt: Date | null
  awaitingReply: boolean
  followUpCount: number
  lastOfferAt: Date | null
}

// Janela de atendimento da Cloud API: 24h desde a última mensagem DO CONTATO.
// Mensagens enviadas por você pelo app não abrem a janela.
export function windowOpen(c: Pick<ContactState, 'lastInboundAt'>, now: Date) {
  return !!c.lastInboundAt && now.getTime() - c.lastInboundAt.getTime() < WINDOW_MS
}

// Bloqueios que valem para qualquer mensagem automática. null = liberado.
export function blockReason(c: ContactState, now: Date): string | null {
  if (c.optedOutAt) return 'pediu para não receber mensagens'
  if (c.aiPaused) return 'IA pausada para este contato'
  if (c.humanUntil && c.humanUntil > now) return 'você está atendendo este contato pelo celular'
  if (c.category === 'pessoal') return 'contato pessoal'
  if (c.category === 'revisar') return 'classificação a revisar'
  if (c.category === 'nao_classificado') return 'ainda não classificado'
  return null
}

// Hora de responder: o contato mandou mensagem, ninguém respondeu, a janela está aberta
// e já passou o tempo de espera (para juntar mensagens seguidas).
export function replyDue(c: ContactState, now: Date) {
  return c.awaitingReply && windowOpen(c, now) && now.getTime() - c.lastInboundAt!.getTime() >= REPLY_DEBOUNCE_MS
}

// Próximo follow-up: conversa parada há followUpHours[n] horas (n = follow-ups já feitos),
// mas não mais velha que maxAgeDays (essas ficam para as campanhas).
export function followUpDue(c: ContactState, now: Date, followUpHours: number[], maxAgeDays: number) {
  if (c.category !== 'lead') return false
  if (blockReason(c, now)) return false
  if (!c.lastMessageAt) return false
  if (c.followUpCount >= followUpHours.length) return false
  // Mensagem do contato ainda dentro da janela: é caso de resposta, não de follow-up
  if (c.awaitingReply && windowOpen(c, now)) return false
  const idle = now.getTime() - c.lastMessageAt.getTime()
  if (idle > maxAgeDays * DAY_MS) return false
  return idle >= followUpHours[c.followUpCount] * HOUR_MS
}

export function offerAllowed(c: ContactState, now: Date, categories: WaCategory[], minIntervalDays: number) {
  if (!categories.includes(c.category)) return false
  if (blockReason(c, now)) return false
  if (c.lastOfferAt && now.getTime() - c.lastOfferAt.getTime() < minIntervalDays * DAY_MS) return false
  return true
}

// Valores de variáveis de modelo: a Meta recusa quebra de linha, tab e mais de 4 espaços seguidos
export function cleanTemplateParam(value: string) {
  return value.replace(/[\r\n\t]+/g, ' ').replace(/ {2,}/g, ' ').trim().slice(0, 300)
}
