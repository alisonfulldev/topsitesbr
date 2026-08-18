'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/integrations/resend'
import { COMPANY_WHATSAPP, APP_URL } from '@/lib/config'

const WA_NUMBER = COMPANY_WHATSAPP.replace(/\D/g, '')

function waUrl(text: string) {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`
}

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function emailShell(body: string, optOutUrl: string): string {
  const termosUrl = `${APP_URL}/termos`
  const privUrl = `${APP_URL}/privacidade`

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f3f4f6;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px;width:100%;">

        <tr>
          <td style="background:#0a0a0a;border-radius:10px 10px 0 0;padding:28px 32px;text-align:center;">
            <div style="color:#facc15;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">TOP SITE</div>
          </td>
        </tr>

        <tr>
          <td style="background:#fff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 10px 10px;padding:32px 36px;">
            ${body}
            <hr style="border:none;border-top:1px solid #f3f4f6;margin:28px 0 20px;">
            <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;line-height:1.8;">
              <a href="${termosUrl}" style="color:#9ca3af;">Termos de Uso</a>
              &nbsp;·&nbsp;
              <a href="${privUrl}" style="color:#9ca3af;">Política de Privacidade</a>
              &nbsp;·&nbsp;
              <a href="${optOutUrl}" style="color:#9ca3af;">Descadastrar</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function fmtValue(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function buildReminderEmail(clientName: string, value: number, proposalUrl: string, wa: string, optOutUrl: string): string {
  const name = esc(clientName)
  const body = `
    <h1 style="margin:0 0 12px;font-size:20px;font-weight:700;color:#111827;line-height:1.35;">
      Olá, ${name}! Sua proposta ainda está disponível ⏳
    </h1>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.75;color:#374151;">
      Você ainda não finalizou a proposta que preparamos para você. Ela continua válida por tempo limitado — não perca essa oportunidade!
    </p>

    <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:20px 24px;margin:0 0 24px;text-align:center;">
      <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">Investimento da proposta</p>
      <p style="margin:0 0 12px;font-size:30px;font-weight:800;color:#111827;">${fmtValue(value)}</p>
      <a href="${proposalUrl}"
         style="display:inline-block;background:#0a0a0a;color:#facc15;text-decoration:none;font-size:13px;font-weight:700;padding:10px 24px;border-radius:6px;letter-spacing:0.3px;">
        Ver minha proposta →
      </a>
    </div>

    <p style="margin:0 0 24px;font-size:15px;line-height:1.75;color:#374151;">
      Ficou alguma dúvida? Estamos no WhatsApp pra te ajudar a tirar seu projeto do papel!
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td align="center" style="padding-bottom:8px;">
          <a href="${wa}"
             style="display:inline-block;background:#facc15;color:#000;text-decoration:none;font-size:15px;font-weight:700;padding:14px 32px;border-radius:8px;letter-spacing:0.3px;">
            Falar no WhatsApp
          </a>
        </td>
      </tr>
    </table>`
  return emailShell(body, optOutUrl)
}

function buildReactivationEmail(clientName: string, value: number, wa: string, optOutUrl: string): string {
  const name = esc(clientName)
  const body = `
    <h1 style="margin:0 0 12px;font-size:20px;font-weight:700;color:#111827;line-height:1.35;">
      Olá, ${name}! Que tal darmos mais uma chance ao seu projeto? 🚀
    </h1>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.75;color:#374151;">
      Sua proposta de <strong>${fmtValue(value)}</strong> expirou, mas seu projeto ainda pode sair do papel.
    </p>

    <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;padding:20px 24px;margin:0 0 24px;">
      <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#c2410c;text-transform:uppercase;letter-spacing:0.5px;">O que podemos fazer por você</p>
      <ul style="margin:0;padding:0 0 0 18px;font-size:14px;line-height:2;color:#374151;">
        <li>Preparar uma nova proposta atualizada</li>
        <li>Conversar sobre condições especiais</li>
        <li>Tirar qualquer dúvida sobre o projeto</li>
      </ul>
    </div>

    <p style="margin:0 0 24px;font-size:15px;line-height:1.75;color:#374151;">
      É só chamar a gente no WhatsApp — sem compromisso!
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td align="center" style="padding-bottom:8px;">
          <a href="${wa}"
             style="display:inline-block;background:#facc15;color:#000;text-decoration:none;font-size:15px;font-weight:700;padding:14px 32px;border-radius:8px;letter-spacing:0.3px;">
            Falar no WhatsApp
          </a>
        </td>
      </tr>
    </table>`
  return emailShell(body, optOutUrl)
}

async function getEligibleLeads(proposalId: string) {
  const proposal = await prisma.presentationProposal.findUnique({
    where: { id: proposalId },
    include: { leads: true },
  })
  if (!proposal) return { proposal: null, eligible: [] }

  const emails = proposal.leads.map((l) => l.email)
  if (emails.length === 0) return { proposal, eligible: [] }

  const optedOut = await prisma.emailOptOut.findMany({
    where: { email: { in: emails } },
    select: { email: true },
  })
  const blocklist = new Set(optedOut.map((o) => o.email))
  const eligible = proposal.leads.filter((l) => !blocklist.has(l.email))

  return { proposal, eligible }
}

export async function sendReminderEmail(
  proposalId: string,
): Promise<{ error?: string; sent?: number }> {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') return { error: 'Não autorizado.' }

  const { proposal, eligible } = await getEligibleLeads(proposalId)
  if (!proposal) return { error: 'Proposta não encontrada.' }

  const now = new Date()
  const isActive =
    !!proposal.openedAt && !proposal.approvedAt &&
    !(proposal.expiresAt && proposal.expiresAt < now)
  if (!isActive) return { error: 'Esta ação só está disponível para propostas ativas.' }
  if (eligible.length === 0) return { error: 'Nenhum lead disponível (sem capturas ou todos descadastrados).' }

  let sent = 0
  for (const lead of eligible) {
    try {
      const optOutUrl = `${APP_URL}/descadastrar?email=${encodeURIComponent(lead.email)}`
      const proposalUrl = `${APP_URL}/p/${proposal.token}`
      const wa = waUrl('Olá! Recebi o lembrete sobre minha proposta e quero saber mais!')
      await sendEmail({
        to: lead.email,
        subject: 'Sua proposta ainda está disponível ⏳',
        html: buildReminderEmail(proposal.clientName, Number(proposal.value), proposalUrl, wa, optOutUrl),
      })
      sent++
    } catch (err) {
      console.error('[propostas-lp] reminder email failed for', lead.email, err)
    }
  }

  if (sent === 0) return { error: 'Falha ao enviar para todos os e-mails. Tente novamente.' }

  await prisma.presentationProposal.update({
    where: { id: proposalId },
    data: { reminderSentAt: now },
  })

  return { sent }
}

export async function sendReactivationEmail(
  proposalId: string,
): Promise<{ error?: string; sent?: number }> {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') return { error: 'Não autorizado.' }

  const { proposal, eligible } = await getEligibleLeads(proposalId)
  if (!proposal) return { error: 'Proposta não encontrada.' }

  const now = new Date()
  const isExpired =
    !!proposal.openedAt && !proposal.approvedAt &&
    !!proposal.expiresAt && proposal.expiresAt < now
  if (!isExpired) return { error: 'Esta ação só está disponível para propostas expiradas.' }
  if (eligible.length === 0) return { error: 'Nenhum lead disponível (sem capturas ou todos descadastrados).' }

  let sent = 0
  for (const lead of eligible) {
    try {
      const optOutUrl = `${APP_URL}/descadastrar?email=${encodeURIComponent(lead.email)}`
      const wa = waUrl('Olá! Vi o e-mail sobre minha proposta expirada e quero conversar sobre uma nova condição!')
      await sendEmail({
        to: lead.email,
        subject: 'Que tal darmos mais uma chance ao seu projeto? 🚀',
        html: buildReactivationEmail(proposal.clientName, Number(proposal.value), wa, optOutUrl),
      })
      sent++
    } catch (err) {
      console.error('[propostas-lp] reactivation email failed for', lead.email, err)
    }
  }

  if (sent === 0) return { error: 'Falha ao enviar para todos os e-mails. Tente novamente.' }

  await prisma.presentationProposal.update({
    where: { id: proposalId },
    data: { reactivationSentAt: now },
  })

  return { sent }
}
