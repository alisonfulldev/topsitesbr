'use server'

import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getProspectingConfig, prospectingConfigSchema, saveProspectingConfig, type ProspectingConfig } from '@/lib/prospecting/config'
import { EMAIL_STEPS, isValidEmail, parseBlocks, type ParsedBlock, type ParsedProspect } from '@/lib/prospecting/parse'
import {
  activateProspect, createProspect, findBlockedEmails, pauseProspect, processQueue, recordEvent,
  resumeProspect, sendTestSequence, stopProspect, type QueueResult,
} from '@/lib/prospecting/service'

type Result<T = object> = ({ ok: true } & T) | { ok: false; error: string }

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  return session?.user.role === 'admin'
}

const refresh = (id?: string) => {
  revalidatePath('/admin/prospeccao')
  if (id) revalidatePath('/admin/prospeccao/' + id)
}

// Mesmas regras do parse, para os dados que voltam editados da prévia
const prospectSchema = z.object({
  name: z.string().trim().min(1, 'NOME vazio'),
  email: z.string().trim().toLowerCase().refine(isValidEmail, 'EMAIL inválido'),
  business: z.string().trim().min(1, 'NEGOCIO vazio'),
  segment: z.string().trim().nullable(),
  site: z.string().trim().nullable(),
  score: z.number().nullable(),
  emails: z.array(z.object({
    step: z.number().int().min(1).max(EMAIL_STEPS),
    subject: z.string().trim().min(1, 'Assunto vazio').refine((s) => !s.includes('\n'), 'Assunto com mais de uma linha'),
    body: z.string().trim().min(1, 'Corpo vazio'),
  })).length(EMAIL_STEPS),
})

// Lê o texto colado e marca os bloqueados (já cadastrados ou na lista de supressão)
async function parseAndCheck(text: string): Promise<ParsedBlock[]> {
  const blocks = parseBlocks(text)
  const blocked = await findBlockedEmails(blocks.flatMap((b) => (b.data ? [b.data.email] : [])))
  for (const block of blocks) {
    const reason = block.data && blocked.get(block.data.email)
    if (reason) {
      block.errors.push(`O e-mail ${block.data!.email} ${reason}.`)
      block.data = null
    }
  }
  return blocks
}

export async function parseProspectsAction(text: string): Promise<Result<{ blocks: ParsedBlock[] }>> {
  if (!(await requireAdmin())) return { ok: false, error: 'Não autorizado.' }
  if (!text.trim()) return { ok: false, error: 'Cole pelo menos um bloco.' }
  if (text.length > 500_000) return { ok: false, error: 'Texto grande demais para uma importação. Divida em lotes menores.' }
  return { ok: true, blocks: await parseAndCheck(text) }
}

async function saveAll(items: ParsedProspect[], activate: boolean) {
  const created: string[] = []
  for (const item of items) {
    const prospect = await createProspect(item)
    created.push(prospect.id)
    if (activate) await activateProspect(prospect.id)
  }
  return created
}

export async function saveProspectsAction(items: ParsedProspect[], activate: boolean): Promise<Result<{ ids: string[] }>> {
  if (!(await requireAdmin())) return { ok: false, error: 'Não autorizado.' }
  if (!items.length) return { ok: false, error: 'Nenhum prospect válido para salvar.' }

  const parsed: ParsedProspect[] = []
  for (let i = 0; i < items.length; i++) {
    const check = prospectSchema.safeParse(items[i])
    if (!check.success) return { ok: false, error: `Prospect ${i + 1}: ${check.error.issues[0].message}` }
    parsed.push(check.data)
  }
  const blocked = await findBlockedEmails(parsed.map((p) => p.email))
  if (blocked.size) {
    const [email, reason] = Array.from(blocked.entries())[0]
    return { ok: false, error: `O e-mail ${email} ${reason}.` }
  }

  const ids = await saveAll(parsed, activate)
  refresh()
  return { ok: true, ids }
}

