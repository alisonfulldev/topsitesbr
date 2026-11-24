'use server'

import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import type { WaCategory } from '@prisma/client'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { exchangeCode, listPhoneNumbers, phoneStatus, requestSync, saveConnection, sendText, subscribeApp } from '@/lib/whatsapp/cloud-api'
import { getWaConfig, saveWaConfig, templateVarCount, waConfigSchema, type WaConfig } from '@/lib/whatsapp/config'
import { reanalyzeContact, runWhatsappAi, type RunResult } from '@/lib/whatsapp/engine'

type Result<T = object> = ({ ok: true } & T) | { ok: false; error: string }

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  return session?.user.role === 'admin'
}

const errorText = (err: unknown) => (err instanceof Error ? err.message : String(err))

const refresh = (id?: string) => {
  revalidatePath('/admin/whatsapp')
  if (id) revalidatePath('/admin/whatsapp/' + id)
}

// ── Contato ────────────────────────────────────────────────────────────────

const CATEGORIES = ['lead', 'cliente', 'pessoal', 'revisar', 'nao_classificado'] as const

export async function setCategoryAction(contactId: string, category: string): Promise<Result> {
  if (!(await requireAdmin())) return { ok: false, error: 'Não autorizado.' }
  if (!CATEGORIES.includes(category as (typeof CATEGORIES)[number])) return { ok: false, error: 'Categoria inválida.' }
  await prisma.waContact.update({ where: { id: contactId }, data: { category: category as WaCategory, categoryByAdmin: true } })
  refresh(contactId)
  return { ok: true }
}

// Devolve a categoria para a IA decidir de novo
export async function releaseCategoryAction(contactId: string): Promise<Result> {
  if (!(await requireAdmin())) return { ok: false, error: 'Não autorizado.' }
  await prisma.waContact.update({ where: { id: contactId }, data: { categoryByAdmin: false, needsAnalysis: true } })
  refresh(contactId)
  return { ok: true }
}

export async function setPausedAction(contactId: string, paused: boolean): Promise<Result> {
  if (!(await requireAdmin())) return { ok: false, error: 'Não autorizado.' }
  await prisma.waContact.update({ where: { id: contactId }, data: { aiPaused: paused, ...(paused ? {} : { humanUntil: null }) } })
  refresh(contactId)
  return { ok: true }
}

export async function setOptOutAction(contactId: string, optedOut: boolean): Promise<Result> {
  if (!(await requireAdmin())) return { ok: false, error: 'Não autorizado.' }
  await prisma.waContact.update({ where: { id: contactId }, data: { optedOutAt: optedOut ? new Date() : null } })
  refresh(contactId)
  return { ok: true }
}

// Resposta manual pelo painel: sempre envia de verdade (a trava de simulação é só para a IA)
export async function sendManualAction(contactId: string, text: string): Promise<Result> {
  if (!(await requireAdmin())) return { ok: false, error: 'Não autorizado.' }
  const body = text.trim()
  if (!body) return { ok: false, error: 'Mensagem vazia.' }
  if (body.length > 4000) return { ok: false, error: 'Mensagem longa demais (máx. 4.000 caracteres).' }
  const contact = await prisma.waContact.findUnique({ where: { id: contactId } })
  if (!contact) return { ok: false, error: 'Contato não encontrado.' }
  if (!contact.lastInboundAt || Date.now() - contact.lastInboundAt.getTime() >= 24 * 60 * 60 * 1000) {
    return { ok: false, error: 'Janela de 24h fechada: só dá para enviar modelo aprovado.' }
  }
  const config = await getWaConfig()
  let waMessageId: string | null = null
  try {
    waMessageId = await sendText(contact.waId, body)
  } catch (err) {
    return { ok: false, error: 'O WhatsApp recusou: ' + errorText(err) }
  }
  const now = new Date()
  await prisma.waMessage.create({
    data: { contactId, waMessageId, direction: 'out', author: 'voce', type: 'text', body, status: 'enviada', sentAt: now },
  })
  await prisma.waContact.update({
    where: { id: contactId },
    data: {
      lastOutboundAt: now, lastMessageAt: now, awaitingReply: false, followUpCount: 0,
      humanUntil: new Date(now.getTime() + config.humanTakeoverHours * 60 * 60 * 1000),
    },
  })
  refresh(contactId)
  return { ok: true }
}

