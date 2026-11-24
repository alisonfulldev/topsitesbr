// Motor do WhatsApp com IA — roda pelo cron a cada minuto (/api/cron/whatsapp-ia).
// Ordem de cada rodada: 1) responder quem mandou mensagem  2) classificar contatos novos/alterados
// 3) follow-ups  4) campanhas de oferta. Os passos 3 e 4 só rodam na janela de horário e dentro do limite diário.

import Anthropic from '@anthropic-ai/sdk'
import type { Prisma, WaCampaign, WaContact } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { sendNotification } from '@/lib/notifications'
import { isWithinSendWindow, spDayBounds } from '@/lib/prospecting/schedule'
import { AiRefusal, aiConfigured, decide, type Decision, type Task, type TemplateInfo, type TranscriptLine } from './ai'
import { sendTemplate, sendText } from './cloud-api'
import { renderTemplate, templateVarCount, type WaConfig, getWaConfig } from './config'
import {
  DAY_MS, HOUR_MS, REPLY_DEBOUNCE_MS, WINDOW_MS, blockReason, cleanTemplateParam, followUpDue, offerAllowed, phoneVariants, samePhone, windowOpen,
} from './rules'

const LOCK_KEY = 'whatsapp_ai_lock'
const LOCK_MS = 5 * 60 * 1000
const TRANSCRIPT_SIZE = 60

// ── Contatos ────────────────────────────────────────────────────────────────

async function matchClient(waId: string) {
  const variants = phoneVariants(waId)
  if (!variants.length) return null
  const clients = await prisma.client.findMany({ where: { phone: { not: null } }, select: { id: true, phone: true } })
  return clients.find((c) => samePhone(c.phone, waId))?.id ?? null
}

export async function ensureContact(waId: string, name?: string | null): Promise<WaContact> {
  const existing = await prisma.waContact.findUnique({ where: { waId } })
  if (existing) {
    if (name && !existing.name) return prisma.waContact.update({ where: { id: existing.id }, data: { name } })
    return existing
  }
  const clientId = await matchClient(waId)
  try {
    return await prisma.waContact.create({
      data: { waId, name: name || null, clientId, category: clientId ? 'cliente' : 'nao_classificado' },
    })
  } catch (err) {
    // Dois webhooks ao mesmo tempo para o mesmo número
    if ((err as { code?: string }).code === 'P2002') return prisma.waContact.findUniqueOrThrow({ where: { waId } })
    throw err
  }
}

// ── Envio ───────────────────────────────────────────────────────────────────

export type Content =
  | { text: string }
  | { template: { name: string; language: string; body: string; params: string[] } }

interface DeliverMeta {
  author: 'ia' | 'sistema'
  kind: 'resposta' | 'follow_up' | 'oferta' | 'descadastro'
  reason?: string
  campaignId?: string
}

// Envia de verdade se os envios reais estiverem ligados (ou se for o número de teste);
// senão grava como "simulada". Sempre fica registrado na conversa.
export async function deliver(contact: Pick<WaContact, 'id' | 'waId'>, content: Content, meta: DeliverMeta, config: WaConfig) {
  const live = config.liveMode || (!!config.testNumber && samePhone(config.testNumber, contact.waId))
  let status = 'simulada'
  let waMessageId: string | null = null
  let error: string | null = null

  if (live) {
    try {
      waMessageId = 'text' in content
        ? await sendText(contact.waId, content.text)
        : await sendTemplate(contact.waId, content.template.name, content.template.language, content.template.params)
      status = 'enviada'
    } catch (err) {
      status = 'falhou'
      error = err instanceof Error ? err.message : String(err)
    }
  }

  const now = new Date()
  const body = 'text' in content ? content.text : `[modelo ${content.template.name}] ${renderTemplate(content.template.body, content.template.params)}`
  const message = await prisma.waMessage.create({
    data: {
      contactId: contact.id, waMessageId, direction: 'out', author: meta.author, kind: meta.kind,
      type: 'text' in content ? 'text' : 'template', body, status, error, aiReason: meta.reason ?? null,
      campaignId: meta.campaignId ?? null, sentAt: now,
    },
  })
  await prisma.waContact.update({
    where: { id: contact.id },
    data: { awaitingReply: false, ...(status === 'falhou' ? {} : { lastOutboundAt: now, lastMessageAt: now }) },
  })
  return { messageId: message.id, status }
}

// ── Contexto para a IA ──────────────────────────────────────────────────────

