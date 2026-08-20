'use server'

import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/integrations/resend'
import { COMPANY_WHATSAPP, APP_URL } from '@/lib/config'
import { buildWAMessage } from './utils'

export type ProjectType = 'landing_page' | 'institucional' | 'loja_virtual'

export interface QuoteData {
  projectType: ProjectType
  pageCount: number | null
  segment: string
  hasAdmin: boolean
  hasLogo: boolean
  hasDomain: boolean
  totalValue: number
}

export interface SaveQuoteInput extends QuoteData {
  name: string
  email: string
}

export async function saveQuoteLeadAction(
  input: SaveQuoteInput,
): Promise<{ ok: boolean; error?: string; emailFailed?: boolean }> {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(input.email)) {
    return { ok: false, error: 'email_invalid' }
  }

  try {
    await prisma.quoteLead.create({
      data: {
        name: input.name,
        email: input.email,
        projectType: input.projectType,
        pageCount: input.pageCount,
        segment: input.segment,
        hasAdmin: input.hasAdmin,
        hasLogo: input.hasLogo,
        hasDomain: input.hasDomain,
        totalValue: input.totalValue,
      },
    })
  } catch (err) {
    console.error('[orcamento] db save failed', err)
    return { ok: false, error: 'server_error' }
  }

  let emailFailed = false
  try {
    await sendEmail({
      to: input.email,
      subject: `Seu orçamento TopSite — ${fmtValue(input.totalValue)}`,
      html: buildQuoteEmail(input),
    })
  } catch (err) {
    console.error('[orcamento] email failed', err)
    emailFailed = true
  }

  return { ok: true, emailFailed }
}

/* ─── Helpers ─────────────────────────────────────────────────────────────── */

function fmtValue(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function projectTypeLabel(t: ProjectType) {
  if (t === 'landing_page')   return 'Landing Page (página única)'
  if (t === 'institucional')  return 'Site Institucional'
  return 'Loja Virtual'
}

function buildAdicionaisList(input: SaveQuoteInput): string {
  const items: string[] = []
  if (input.hasAdmin) items.push(`Painel admin / backend — <strong>+R$1.000</strong>`)
  if (!input.hasLogo) items.push(`Criação de logotipo — <strong>+R$220</strong>`)
  if (!input.hasDomain) items.push(`Domínio + configuração — <strong>+R$140</strong>`)
  if (items.length === 0) return '<li>Nenhum adicional</li>'
  return items.map((i) => `<li>${i}</li>`).join('')
}

function buildQuoteEmail(input: SaveQuoteInput): string {
  const WA_NUMBER = COMPANY_WHATSAPP.replace(/\D/g, '')
  const waMsg = buildWAMessage({
    projectType: input.projectType,
    pageCount: input.pageCount,
    hasAdmin: input.hasAdmin,
    hasLogo: input.hasLogo,
    hasDomain: input.hasDomain,
    totalValue: input.totalValue,
  })
  const waUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(waMsg)}`
  const half = Math.ceil(input.totalValue / 2)
  const termosUrl = `${APP_URL}/termos`
  const privUrl = `${APP_URL}/privacidade`
  const safeName = esc(input.name)
  const safeSegment = esc(input.segment)

  const pagesLine =
    input.projectType === 'institucional' && input.pageCount
      ? `<tr>
           <td style="padding:6px 0;font-size:14px;color:#6b7280;">Número de páginas</td>
           <td style="padding:6px 0;font-size:14px;color:#111827;font-weight:600;text-align:right;">${input.pageCount}</td>
         </tr>`
      : ''

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

            <h1 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#111827;line-height:1.35;">
              Olá, ${safeName}! Aqui está seu orçamento 🎯
            </h1>
            <p style="margin:0 0 24px;font-size:15px;line-height:1.75;color:#374151;">
              Confira abaixo o resumo do que foi selecionado e o valor total do seu projeto.
            </p>

            <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:20px 24px;margin:0 0 24px;">
              <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">Valor total</p>
              <p style="margin:0 0 4px;font-size:36px;font-weight:800;color:#111827;line-height:1;">${fmtValue(input.totalValue)}</p>
              <p style="margin:0;font-size:13px;color:#6b7280;">Pagamento em 2x: <strong style="color:#111827;">${fmtValue(half)}</strong> na contratação + <strong style="color:#111827;">${fmtValue(input.totalValue - half)}</strong> no mês seguinte — sem juros</p>
            </div>

            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;margin:0 0 24px;">
              <tr>
                <td colspan="2" style="padding:0 0 8px;font-size:12px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid #f3f4f6;">Resumo do projeto</td>
              </tr>
              <tr>
                <td style="padding:6px 0;font-size:14px;color:#6b7280;">Tipo de projeto</td>
                <td style="padding:6px 0;font-size:14px;color:#111827;font-weight:600;text-align:right;">${projectTypeLabel(input.projectType)}</td>
              </tr>
              ${pagesLine}
              <tr>
                <td style="padding:6px 0;font-size:14px;color:#6b7280;vertical-align:top;">Segmento</td>
                <td style="padding:6px 0;font-size:14px;color:#111827;font-weight:600;text-align:right;">${safeSegment}</td>
              </tr>
            </table>

            <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:0.5px;">Adicionais incluídos</p>
            <ul style="margin:0 0 24px;padding:0 0 0 18px;font-size:14px;line-height:2;color:#374151;">
              ${buildAdicionaisList(input)}
            </ul>

            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
              <tr>
                <td align="center">
                  <a href="${waUrl}"
                     style="display:inline-block;background:#facc15;color:#000;text-decoration:none;font-size:15px;font-weight:700;padding:14px 32px;border-radius:8px;letter-spacing:0.3px;">
                    Aprovar no WhatsApp →
                  </a>
                </td>
              </tr>
            </table>

            <hr style="border:none;border-top:1px solid #f3f4f6;margin:28px 0 20px;">
            <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;line-height:1.8;">
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
