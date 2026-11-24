'use server'

import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import type { WaCategory } from '@prisma/client'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { requestSync } from '@/lib/whatsapp/cloud-api'
import { saveWaConfig, templateVarCount, waConfigSchema, type WaConfig } from '@/lib/whatsapp/config'
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
    const key = 'whatsapp_sync_' + kind
    const value = JSON.stringify({ at: new Date().toISOString(), requestId })
    await prisma.systemSetting.upsert({ where: { key }, update: { value }, create: { key, value } })
    revalidatePath('/admin/whatsapp/configuracoes')
    return { ok: true, requestId }
  } catch (err) {
    return { ok: false, error: errorText(err) }
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