async function transcriptOf(contactId: string): Promise<TranscriptLine[]> {
  const rows = await prisma.waMessage.findMany({
    where: { contactId },
    orderBy: { sentAt: 'desc' },
    take: TRANSCRIPT_SIZE,
    select: { sentAt: true, author: true, body: true, status: true },
  })
  return rows.reverse().map((r) => ({ at: r.sentAt, author: r.author, body: r.body, status: r.status }))
}

const SUB_LABEL: Record<string, string> = { active: 'ativa', pending: 'aguardando pagamento', overdue: 'em atraso', canceled: 'cancelada' }

async function clientInfoOf(clientId: string | null) {
  if (!clientId) return null
  const c = await prisma.client.findUnique({
    where: { id: clientId },
    select: {
      name: true,
      createdAt: true,
      subscriptions: { orderBy: { createdAt: 'desc' }, take: 1, select: { status: true, plan: { select: { name: true } } } },
      sites: { select: { status: true } },
    },
  })
  if (!c) return null
  const sub = c.subscriptions[0]
  const plan = sub ? `plano ${sub.plan.name} (${SUB_LABEL[sub.status] ?? sub.status})` : 'sem plano mensal'
  const sites = c.sites.length ? c.sites.map((s) => s.status).join(', ') : 'nenhum'
  return `cliente ${c.name}, cadastrado em ${c.createdAt.toLocaleDateString('pt-BR')}; ${plan}; status do(s) site(s): ${sites}`
}

async function runDecision(config: WaConfig, contact: WaContact, task: Task) {
  const [transcript, clientInfo] = await Promise.all([transcriptOf(contact.id), clientInfoOf(contact.clientId)])
  const decision = await decide(
    config,
    { name: contact.name, waId: contact.waId, category: contact.category, categoryByAdmin: contact.categoryByAdmin, summary: contact.summary, clientInfo },
    transcript,
    task,
  )
  // Grava classificação e resumo (a categoria definida por você no painel nunca é trocada)
  const updated = await prisma.waContact.update({
    where: { id: contact.id },
    data: {
      summary: decision.resumo || contact.summary,
      interest: decision.interesse || null,
      needsAnalysis: false,
      analyzedAt: new Date(),
      ...(contact.categoryByAdmin ? {} : { category: decision.categoria }),
    },
  })
  return { decision, contact: updated }
}

// Mensagem pronta para envio a partir da decisão (texto livre com janela aberta, ou modelo)
function contentFrom(decision: Decision, template: (TemplateInfo & { language: string }) | null): Content | null {
  if (template) {
    const params = decision.parametros.map(cleanTemplateParam)
    if (params.length !== template.vars || params.some((p) => !p)) return null
    return { template: { name: template.name, language: template.language, body: template.body, params } }
  }
  const text = decision.mensagem.trim()
  return text ? { text } : null
}

async function handOff(contact: WaContact, decision: Decision, config: WaConfig) {
  await prisma.waContact.update({
    where: { id: contact.id },
    data: { humanUntil: new Date(Date.now() + config.humanTakeoverHours * HOUR_MS), awaitingReply: false },
  })
  await sendNotification(
    null,
    `WhatsApp: ${contact.name ?? contact.waId} precisa de você`,
    `${decision.motivo}\n\nA IA parou de responder esse contato por ${config.humanTakeoverHours}h. Conversa em /admin/whatsapp/${contact.id}`,
  ).catch((err) => console.error('[whatsapp-ia] notificação falhou:', err))
}

async function optOut(contact: WaContact, config: WaConfig, now: Date) {
  await prisma.waContact.update({ where: { id: contact.id }, data: { optedOutAt: now, awaitingReply: false } })
  if (windowOpen(contact, now)) {
    await deliver(contact, { text: 'Pronto, você não vai mais receber nossas mensagens automáticas. Se precisar de algo, é só chamar aqui. 👍' },
      { author: 'sistema', kind: 'descadastro', reason: 'Pediu para não receber mais mensagens' }, config)
  }
}

// ── Passos da rodada ────────────────────────────────────────────────────────

export interface RunResult {
  skipped?: string
  respostas: number
  classificados: number
  followUps: number
  ofertas: number
  chamarHumano: number
  erros: number
  simulacao: boolean
}

interface Ctx {
  config: WaConfig
  now: Date
  deadline: number
  result: RunResult
  proactiveLeft: number
}

const timeLeft = (ctx: Ctx) => Date.now() < ctx.deadline

