import { prisma } from '@/lib/prisma'
import { SITE_URL } from '@/lib/marketing'
import { sendProspectingEmail } from '@/lib/integrations/resend'
import { sendNotification } from '@/lib/notifications'
import { formatBRL } from '@/lib/monthly-plan'
import { getOnlineProposalConfig, type OnlineProposalConfig } from './config'

// ─── Sequência automática de e-mails da prévia ────────────────────────────────
// 5 passos (dias 0, 2, 4, 7, 10 por padrão), dentro da janela de envio (horário de Brasília).
// O cron diário envia os vencidos; o 1º sai na hora quando a prévia é enviada dentro da janela.

const BASE_URL = (process.env.NEXT_PUBLIC_APP_URL || SITE_URL).replace(/\/$/, '')
const DAY_MS = 86_400_000

const linkOf = (token: string) => `${BASE_URL}/proposta-online/${token}`
const clickUrl = (emailId: string) => `${BASE_URL}/api/proposta-online/c/${emailId}`
const openPixelUrl = (emailId: string) => `${BASE_URL}/api/proposta-online/o/${emailId}`
export const unsubscribeUrl = (token: string) => `${BASE_URL}/api/proposta-online/descadastro/${token}`

// Horário de Brasília (sem horário de verão desde 2019: UTC-3 fixo)
function spParts(date: Date) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(date)
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '00'
  return { ymd: `${get('year')}-${get('month')}-${get('day')}`, minutes: (Number(get('hour')) % 24) * 60 + Number(get('minute')) }
}
const toMinutes = (hhmm: string) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5))
const spInstant = (ymd: string, hhmm: string) => new Date(`${ymd}T${hhmm}:00-03:00`)

export function isWithinWindow(now: Date, config: Pick<OnlineProposalConfig, 'windowStart' | 'windowEnd'>) {
  const { minutes } = spParts(now)
  return minutes >= toMinutes(config.windowStart) && minutes < toMinutes(config.windowEnd)
}

// Dia N: agora (se N = 0 e dentro da janela) ou o início da janela daquele dia (ou do seguinte)
export function scheduleFor(base: Date, day: number, config: OnlineProposalConfig) {
  if (day === 0 && isWithinWindow(base, config)) return base
  const { ymd, minutes } = spParts(new Date(base.getTime() + day * DAY_MS))
  const start = spInstant(ymd, config.windowStart)
  if (day === 0 && minutes >= toMinutes(config.windowEnd)) {
    return spInstant(spParts(new Date(base.getTime() + DAY_MS)).ymd, config.windowStart)
  }
  return day === 0 && start < base ? base : start
}

/** Cancela os e-mails ainda não enviados (aprovou, assinou, pagou, pediu ajuste, cancelou...). */
export async function cancelPendingEmails(proposalId: string, reason: string) {
  const { count } = await prisma.onlineProposalEmail.updateMany({
    where: { proposalId, status: 'agendado' },
    data: { status: 'cancelado', error: `parado: ${reason}` },
  })
  return count
}

/** Nova prévia enviada: agenda uma nova rodada (cancela a anterior) e dispara o 1º e-mail se estiver na janela. */
export async function startSequence(proposalId: string) {
  const config = await getOnlineProposalConfig()
  await cancelPendingEmails(proposalId, 'nova prévia')
  const last = await prisma.onlineProposalEmail.findFirst({ where: { proposalId }, orderBy: { round: 'desc' }, select: { round: true } })
  const round = (last?.round ?? 0) + 1
  const now = new Date()
  await prisma.onlineProposalEmail.createMany({
    data: config.scheduleDays.map((day, step) => ({ proposalId, round, step, scheduledAt: scheduleFor(now, day, config) })),
  })
  await processSequence({ proposalId })
}

function fill(text: string, vars: Record<string, string>) {
  return text.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key: string) => vars[key] ?? match)
}

function escapeHtml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function renderEmail(config: OnlineProposalConfig, p: { name: string; company: string | null; planName: string; setupPrice: unknown; monthlyPrice: unknown; token: string; expiresAt: Date }, step: number, emailId: string) {
  const template = config.templates[step]
  const vars = {
    nome: p.name.split(' ')[0],
    empresa: p.company || 'sua empresa',
    plano: p.planName,
    valor_setup: formatBRL(Number(p.setupPrice)),
    valor_mensal: formatBRL(Number(p.monthlyPrice)),
    link: linkOf(p.token),
    expira_em: p.expiresAt.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
    whatsapp: `https://wa.me/${config.whatsappNumber}`,
  }
  const subject = fill(template.subject, vars)
  const body = fill(template.body, vars)
  const paragraphs = body.split(/\n\s*\n/).map((par) => `<p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#374151;">${escapeHtml(par).replace(/\n/g, '<br>')}</p>`).join('')
  const html = `<!DOCTYPE html><html lang="pt-BR"><body style="margin:0;padding:24px;background:#f3f4f6;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;">
<div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:12px;padding:28px;">
${paragraphs}
<a href="${clickUrl(emailId)}" style="display:block;text-align:center;background:#FDD900;color:#000;font-weight:700;padding:14px 20px;border-radius:10px;text-decoration:none;font-size:15px;margin:22px 0 8px;">Ver meu site</a>
<p style="margin:16px 0 0;font-size:12px;color:#9ca3af;text-align:center;">Não quer mais receber estes e-mails? <a href="${unsubscribeUrl(p.token)}" style="color:#9ca3af;">Descadastrar</a></p>
</div>
<img src="${openPixelUrl(emailId)}" width="1" height="1" alt="" style="display:none">
</body></html>`
  const text = `${body}\n\nVer meu site: ${linkOf(p.token)}\n\nDescadastrar: ${unsubscribeUrl(p.token)}`
  return { subject, html, text }
}

