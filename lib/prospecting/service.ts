import { randomBytes } from 'crypto'
import type { ProspectStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { sendProspectingEmail } from '@/lib/integrations/resend'
import { getProspectingConfig, type ProspectingConfig } from './config'
import { EMAIL_STEPS, type ParsedProspect } from './parse'
import { renderProspectEmail, unsubscribeOneClickUrl } from './render'
import { firstSendAt, isWithinSendWindow, scheduleFrom, spDayBounds } from './schedule'

const MAX_ATTEMPTS = 3
// Um envio "enviando" parado há mais que isso é considerado travado (o job caiu no meio) e volta para a fila
const STALE_SENDING_MS = 15 * 60 * 1000
// O Resend aceita ~2 envios por segundo por conta
const SEND_SPACING_MS = 600

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export async function recordEvent(prospectId: string, type: string, detail?: string | null, emailId?: string | null) {
  await prisma.prospectEvent.create({ data: { prospectId, type, detail: detail ?? null, emailId: emailId ?? null } })
}

// ── Duplicados e supressão ────────────────────────────────────────────────────

export async function findBlockedEmails(emails: string[]) {
  const list = emails.map((e) => e.toLowerCase())
  const [existing, suppressed] = await Promise.all([
    prisma.prospect.findMany({ where: { email: { in: list } }, select: { email: true } }),
    prisma.emailOptOut.findMany({ where: { email: { in: list } }, select: { email: true } }),
  ])
  const blocked = new Map<string, string>()
  for (const { email } of existing) blocked.set(email, 'já está cadastrado como prospect')
  for (const { email } of suppressed) blocked.set(email, 'está na lista de supressão (descadastro, bounce ou spam)')
  return blocked
}

export async function suppressEmail(email: string, reason: 'descadastro' | 'bounce' | 'spam' | 'manual') {
  await prisma.emailOptOut.upsert({ where: { email: email.toLowerCase() }, update: {}, create: { email: email.toLowerCase(), reason } })
}

// ── Cadastro e ativação ───────────────────────────────────────────────────────

export async function createProspect(data: ParsedProspect) {
  return prisma.prospect.create({
    data: {
      name: data.name,
      email: data.email.toLowerCase(),
      business: data.business,
      segment: data.segment,
      site: data.site,
      score: data.score,
      unsubscribeToken: randomBytes(24).toString('base64url'),
      emails: { create: data.emails.map(({ step, subject, body }) => ({ step, subject, body })) },
      events: { create: { type: 'cadastrado' } },
    },
  })
}

// Agenda os 5 e-mails: o 1º sai na hora (o cliente acabou de pedir pelo WhatsApp, a qualquer dia e horário)
// e os demais seguem a cadência, só em dias úteis e dentro da janela
export async function activateProspect(prospectId: string, now = new Date()) {
  const config = await getProspectingConfig()
  const prospect = await prisma.prospect.findUnique({ where: { id: prospectId } })
  if (!prospect || (prospect.status !== 'rascunho' && prospect.status !== 'pausado')) return

  const dates = [{ step: 1, at: now }, ...scheduleFrom(now, 1, config.cadenceDays, config)]

  await prisma.$transaction([
    ...dates.map(({ step, at }) =>
      prisma.prospectEmail.updateMany({ where: { prospectId, step, status: { in: ['rascunho', 'agendado'] } }, data: { status: 'agendado', scheduledAt: at } }),
    ),
    prisma.prospect.update({ where: { id: prospectId }, data: { status: 'ativo', activatedAt: now, stoppedAt: null, stopReason: null } }),
  ])
  await recordEvent(prospectId, 'ativado')

  if (config.liveMode) await processQueue({ prospectId, now, ignoreWindow: true })
}

// Retomar depois de pausar: o próximo e-mail não enviado sai agora (ou no próximo início de janela)
export async function resumeProspect(prospectId: string, now = new Date()) {
  const config = await getProspectingConfig()
  const pending = await prisma.prospectEmail.findMany({ where: { prospectId, status: 'agendado' }, orderBy: { step: 'asc' } })
  if (!pending.length) return
  const first = firstSendAt(now, config)
  const dates = [{ step: pending[0].step, at: first }, ...scheduleFrom(first, pending[0].step, config.cadenceDays, config)]
  await prisma.$transaction([
    ...dates.map(({ step, at }) => prisma.prospectEmail.updateMany({ where: { prospectId, step, status: 'agendado' }, data: { scheduledAt: at } })),
    prisma.prospect.update({ where: { id: prospectId }, data: { status: 'ativo', stoppedAt: null, stopReason: null } }),
  ])
  await recordEvent(prospectId, 'retomado')
  if (config.liveMode && isWithinSendWindow(now, config)) await processQueue({ prospectId, now })
}

export async function pauseProspect(prospectId: string) {
  // Os e-mails continuam "agendado", mas a fila só envia para prospects ativos
  const { count } = await prisma.prospect.updateMany({ where: { id: prospectId, status: 'ativo' }, data: { status: 'pausado' } })
  if (count) await recordEvent(prospectId, 'pausado')
}

// ── Parar a sequência ─────────────────────────────────────────────────────────

const FINAL_STATUSES: ProspectStatus[] = ['descadastrado', 'invalido']

// Cancela todos os envios futuros e muda o status. Descadastro e e-mail inválido nunca são sobrescritos.
export async function stopProspect(prospectId: string, status: ProspectStatus, reason: string) {
  const { count } = await prisma.prospect.updateMany({
    where: { id: prospectId, status: { notIn: [...FINAL_STATUSES, status] } },
    data: { status, stopReason: reason, stoppedAt: new Date() },
  })
  if (!count) return false
  await prisma.prospectEmail.updateMany({ where: { prospectId, status: { in: ['rascunho', 'agendado'] } }, data: { status: 'cancelado' } })
  await recordEvent(prospectId, 'parado', `${status}: ${reason}`)
  return true
}

export async function unsubscribeByToken(token: string, source: 'link' | 'one-click') {
  const prospect = await prisma.prospect.findUnique({ where: { unsubscribeToken: token } })
  if (!prospect) return null
  await suppressEmail(prospect.email, 'descadastro')
  await stopProspect(prospect.id, 'descadastrado', source === 'one-click' ? 'descadastro (botão do provedor de e-mail)' : 'descadastro pelo link')
  return prospect
}

export async function recordWhatsappClick(emailId: string, test: boolean) {
  const email = await prisma.prospectEmail.findUnique({ where: { id: emailId }, include: { prospect: true } })
  if (!email) return
  if (test) {
    await recordEvent(email.prospectId, 'clique_whatsapp_teste', `e-mail ${email.step}`, email.id)
    return
  }
  if (!email.clickedAt) await prisma.prospectEmail.update({ where: { id: email.id }, data: { clickedAt: new Date() } })
  await recordEvent(email.prospectId, 'clique_whatsapp', `e-mail ${email.step}`, email.id)
  if (['ativo', 'pausado', 'finalizado'].includes(email.prospect.status)) {
    await stopProspect(email.prospectId, 'interessado', `clicou no WhatsApp do e-mail ${email.step}`)
  }
}

// ── Envio ─────────────────────────────────────────────────────────────────────

function buildHeaders(token: string, test: boolean) {
  const url = unsubscribeOneClickUrl(token) + (test ? '?teste=1' : '')
  return { 'List-Unsubscribe': `<${url}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' }
}

async function deliver(config: ProspectingConfig, input: { to: string; subject: string; html: string; text: string; token: string; test: boolean; idempotencyKey?: string }) {
  return sendProspectingEmail({
    from: config.from,
    to: input.to,
    replyTo: config.replyTo || undefined,
    subject: input.subject,
    html: input.html,
    text: input.text,
    headers: buildHeaders(input.token, input.test),
    idempotencyKey: input.idempotencyKey,
  })
}

export interface QueueResult {
  skipped?: string
  sent: number
  failed: number
  remainingToday: number
}

// Job da fila: envia os e-mails agendados para hoje (data <= fim do dia), na ordem, até o limite diário.
// Idempotente: cada e-mail é "reservado" com um UPDATE condicional antes do envio, então duas execuções
// simultâneas nunca enviam o mesmo e-mail; a chave de idempotência do Resend cobre falhas no meio do caminho.
// ignoreWindow: só na ativação, para o e-mail 1 sair na hora mesmo à noite ou no fim de semana
export async function processQueue({ prospectId, now = new Date(), ignoreWindow = false }: { prospectId?: string; now?: Date; ignoreWindow?: boolean } = {}): Promise<QueueResult> {
  const config = await getProspectingConfig()
  const result: QueueResult = { sent: 0, failed: 0, remainingToday: 0 }
  if (!config.liveMode) return { ...result, skipped: 'Modo teste ativo: nenhum envio real para prospects.' }
  if (!ignoreWindow && !isWithinSendWindow(now, config)) return { ...result, skipped: 'Fora da janela de envio (dias úteis, ' + config.windowStart + '–' + config.windowEnd + ').' }

  const today = spDayBounds(now)
  const sentToday = await prisma.prospectEmail.count({ where: { status: 'enviado', sentAt: { gte: today.start, lt: today.end } } })
  let remaining = config.dailyLimit - sentToday
  if (remaining <= 0) return { ...result, skipped: 'Limite diário atingido.' }

  const staleCutoff = new Date(now.getTime() - STALE_SENDING_MS)
  const candidates = await prisma.prospectEmail.findMany({
    where: {
      scheduledAt: { lt: today.end },
      prospect: { status: 'ativo', ...(prospectId ? { id: prospectId } : {}) },
      OR: [{ status: 'agendado' }, { status: 'enviando', updatedAt: { lt: staleCutoff } }],
    },
    include: { prospect: { include: { emails: { select: { step: true, status: true } } } } },
    orderBy: [{ scheduledAt: 'asc' }, { step: 'asc' }],
    take: remaining * 2,
  })

  for (const email of candidates) {
    if (remaining <= 0) break
    // Nunca pula a ordem: o e-mail N só sai depois do N-1
    const previous = email.prospect.emails.find((e) => e.step === email.step - 1)
    if (previous && previous.status !== 'enviado') continue

    const claimed = await prisma.prospectEmail.updateMany({
      where: { id: email.id, OR: [{ status: 'agendado' }, { status: 'enviando', updatedAt: { lt: staleCutoff } }] },
      data: { status: 'enviando', attempts: { increment: 1 } },
    })
    if (claimed.count === 0) continue

    const prospect = email.prospect
    const suppressed = await prisma.emailOptOut.findUnique({ where: { email: prospect.email } })
    if (suppressed) {
      await prisma.prospectEmail.update({ where: { id: email.id }, data: { status: 'agendado' } })
      await stopProspect(prospect.id, 'descadastrado', 'e-mail na lista de supressão')
      continue
    }

    const rendered = renderProspectEmail({ config, prospect, email })
    try {
      const { id } = await deliver(config, { to: prospect.email, ...rendered, token: prospect.unsubscribeToken, test: false, idempotencyKey: `prospect-email-${email.id}` })
      const sentAt = new Date()
      await prisma.prospectEmail.update({ where: { id: email.id }, data: { status: 'enviado', sentAt, resendId: id, lastError: null } })
      await recordEvent(prospect.id, 'enviado', `e-mail ${email.step}`, email.id)
      result.sent++
      remaining--

      if (email.step >= EMAIL_STEPS) {
        await prisma.prospect.updateMany({ where: { id: prospect.id, status: 'ativo' }, data: { status: 'finalizado', stoppedAt: sentAt, stopReason: 'sequência concluída' } })
      } else {
        // Recalcula os próximos a partir do envio real: se este atrasou (limite, pausa), o intervalo se mantém
        for (const { step, at } of scheduleFrom(sentAt, email.step, config.cadenceDays, config)) {
          await prisma.prospectEmail.updateMany({ where: { prospectId: prospect.id, step, status: 'agendado' }, data: { scheduledAt: at } })
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      const failed = email.attempts + 1 >= MAX_ATTEMPTS
      await prisma.prospectEmail.update({ where: { id: email.id }, data: { status: failed ? 'falhou' : 'agendado', lastError: message.slice(0, 1000) } })
      await recordEvent(prospect.id, failed ? 'falha_definitiva' : 'falha_envio', message.slice(0, 300), email.id)
      result.failed++
    }
    await sleep(SEND_SPACING_MS)
  }

  result.remainingToday = remaining
  return result
}

// ── Modo de teste ─────────────────────────────────────────────────────────────

// Envia a sequência inteira do prospect para o e-mail de teste, na hora, ignorando janela e intervalos.
// Os links levam "?teste=1": clicar ou descadastrar só registra o evento, sem mexer no prospect real.
export async function sendTestSequence(prospectId: string) {
  const config = await getProspectingConfig()
  const prospect = await prisma.prospect.findUnique({ where: { id: prospectId }, include: { emails: { orderBy: { step: 'asc' } } } })
  if (!prospect) throw new Error('Prospect não encontrado.')

  for (const email of prospect.emails) {
    const rendered = renderProspectEmail({ config, prospect, email, test: true })
    await deliver(config, {
      to: config.testEmail,
      subject: `[TESTE ${email.step}/${EMAIL_STEPS}] ${rendered.subject}`,
      html: rendered.html,
      text: rendered.text,
      token: prospect.unsubscribeToken,
      test: true,
    })
    await sleep(SEND_SPACING_MS)
  }
  await recordEvent(prospect.id, 'teste_enviado', `${prospect.emails.length} e-mails para ${config.testEmail}`)
  return { to: config.testEmail, count: prospect.emails.length }
}

// ── Webhooks do Resend ────────────────────────────────────────────────────────

interface ResendEvent {
  type: string
  data: { email_id?: string; bounce?: { type?: string; message?: string } }
}

export async function handleResendEvent(event: ResendEvent) {
  const resendId = event.data?.email_id
  if (!resendId) return
  const email = await prisma.prospectEmail.findUnique({ where: { resendId }, include: { prospect: true } })
  if (!email) return // e-mail de outra parte do sistema (ou de teste)

  const now = new Date()
  const step = `e-mail ${email.step}`
  switch (event.type) {
    case 'email.delivered':
      await prisma.prospectEmail.update({ where: { id: email.id }, data: { deliveredAt: email.deliveredAt ?? now } })
      await recordEvent(email.prospectId, 'entregue', step, email.id)
      break
    case 'email.opened':
      if (!email.openedAt) {
        await prisma.prospectEmail.update({ where: { id: email.id }, data: { openedAt: now } })
        await recordEvent(email.prospectId, 'aberto', step, email.id)
      }
      break
    case 'email.clicked':
      // Clique em qualquer link rastreado pelo Resend; o clique no WhatsApp é registrado pelo redirecionador próprio
      await recordEvent(email.prospectId, 'clique_link', step, email.id)
      break
    case 'email.bounced': {
      await prisma.prospectEmail.update({ where: { id: email.id }, data: { bouncedAt: now } })
      const bounceType = event.data.bounce?.type
      await recordEvent(email.prospectId, 'bounce', [bounceType, event.data.bounce?.message].filter(Boolean).join(' — ') || step, email.id)
      // Bounce temporário (caixa cheia, servidor fora) não descarta o endereço
      if (bounceType !== 'Transient') {
        await suppressEmail(email.prospect.email, 'bounce')
        await stopProspect(email.prospectId, 'invalido', 'bounce (e-mail não existe ou recusou)')
      }
      break
    }
    case 'email.complained':
      await prisma.prospectEmail.update({ where: { id: email.id }, data: { complainedAt: now } })
      await recordEvent(email.prospectId, 'spam', step, email.id)
      await suppressEmail(email.prospect.email, 'spam')
      await stopProspect(email.prospectId, 'descadastrado', 'marcou como spam')
      break
  }
}