// Erro da API (limite, rede, instabilidade) = passageiro: o contato volta na próxima rodada.
// Recusa ou resposta inválida da IA = permanente: marca como processado para não gastar de novo a cada minuto.
function isTransient(err: unknown) {
  return err instanceof Anthropic.APIError
}

async function logError(where: 'resposta' | 'classificação' | 'follow-up' | 'oferta', contact: WaContact, err: unknown, ctx: Ctx, campaignId?: string) {
  ctx.result.erros++
  const msg = err instanceof AiRefusal ? 'IA recusou' : err instanceof Error ? err.message : String(err)
  console.error(`[whatsapp-ia] ${where} ${contact.waId}:`, msg)
  if (isTransient(err)) return
  await prisma.waContact.update({
    where: { id: contact.id },
    data: {
      needsAnalysis: false,
      ...(where === 'resposta' ? { awaitingReply: false } : {}),
      ...(where === 'follow-up' ? { followUpCount: ctx.config.followUpHours.length } : {}),
    },
  }).catch(() => {})
  if (where === 'oferta' && campaignId) {
    await prisma.waCampaignSend.create({ data: { campaignId, contactId: contact.id, status: 'falhou', reason: msg } }).catch(() => {})
  }
}

const notHuman = (now: Date): Prisma.WaContactWhereInput => ({ OR: [{ humanUntil: null }, { humanUntil: { lt: now } }] })

async function processReplies(ctx: Ctx) {
  const { config, now } = ctx
  if (!config.autoReply) return
  if (!config.replyAnyTime && !isWithinSendWindow(now, config)) return

  const contacts = await prisma.waContact.findMany({
    where: {
      awaitingReply: true,
      optedOutAt: null,
      aiPaused: false,
      category: { not: 'pessoal' },
      lastInboundAt: { gte: new Date(now.getTime() - WINDOW_MS), lte: new Date(now.getTime() - REPLY_DEBOUNCE_MS) },
      ...notHuman(now),
    },
    orderBy: { lastInboundAt: 'asc' },
    take: 10,
  })

  for (const c of contacts) {
    if (!timeLeft(ctx)) return
    try {
      const { decision, contact } = await runDecision(config, c, { type: 'responder' })
      ctx.result.classificados++
      if (decision.acao === 'descadastrar') {
        await optOut(contact, config, now)
        continue
      }
      if (decision.acao === 'chamar_humano') {
        ctx.result.chamarHumano++
        const content = contentFrom(decision, null)
        if (content && !blockReason(contact, now)) await deliver(contact, content, { author: 'ia', kind: 'resposta', reason: decision.motivo }, config)
        await handOff(contact, decision, config)
        continue
      }
      const content = decision.acao === 'enviar' ? contentFrom(decision, null) : null
      if (content && !blockReason(contact, now)) {
        await deliver(contact, content, { author: 'ia', kind: 'resposta', reason: decision.motivo }, config)
        ctx.result.respostas++
      } else {
        await prisma.waContact.update({ where: { id: contact.id }, data: { awaitingReply: false } })
      }
    } catch (err) {
      await logError('resposta', c, err, ctx)
    }
  }
}

async function processClassification(ctx: Ctx) {
  const { config, now } = ctx
  // Contato sem nenhuma mensagem (veio só da agenda): não há o que analisar
  await prisma.waContact.updateMany({ where: { needsAnalysis: true, lastMessageAt: null }, data: { needsAnalysis: false } })

  const contacts = await prisma.waContact.findMany({
    where: {
      needsAnalysis: true,
      NOT: [
        // Pessoal já analisado nas últimas 24h: não gasta IA a cada mensagem
        { category: 'pessoal', analyzedAt: { gt: new Date(now.getTime() - DAY_MS) } },
        // Esperando resposta com a janela aberta: o passo de resposta já classifica
        ...(config.autoReply ? [{ awaitingReply: true, optedOutAt: null, lastInboundAt: { gte: new Date(now.getTime() - WINDOW_MS) } }] : []),
      ],
    },
    orderBy: { lastMessageAt: 'desc' },
    take: 30,
  })

  // 3 análises em paralelo (a importação do histórico pode trazer centenas de contatos)
  const queue = [...contacts]
  const worker = async () => {
    for (let c = queue.shift(); c; c = queue.shift()) {
      if (!timeLeft(ctx)) return
      try {
        await runDecision(config, c, { type: 'classificar' })
        ctx.result.classificados++
      } catch (err) {
        await logError('classificação', c, err, ctx)
      }
    }
  }
  await Promise.all([worker(), worker(), worker()])
}

