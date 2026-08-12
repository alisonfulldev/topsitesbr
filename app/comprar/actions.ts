'use server'

import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/integrations/resend'
import { COMPANY_WHATSAPP, APP_URL } from '@/lib/config'

const WA_NUMBER = COMPANY_WHATSAPP.replace(/\D/g, '')
const WA_TEXT = encodeURIComponent('Oi! Vi a oferta do site por R$97 e quero garantir minha vaga!')
const WHATSAPP_URL = `https://wa.me/${WA_NUMBER}?text=${WA_TEXT}`

export async function captureLeadAction(
  name: string,
  email: string,
): Promise<{ whatsappUrl: string }> {
  // 1. Salva lead — falha silenciosa para não bloquear o fluxo
  try {
    await prisma.lead.create({ data: { name, email, source: 'landing' } })
  } catch (err) {
    console.error('[lead] db', err)
  }

  // 2. E-mail automático — falha silenciosa
  try {
    await sendEmail({
      to: email,
      subject: 'Você está a um passo do seu site profissional 🚀',
      html: buildLeadEmail(name),
    })
  } catch (err) {
    console.error('[lead] email', err)
  }

  return { whatsappUrl: WHATSAPP_URL }
}

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function buildLeadEmail(name: string): string {
  const safeName = esc(name)
  const waUrl = WHATSAPP_URL
  const termosUrl = `${APP_URL}/termos`
  const privacidadeUrl = `${APP_URL}/privacidade`

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
            <div style="font-size:36px;line-height:1;">🚀</div>
            <div style="margin-top:10px;color:#facc15;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">TOP SITE</div>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:#fff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 10px 10px;padding:32px 36px;">
            <h1 style="margin:0 0 12px;font-size:20px;font-weight:700;color:#111827;line-height:1.35;">
              Oi, ${safeName}! Que bom que você deu o primeiro passo. 👋
            </h1>
            <p style="margin:0 0 16px;font-size:15px;line-height:1.75;color:#374151;">
              Seu site profissional está pertinho de sair do papel — design sob medida, otimizado pro Google e pronto pra atrair clientes.
            </p>
            <p style="margin:0 0 28px;font-size:15px;line-height:1.75;color:#374151;">
              Nossa equipe já está te esperando no WhatsApp pra alinhar os detalhes e garantir sua vaga desta semana. Qualquer dúvida, é só chamar. Vamos tirar seu site do papel!
            </p>

            <!-- CTA -->
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
              <tr>
                <td align="center" style="padding-bottom:28px;">
                  <a href="${waUrl}"
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
              <a href="${privacidadeUrl}" style="color:#9ca3af;">Política de Privacidade</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}
