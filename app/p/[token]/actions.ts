'use server'

import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/integrations/resend'
import { COMPANY_WHATSAPP, APP_URL } from '@/lib/config'

const WA_NUMBER = COMPANY_WHATSAPP.replace(/\D/g, '')
const WA_TEXT = encodeURIComponent('Olá! Aprovei a proposta e quero seguir com meu projeto!')
const WA_URL = `https://wa.me/${WA_NUMBER}?text=${WA_TEXT}`

// ── Unlock ─────────────────────────────────────────────────────────────────────
// Reinforcement 1: try/catch independentes para lead e e-mail — nunca bloqueiam.
// Reinforcement 2: se openedAt já existe, apenas retorna os dados sem reprocessar.
export async function unlockProposalAction(
  token: string,
  email: string,
): Promise<{
  error?: string
  value?: number
  scope?: string
  details?: string | null
  expiresAt?: string
  mode?: string
}> {
  try {
    const proposal = await prisma.presentationProposal.findUnique({ where: { token } })
    if (!proposal) return { error: 'not_found' }

    const now = new Date()

    // ── Verifica expiração ────────────────────────────────────────────────────
    if (proposal.openedAt && proposal.expiresAt && proposal.expiresAt < now) {
      return { error: 'expired' }
    }

    // ── Salva lead — sempre, para qualquer e-mail digitado ────────────────────
    try {
      await prisma.presentationProposalLead.create({
        data: { proposalId: proposal.id, email },
      })
    } catch (err) {
      console.error('[proposal-lp] lead save failed', err)
    }

    // ── Primeira abertura: inicia o timer e envia e-mail ──────────────────────
    if (!proposal.openedAt) {
      const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000)

      await prisma.presentationProposal.update({
        where: { token },
        data: { openedAt: now, expiresAt },
      })

      try {
        await sendEmail({
          to: email,
          subject: 'Sua proposta está liberada ⏳',
          html: buildUnlockEmail(proposal.clientName),
        })
      } catch (err) {
        console.error('[proposal-lp] email failed', err)
      }

      return {
        value: Number(proposal.value),
        scope: proposal.scope,
        details: proposal.details,
        expiresAt: expiresAt.toISOString(),
        mode: proposal.mode,
      }
    }

    // Proposta já aberta e dentro da validade — devolve dados
    return {
      value: Number(proposal.value),
      scope: proposal.scope,
      details: proposal.details,
      expiresAt: proposal.expiresAt!.toISOString(),
      mode: proposal.mode,
    }
  } catch (err) {
    console.error('[proposal-lp] unlock error', err)
    return { error: 'server_error' }
  }
}

// ── Approve ────────────────────────────────────────────────────────────────────
export async function approveProposalAction(token: string): Promise<void> {
  try {
    await prisma.presentationProposal.update({
      where: { token },
      data: { approvedAt: new Date() },
    })
  } catch (err) {
    console.error('[proposal-lp] approve failed', err)
  }
}

// ── E-mail template ────────────────────────────────────────────────────────────
function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function buildUnlockEmail(clientName: string): string {
  const safeName = esc(clientName)
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
            <h1 style="margin:0 0 12px;font-size:20px;font-weight:700;color:#111827;line-height:1.35;">
              Olá, ${safeName}! Sua proposta está liberada. 🎉
            </h1>
            <p style="margin:0 0 16px;font-size:15px;line-height:1.75;color:#374151;">
              Sua proposta personalizada está disponível. Aproveite para conferir com calma — lembrando que ela é válida por <strong>24 horas</strong>.
            </p>
            <p style="margin:0 0 28px;font-size:15px;line-height:1.75;color:#374151;">
              Qualquer dúvida, é só chamar a gente no WhatsApp. Vamos tirar seu projeto do papel!
            </p>

            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
              <tr>
                <td align="center" style="padding-bottom:28px;">
                  <a href="${WA_URL}"
                     style="display:inline-block;background:#facc15;color:#000;text-decoration:none;font-size:15px;font-weight:700;padding:14px 32px;border-radius:8px;letter-spacing:0.3px;">
                    Falar no WhatsApp
                  </a>
                </td>
              </tr>
            </table>

            <hr style="border:none;border-top:1px solid #f3f4f6;margin:0 0 20px;">
            <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;line-height:1.6;">
              <a href="${termosUrl}" style="color:#9ca3af;">Termos de Uso</a>
              &nbsp;·&nbsp;
              <a href="${privUrl}" style="color:#9ca3af;">Política de Privacidade</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}