export async function reanalyzeAction(contactId: string): Promise<Result> {
  if (!(await requireAdmin())) return { ok: false, error: 'Não autorizado.' }
  try {
    await reanalyzeContact(contactId)
    refresh(contactId)
    return { ok: true }
  } catch (err) {
    return { ok: false, error: errorText(err) }
  }
}

// Marca em lote todos os contatos "sem conversa" (vindos só da agenda) como lead ou pessoal
export async function bulkCategorizeAction(ids: string[], category: 'lead' | 'pessoal'): Promise<Result<{ count: number }>> {
  if (!(await requireAdmin())) return { ok: false, error: 'Não autorizado.' }
  if (!ids.length || ids.length > 500) return { ok: false, error: 'Selecione de 1 a 500 contatos.' }
  const { count } = await prisma.waContact.updateMany({ where: { id: { in: ids } }, data: { category, categoryByAdmin: true } })
  refresh()
  return { ok: true, count }
}

// ── Rodada manual e sincronização ───────────────────────────────────────────

export async function runNowAction(): Promise<Result<{ result: RunResult }>> {
  if (!(await requireAdmin())) return { ok: false, error: 'Não autorizado.' }
  try {
    const result = await runWhatsappAi()
    refresh()
    return { ok: true, result }
  } catch (err) {
    return { ok: false, error: errorText(err) }
  }
}

export async function requestSyncAction(kind: 'smb_app_state_sync' | 'history'): Promise<Result<{ requestId: string | null }>> {
  if (!(await requireAdmin())) return { ok: false, error: 'Não autorizado.' }
  try {
    const requestId = await requestSync(kind)
    await recordSync(kind, requestId)
    revalidatePath('/admin/whatsapp/configuracoes')
    return { ok: true, requestId }
  } catch (err) {
    return { ok: false, error: errorText(err) }
  }
}

// ── Conexão do número (cadastro incorporado com coexistência) ───────────────

export interface ConnectStep {
  label: string
  ok: boolean
  detail?: string
}

async function recordSync(kind: 'smb_app_state_sync' | 'history', requestId: string | null) {
  const key = 'whatsapp_sync_' + kind
  const value = JSON.stringify({ at: new Date().toISOString(), requestId })
  await prisma.systemSetting.upsert({ where: { key }, update: { value }, create: { key, value } })
}

// Chamada pela página /admin/whatsapp/conectar quando o cadastro incorporado termina.
// O código vale 5 minutos: a troca pelo token acontece aqui, no servidor, com a chave secreta do app.
export async function finishConnectAction(input: { code: string; wabaId: string | null; phoneNumberId: string | null }): Promise<Result<{ steps: ConnectStep[] }>> {
  if (!(await requireAdmin())) return { ok: false, error: 'Não autorizado.' }
  const steps: ConnectStep[] = []
  try {
    const { token, expiresAt } = await exchangeCode(input.code)
    steps.push({ label: 'Acesso da Meta recebido', ok: true, detail: expiresAt ? `vale até ${expiresAt.toLocaleDateString('pt-BR')}` : undefined })

    if (!input.wabaId) return { ok: false, error: 'A Meta não informou a conta do WhatsApp (waba_id). Tente conectar de novo.' }
    let phoneNumberId = input.phoneNumberId
    let displayPhone: string | null = null
    const phones = await listPhoneNumbers(input.wabaId, token)
    const phone = phones.find((p) => p.id === phoneNumberId) ?? phones[0]
    if (!phone) return { ok: false, error: 'Nenhum número encontrado na conta do WhatsApp conectada.' }
    phoneNumberId = phone.id
    displayPhone = phone.display_phone_number ?? null
    steps.push({ label: 'Número encontrado', ok: true, detail: displayPhone ?? phoneNumberId })

    await subscribeApp(input.wabaId, token)
    steps.push({ label: 'App inscrito para receber as mensagens', ok: true })

    await saveConnection({
      token, phoneNumberId, wabaId: input.wabaId, displayPhone,
      connectedAt: new Date().toISOString(), tokenExpiresAt: expiresAt?.toISOString() ?? null,
    })

    try {
      const st = await phoneStatus(phoneNumberId, token)
      steps.push({ label: 'Coexistência com o app do celular', ok: st.onBizApp, detail: st.onBizApp ? 'ativa' : `is_on_biz_app = false (${st.platform ?? '?'})` })
    } catch (err) {
      steps.push({ label: 'Coexistência com o app do celular', ok: false, detail: errorText(err) })
    }

    // Janela de 24h: pede a agenda e o histórico já (cada um só pode ser pedido uma vez)
    for (const [kind, label] of [['smb_app_state_sync', 'Importação da agenda pedida'], ['history', 'Importação do histórico pedida']] as const) {
      try {
        const requestId = await requestSync(kind)
        await recordSync(kind, requestId)
        steps.push({ label, ok: true })
      } catch (err) {
        steps.push({ label, ok: false, detail: errorText(err) + ' — tente pelo botão em Configurações (prazo: 24h)' })
      }
    }

    revalidatePath('/admin/whatsapp')
    revalidatePath('/admin/whatsapp/configuracoes')
    return { ok: true, steps }
  } catch (err) {
    steps.push({ label: 'Erro', ok: false, detail: errorText(err) })
    return { ok: true, steps }
  }
}