// "Ativar direto": lê e ativa sem passar pela prévia — só se estiver liberado nas Configurações
export async function directActivateAction(text: string): Promise<Result<{ ids: string[] }> | { ok: false; error: string; blocks: ParsedBlock[] }> {
  if (!(await requireAdmin())) return { ok: false, error: 'Não autorizado.' }
  const config = await getProspectingConfig()
  if (!config.allowDirectActivate) return { ok: false, error: '"Ativar direto" está desligado nas Configurações.' }
  const blocks = await parseAndCheck(text)
  if (!blocks.length || blocks.some((b) => !b.data)) return { ok: false, error: 'Há blocos com erro. Corrija antes de ativar.', blocks }
  const ids = await saveAll(blocks.map((b) => b.data!), true)
  refresh()
  return { ok: true, ids }
}

export async function activateAction(id: string): Promise<Result> {
  if (!(await requireAdmin())) return { ok: false, error: 'Não autorizado.' }
  const prospect = await prisma.prospect.findUnique({ where: { id }, select: { status: true } })
  if (prospect?.status === 'pausado') await resumeProspect(id)
  else await activateProspect(id)
  refresh(id)
  return { ok: true }
}

export async function pauseAction(id: string): Promise<Result> {
  if (!(await requireAdmin())) return { ok: false, error: 'Não autorizado.' }
  await pauseProspect(id)
  refresh(id)
  return { ok: true }
}

export async function markRepliedAction(id: string): Promise<Result> {
  if (!(await requireAdmin())) return { ok: false, error: 'Não autorizado.' }
  const stopped = await stopProspect(id, 'respondeu', 'marcado manualmente como respondeu')
  if (!stopped) return { ok: false, error: 'Não foi possível marcar (o prospect já está descadastrado ou inválido).' }
  refresh(id)
  return { ok: true }
}

export async function sendTestAction(id: string): Promise<Result<{ to: string; count: number }>> {
  if (!(await requireAdmin())) return { ok: false, error: 'Não autorizado.' }
  try {
    const result = await sendTestSequence(id)
    refresh(id)
    return { ok: true, ...result }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Falha ao enviar o teste.' }
  }
}

export async function deleteDraftAction(id: string): Promise<Result> {
  if (!(await requireAdmin())) return { ok: false, error: 'Não autorizado.' }
  const { count } = await prisma.prospect.deleteMany({ where: { id, status: 'rascunho' } })
  if (!count) return { ok: false, error: 'Só rascunhos podem ser excluídos.' }
  refresh()
  return { ok: true }
}

export async function updateEmailAction(emailId: string, subject: string, body: string): Promise<Result> {
  if (!(await requireAdmin())) return { ok: false, error: 'Não autorizado.' }
  const check = prospectSchema.shape.emails.element.pick({ subject: true, body: true }).safeParse({ subject, body })
  if (!check.success) return { ok: false, error: check.error.issues[0].message }
  const { count } = await prisma.prospectEmail.updateMany({
    where: { id: emailId, status: { in: ['rascunho', 'agendado'] } },
    data: check.data,
  })
  if (!count) return { ok: false, error: 'Este e-mail já foi enviado ou cancelado e não pode mais ser editado.' }
  const email = await prisma.prospectEmail.findUnique({ where: { id: emailId }, select: { prospectId: true, step: true } })
  if (email) {
    await recordEvent(email.prospectId, 'editado', `e-mail ${email.step}`, emailId)
    refresh(email.prospectId)
  }
  return { ok: true }
}

export async function saveConfigAction(input: ProspectingConfig): Promise<Result> {
  if (!(await requireAdmin())) return { ok: false, error: 'Não autorizado.' }
  const check = prospectingConfigSchema.safeParse(input)
  if (!check.success) return { ok: false, error: check.error.issues[0].message }
  const c = check.data
  if (c.windowStart >= c.windowEnd) return { ok: false, error: 'O início da janela precisa ser antes do fim.' }
  if (c.cadenceDays[0] !== 0 || c.cadenceDays.some((d, i) => i > 0 && d <= c.cadenceDays[i - 1])) {
    return { ok: false, error: 'A cadência começa em 0 e cada dia precisa ser maior que o anterior.' }
  }
  await saveProspectingConfig(c)
  revalidatePath('/admin/prospeccao', 'layout')
  return { ok: true }
}

export async function runQueueNowAction(): Promise<Result<{ result: QueueResult }>> {
  if (!(await requireAdmin())) return { ok: false, error: 'Não autorizado.' }
  const result = await processQueue()
  refresh()
  return { ok: true, result }
}
