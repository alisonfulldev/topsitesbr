'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/integrations/resend'
import { COMPANY_WHATSAPP, APP_URL } from '@/lib/config'

export async function sendDiscountAction(input: {
  leadId: string
  discountType: 'fixed' | 'percent'
  discountValue: number
  force?: boolean
}): Promise<{ ok: boolean; error?: string; alreadySent?: boolean; expiresAt?: string }> {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') return { ok: false, error: 'Não autorizado.' }

  const lead = await prisma.quoteLead.findUnique({ where: { id: input.leadId } })
  if (!lead) return { ok: false, error: 'Lead não encontrado.' }

  if (lead.discountSentAt && !input.force) {
    return { ok: false, error: 'already_sent', alreadySent: true }
  }

  const originalTotal = lead.totalValue.toNumber()

  const discountAmount =
    input.discountType === 'fixed'
      ? input.discountValue
      : originalTotal * (input.discountValue / 100)

  const discountedTotal = Math.max(0, originalTotal - discountAmount)

  if (discountedTotal <= 0 || discountAmount <= 0) {
    return { ok: false, error: 'Valor de desconto inválido.' }
  }

  const now = new Date()
  const expiresAt = new Date(now.getTime() + 48 * 60 * 60 * 1000)

  await prisma.quoteLead.update({
    where: { id: input.leadId },
    data: {
      discountType: input.discountType,
      discountValue: input.discountValue,
      discountedTotal,
      discountSentAt: now,
      discountExpiresAt: expiresAt,
    },
  })

  const waNumber = COMPANY_WHATSAPP.replace(/\D/g, '')
  const waMsg = `Olá! Vi a condição especial do meu orçamento (${fmtBRL(discountedTotal)}). Quero aproveitar! 😊`
  const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(waMsg)}`

  const emailHtml = buildDiscountEmail({
    name: lead.name,
    originalTotal,
    discountAmount,
    discountedTotal,
    discountType: input.discountType,
    discountValue: input.discountValue,
    expiresAt,
    waUrl,
    shareLink: lead.token ? `${APP_URL}/orcamento/${lead.token}` : undefined,
  })

  try {
    await sendEmail({
      to: lead.email,
      subject: `🎉 Condição especial pra você, ${lead.name.split(' ')[0]}!`,
      html: emailHtml,
    })
  } catch {
    return { ok: false, error: 'Desconto salvo, mas o e-mail falhou ao ser enviado. Tente novamente.' }
  }

  return { ok: true, expiresAt: expiresAt.toISOString() }
}

/* ─── Helpers ─────────────────────────────────────────────────────────────── */

function fmtBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function fmtDateTime(d: Date) {
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  }) + ' às ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function buildDiscountEmail(p: {
  name: string
  originalTotal: number
  discountAmount: number
  discountedTotal: number
  discountType: 'fixed' | 'percent'
  discountValue: number
  expiresAt: Date
  waUrl: string
  shareLink?: string
}): string {
  const firstName = esc(p.name.split(' ')[0])
  const savings = p.discountType === 'percent'
    ? `-${p.discountValue}%`
    : fmtBRL(p.discountAmount)
  const savingsLabel = `Você economiza ${fmtBRL(p.discountAmount)}!`
  const deadlineStr = fmtDateTime(p.expiresAt)

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

        <!-- Header -->
        <tr>
          <td style="background:#0a0a0a;border-radius:10px 10px 0 0;padding:28px 32px;text-align:center;">
            <div style="color:#facc15;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:12px;">TOP SITE</div>
            <div style="display:inline-block;background:rgba(250,204,21,0.12);border:1px solid rgba(250,204,21,0.25);border-radius:100px;padding:6px 20px;">
              <span style="color:#facc15;font-size:13px;font-weight:600;">🎉 Condição especial exclusiva</span>
            </div>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:#fff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 10px 10px;padding:36px;">

            <h1 style="margin:0 0 6px;font-size:22px;font-weight:700;color:#111827;line-height:1.3;">
              Olá, ${firstName}! Preparamos uma oferta especial pra você 🎯
            </h1>
            <p style="margin:0 0 28px;font-size:15px;line-height:1.75;color:#374151;">
              Vimos que você gerou um orçamento com a gente e queremos facilitar ainda mais.
              Preparamos uma condição especial válida por tempo limitado:
            </p>

            <!-- Price card -->
            <div style="background:#0a0a0a;border-radius:14px;padding:28px 24px;text-align:center;margin:0 0 24px;">
              <p style="margin:0 0 8px;font-size:15px;color:#9ca3af;text-decoration:line-through;">
                De ${esc(fmtBRL(p.originalTotal))}
              </p>
              <p style="margin:0 0 16px;font-size:56px;font-weight:900;color:#ffffff;line-height:1;letter-spacing:-1px;">
                ${esc(fmtBRL(p.discountedTotal))}
              </p>
              <div style="display:inline-block;background:#facc15;border-radius:100px;padding:8px 24px;margin:0 0 12px;">
                <span style="color:#000;font-size:14px;font-weight:700;">${esc(savingsLabel)}</span>
              </div>
              <br>
              <span style="background:rgba(255,255,255,0.08);border-radius:6px;padding:4px 12px;color:rgba(255,255,255,0.5);font-size:12px;">
                desconto de ${esc(savings)} aplicado
              </span>
            </div>

            <!-- Urgency -->
            <div style="background:#fef9c3;border:1px solid #fde047;border-radius:10px;padding:14px 18px;margin:0 0 28px;display:flex;align-items:center;gap:10px;">
              <div>
                <p style="margin:0;font-size:13px;font-weight:700;color:#854d0e;">⏰ Oferta com prazo!</p>
                <p style="margin:4px 0 0;font-size:13px;color:#92400e;line-height:1.5;">
                  Esta condição especial é válida apenas até <strong>${esc(deadlineStr)}</strong>.
                  Após esse prazo, o valor volta ao normal.
                </p>
              </div>
            </div>

            <!-- CTA -->
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 20px;">
              <tr>
                <td align="center">
                  <a href="${p.waUrl}"
                     style="display:inline-block;background:#facc15;color:#000;text-decoration:none;font-size:16px;font-weight:700;padding:16px 36px;border-radius:10px;letter-spacing:0.2px;">
                    💬 Falar no WhatsApp e Aproveitar →
                  </a>
                </td>
              </tr>
            </table>

            ${p.shareLink ? `<p style="text-align:center;margin:0 0 24px;font-size:13px;color:#9ca3af;">
              Quer ver seu orçamento completo?
              <a href="${esc(p.shareLink)}" style="color:#374151;font-weight:600;">Clique aqui</a>
            </p>` : ''}

            <hr style="border:none;border-top:1px solid #f3f4f6;margin:24px 0 20px;">
            <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;line-height:1.8;">
              Dúvidas? Responda este e-mail ou nos chame no WhatsApp.<br>
              Você está recebendo este e-mail por ter solicitado um orçamento na TopSite.
            </p>

          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}