// ── Configurações ───────────────────────────────────────────────────────────

export async function saveConfigAction(input: WaConfig): Promise<Result> {
  if (!(await requireAdmin())) return { ok: false, error: 'Não autorizado.' }
  const parsed = waConfigSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' }
  const cfg = parsed.data
  if (cfg.windowStart >= cfg.windowEnd) return { ok: false, error: 'O início da janela precisa ser antes do fim.' }
  if (!!cfg.followUpTemplateName !== !!cfg.followUpTemplateBody) {
    return { ok: false, error: 'Modelo de follow-up: preencha o nome e o texto, ou deixe os dois vazios.' }
  }
  const hours = [...cfg.followUpHours].sort((a, b) => a - b)
  await saveWaConfig({ ...cfg, followUpHours: hours })
  revalidatePath('/admin/whatsapp')
  revalidatePath('/admin/whatsapp/configuracoes')
  return { ok: true }
}

// ── Campanhas ───────────────────────────────────────────────────────────────

const campaignSchema = z.object({
  name: z.string().trim().min(1, 'Dê um nome à campanha'),
  offer: z.string().trim().min(20, 'Descreva a oferta para a IA (o que é, preço, para quem faz sentido)'),
  categories: z.array(z.enum(['lead', 'cliente'])).min(1, 'Escolha para quem é a campanha'),
  templateName: z.string().trim().regex(/^[a-z0-9_]*$/, 'Nome do modelo: só letras minúsculas, números e _'),
  templateLanguage: z.string().trim().min(2),
  templateBody: z.string().trim(),
})

export type CampaignInput = z.infer<typeof campaignSchema>

export async function createCampaignAction(input: CampaignInput): Promise<Result<{ id: string }>> {
  if (!(await requireAdmin())) return { ok: false, error: 'Não autorizado.' }
  const parsed = campaignSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' }
  const c = parsed.data
  if (!!c.templateName !== !!c.templateBody) return { ok: false, error: 'Modelo: preencha o nome e o texto, ou deixe os dois vazios.' }
  if (c.templateBody && templateVarCount(c.templateBody) === 0) {
    return { ok: false, error: 'O texto do modelo precisa ter pelo menos uma variável {{1}} para a IA personalizar.' }
  }
  const campaign = await prisma.waCampaign.create({
    data: {
      name: c.name, offer: c.offer, categories: c.categories,
      templateName: c.templateName || null, templateLanguage: c.templateLanguage, templateBody: c.templateBody || null,
    },
  })
  revalidatePath('/admin/whatsapp/campanhas')
  return { ok: true, id: campaign.id }
}

export async function setCampaignStatusAction(id: string, status: 'ativa' | 'pausada'): Promise<Result> {
  if (!(await requireAdmin())) return { ok: false, error: 'Não autorizado.' }
  await prisma.waCampaign.update({ where: { id }, data: { status } })
  revalidatePath('/admin/whatsapp/campanhas')
  revalidatePath('/admin/whatsapp/campanhas/' + id)
  return { ok: true }
}

export async function deleteCampaignAction(id: string): Promise<Result> {
  if (!(await requireAdmin())) return { ok: false, error: 'Não autorizado.' }
  await prisma.waCampaign.delete({ where: { id } })
  revalidatePath('/admin/whatsapp/campanhas')
  return { ok: true }
}