function followUpTemplate(config: WaConfig) {
  if (!config.followUpTemplateName || !config.followUpTemplateBody) return null
  return { name: config.followUpTemplateName, language: config.followUpTemplateLanguage, body: config.followUpTemplateBody, vars: templateVarCount(config.followUpTemplateBody) }
}

async function processFollowUps(ctx: Ctx) {
  const { config, now } = ctx
  if (!config.followUpEnabled) return
  const template = followUpTemplate(config)
  const minHours = Math.min(...config.followUpHours)

  const contacts = await prisma.waContact.findMany({
    where: {
      category: 'lead',
      optedOutAt: null,
      aiPaused: false,
      followUpCount: { lt: config.followUpHours.length },
      lastMessageAt: { gte: new Date(now.getTime() - config.followUpMaxAgeDays * DAY_MS), lte: new Date(now.getTime() - minHours * HOUR_MS) },
      // Sem modelo aprovado, só dá para fazer follow-up com a janela de 24h aberta
      ...(template ? {} : { lastInboundAt: { gte: new Date(now.getTime() - WINDOW_MS) } }),
      ...notHuman(now),
    },
    orderBy: { lastMessageAt: 'asc' },
    take: 50,
  })

  let done = 0
  for (const c of contacts) {
    if (!timeLeft(ctx) || ctx.proactiveLeft <= 0 || done >= 5) return
    if (!followUpDue(c, now, config.followUpHours, config.followUpMaxAgeDays)) continue
    const open = windowOpen(c, now)
    const tpl = open ? null : template
    if (!open && !tpl) continue
    done++
    try {
      const idleDays = Math.max(1, Math.round((now.getTime() - c.lastMessageAt!.getTime()) / DAY_MS))
      const { decision, contact } = await runDecision(config, c, {
        type: 'follow_up', step: c.followUpCount + 1, total: config.followUpHours.length, idleDays, template: tpl,
      })
      if (decision.acao === 'descadastrar') {
        await optOut(contact, config, now)
        continue
      }
      if (decision.acao === 'chamar_humano') {
        ctx.result.chamarHumano++
        await handOff(contact, decision, config)
        continue
      }
      const content = decision.acao === 'enviar' ? contentFrom(decision, tpl) : null
      if (content && !blockReason(contact, now)) {
        await deliver(contact, content, { author: 'ia', kind: 'follow_up', reason: decision.motivo }, config)
        await prisma.waContact.update({ where: { id: contact.id }, data: { followUpCount: { increment: 1 } } })
        ctx.result.followUps++
        ctx.proactiveLeft--
      } else {
        // A IA achou que não vale insistir: encerra os follow-ups desta conversa (voltam se o contato escrever)
        await prisma.waContact.update({ where: { id: contact.id }, data: { followUpCount: config.followUpHours.length } })
      }
    } catch (err) {
      await logError('follow-up', c, err, ctx)
    }
  }
}