/**
 * Envia os e-mails vencidos que ainda fazem sentido. Chamado pelo cron diário, ao enviar a prévia
 * e pelo botão "reenviar" do admin. Nunca duplica: cada e-mail só sai uma vez (status + chave de idempotência).
 */
export async function processSequence(opts: { proposalId?: string; emailId?: string; force?: boolean } = {}) {
  const config = await getOnlineProposalConfig()
  const now = new Date()
  if (!opts.force && !isWithinWindow(now, config)) return { sent: 0, skipped: 'fora da janela de envio' }

  const due = await prisma.onlineProposalEmail.findMany({
    where: {
      status: 'agendado',
      ...(opts.emailId ? { id: opts.emailId } : { scheduledAt: { lte: now } }),
      ...(opts.proposalId ? { proposalId: opts.proposalId } : {}),
    },
    include: { proposal: true },
    orderBy: { scheduledAt: 'asc' },
    take: 100,
  })

  let sent = 0
  for (const email of due) {
    const p = email.proposal
    // A sequência para sozinha: prévia fora do estado de espera, pausada, descadastrada ou expirada
    // No reenvio manual (force) só descadastro/supressão bloqueiam
    const blocked =
      p.unsubscribedAt ? 'descadastrado' :
      opts.force ? null :
      p.status !== 'previa_enviada' ? `status ${p.status}` :
      p.sequencePaused ? 'pausada' :
      p.expiresAt <= now ? 'prévia expirada' : null
    if (blocked === 'pausada') continue
    const suppressed = await prisma.emailOptOut.findUnique({ where: { email: p.email.toLowerCase() } })
    if (blocked || suppressed) {
      await prisma.onlineProposalEmail.update({ where: { id: email.id }, data: { status: 'cancelado', error: `parado: ${blocked ?? 'e-mail na lista de supressão'}` } })
      continue
    }

    // Reserva o envio antes de mandar (evita duplicar se dois processos rodarem juntos)
    const claim = await prisma.onlineProposalEmail.updateMany({ where: { id: email.id, status: 'agendado' }, data: { status: 'enviando' } })
    if (claim.count === 0) continue

    const { subject, html, text } = renderEmail(config, p, email.step, email.id)
    try {
      await sendProspectingEmail({
        from: config.from,
        to: p.email,
        replyTo: config.replyTo || undefined,
        subject,
        html,
        text,
        headers: { 'List-Unsubscribe': `<${unsubscribeUrl(p.token)}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' },
        idempotencyKey: `online-proposal-${email.id}${opts.force ? `-${Date.now()}` : ''}`,
      })
      await prisma.onlineProposalEmail.update({ where: { id: email.id }, data: { status: 'enviado', sentAt: new Date(), subject } })
      sent++
    } catch (err) {
      await prisma.onlineProposalEmail.update({ where: { id: email.id }, data: { status: 'erro', error: err instanceof Error ? err.message.slice(0, 300) : 'erro' } })
    }
  }
  return { sent }
}

// ─── Rastreio e descadastro ───────────────────────────────────────────────────

export async function trackOpen(emailId: string) {
  await prisma.onlineProposalEmail.updateMany({ where: { id: emailId, openedAt: null }, data: { openedAt: new Date() } }).catch(() => {})
}

export async function trackClick(emailId: string): Promise<string | null> {
  const email = await prisma.onlineProposalEmail.findUnique({ where: { id: emailId }, include: { proposal: { select: { token: true } } } })
  if (!email) return null
  if (!email.clickedAt) await prisma.onlineProposalEmail.update({ where: { id: emailId }, data: { clickedAt: new Date(), openedAt: email.openedAt ?? new Date() } })
  return linkOf(email.proposal.token)
}

export async function unsubscribeByToken(token: string) {
  const p = await prisma.onlineProposal.findUnique({ where: { token } })
  if (!p || p.unsubscribedAt) return !!p
  await prisma.onlineProposal.update({ where: { id: p.id }, data: { unsubscribedAt: new Date() } })
  await prisma.emailOptOut.upsert({ where: { email: p.email.toLowerCase() }, update: {}, create: { email: p.email.toLowerCase(), reason: 'descadastro' } })
  await cancelPendingEmails(p.id, 'descadastro')
  await prisma.onlineProposalEvent.create({ data: { proposalId: p.id, type: 'descadastro', detail: 'O prospect se descadastrou dos e-mails.' } })
  await sendNotification(null, `Proposta online — ${p.name} se descadastrou dos e-mails`, 'A sequência automática foi encerrada.')
  return true
}

// ─── Controles do admin ───────────────────────────────────────────────────────

export async function setSequencePaused(proposalId: string, paused: boolean) {
  await prisma.onlineProposal.update({ where: { id: proposalId }, data: { sequencePaused: paused } })
  await prisma.onlineProposalEvent.create({ data: { proposalId, type: paused ? 'sequencia_pausada' : 'sequencia_retomada' } })
  if (!paused) await processSequence({ proposalId })
}

/** Reenvia um e-mail agora, mesmo fora da janela (o histórico registra o reenvio). */
export async function resendEmail(emailId: string) {
  const email = await prisma.onlineProposalEmail.update({ where: { id: emailId }, data: { status: 'agendado', error: null } })
  await prisma.onlineProposalEvent.create({ data: { proposalId: email.proposalId, type: 'email_reenviado', detail: `E-mail ${email.step + 1} reenviado manualmente.` } })
  return processSequence({ emailId, force: true })
}