async function processCampaign(ctx: Ctx, campaign: WaCampaign) {
  const { config, now } = ctx
  const template = campaign.templateName && campaign.templateBody
    ? { name: campaign.templateName, language: campaign.templateLanguage, body: campaign.templateBody, vars: templateVarCount(campaign.templateBody) }
    : null

  const contacts = await prisma.waContact.findMany({
    where: {
      category: { in: campaign.categories },
      optedOutAt: null,
      aiPaused: false,
      campaignSends: { none: { campaignId: campaign.id } },
      OR: [{ lastOfferAt: null }, { lastOfferAt: { lt: new Date(now.getTime() - config.offerMinIntervalDays * DAY_MS) } }],
      AND: [notHuman(now)],
    },
    orderBy: { lastMessageAt: { sort: 'desc', nulls: 'last' } },
    take: 10,
  })

  if (!contacts.length) {
    // Sobrou só quem está bloqueado por intervalo/atendimento? Então espera; senão, terminou.
    const pending = await prisma.waContact.count({
      where: { category: { in: campaign.categories }, optedOutAt: null, aiPaused: false, campaignSends: { none: { campaignId: campaign.id } } },
    })
    if (!pending) await prisma.waCampaign.update({ where: { id: campaign.id }, data: { status: 'concluida' } })
    return
  }

  let done = 0
  for (const c of contacts) {
    if (!timeLeft(ctx) || ctx.proactiveLeft <= 0 || done >= 5) return
    if (!offerAllowed(c, now, campaign.categories, config.offerMinIntervalDays)) continue
    const open = windowOpen(c, now)
    const tpl = open ? null : template
    if (!open && !tpl) {
      await prisma.waCampaignSend.create({ data: { campaignId: campaign.id, contactId: c.id, status: 'pulado', reason: 'Janela de 24h fechada e a campanha não tem modelo aprovado' } })
      continue
    }
    done++
    try {
      const { decision, contact } = await runDecision(config, c, { type: 'oferta', campaign: campaign.name, offer: campaign.offer, template: tpl })
      if (decision.acao === 'descadastrar') {
        await optOut(contact, config, now)
        await prisma.waCampaignSend.create({ data: { campaignId: campaign.id, contactId: c.id, status: 'pulado', reason: decision.motivo } })
        continue
      }
      const content = decision.acao === 'enviar' ? contentFrom(decision, tpl) : null
      if (content && offerAllowed(contact, now, campaign.categories, config.offerMinIntervalDays)) {
        const sent = await deliver(contact, content, { author: 'ia', kind: 'oferta', reason: decision.motivo, campaignId: campaign.id }, config)
        await prisma.waContact.update({ where: { id: contact.id }, data: { lastOfferAt: now, followUpCount: 0 } })
        await prisma.waCampaignSend.create({
          data: { campaignId: campaign.id, contactId: c.id, status: sent.status === 'falhou' ? 'falhou' : sent.status === 'simulada' ? 'simulado' : 'enviado', reason: decision.motivo, messageId: sent.messageId },
        })
        ctx.result.ofertas++
        ctx.proactiveLeft--
      } else {
        await prisma.waCampaignSend.create({ data: { campaignId: campaign.id, contactId: c.id, status: 'pulado', reason: decision.motivo || 'A IA decidiu não enviar' } })
      }
    } catch (err) {
      await logError('oferta', c, err, ctx, campaign.id)
    }
  }
}

// ── Rodada ──────────────────────────────────────────────────────────────────

async function acquireLock(now: number) {
  await prisma.systemSetting.createMany({ data: [{ key: LOCK_KEY, value: '0' }], skipDuplicates: true })
  // Timestamps têm 13 dígitos: a comparação de texto funciona; '0' = livre
  const taken = await prisma.$executeRaw`
    UPDATE system_settings SET value = ${String(now)}, updated_at = NOW()
    WHERE key = ${LOCK_KEY} AND (value = '0' OR value < ${String(now - LOCK_MS)})`
  return taken === 1
}

async function releaseLock() {
  await prisma.systemSetting.update({ where: { key: LOCK_KEY }, data: { value: '0' } }).catch(() => {})
}

export async function proactiveSentToday(now: Date) {
  const { start, end } = spDayBounds(now)
  return prisma.waMessage.count({ where: { kind: { in: ['follow_up', 'oferta'] }, sentAt: { gte: start, lt: end } } })
}

export async function runWhatsappAi(budgetMs = 50_000): Promise<RunResult> {
  const config = await getWaConfig()
  const result: RunResult = { respostas: 0, classificados: 0, followUps: 0, ofertas: 0, chamarHumano: 0, erros: 0, simulacao: !config.liveMode }
  if (!aiConfigured()) return { ...result, skipped: 'ANTHROPIC_API_KEY não configurada' }

  const started = Date.now()
  if (!(await acquireLock(started))) return { ...result, skipped: 'outra rodada em andamento' }
  try {
    const now = new Date()
    const ctx: Ctx = { config, now, deadline: started + budgetMs, result, proactiveLeft: config.dailyLimit - (await proactiveSentToday(now)) }

    await processReplies(ctx)
    await processClassification(ctx)

    if (isWithinSendWindow(now, config) && ctx.proactiveLeft > 0) {
      await processFollowUps(ctx)
      const campaigns = await prisma.waCampaign.findMany({ where: { status: 'ativa' }, orderBy: { createdAt: 'asc' } })
      for (const campaign of campaigns) {
        if (!timeLeft(ctx) || ctx.proactiveLeft <= 0) break
        await processCampaign(ctx, campaign)
      }
    }
    return result
  } finally {
    await releaseLock()
  }
}

// Reanálise manual pelo painel (botão "Reanalisar")
export async function reanalyzeContact(contactId: string) {
  const config = await getWaConfig()
  const contact = await prisma.waContact.findUniqueOrThrow({ where: { id: contactId } })
  return runDecision(config, contact, { type: 'classificar' })
}
