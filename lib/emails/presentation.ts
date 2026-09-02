import { sendEmail } from '@/lib/integrations/resend'
import { COMPANY_WHATSAPP } from '@/lib/config'

export async function sendPresentationGateEmail(
  to: string,
  link: string,
  leadName: string,
): Promise<void> {
  const firstName = leadName.split(' ')[0]
  const wa = `https://wa.me/${COMPANY_WHATSAPP}`

  await sendEmail({
    to,
    subject: 'Seu site profissional está te esperando 🚀',
    html: `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr><td style="background:#0a0a0a;padding:24px 32px;">
          <p style="margin:0;color:#c8a96e;font-size:22px;font-weight:900;letter-spacing:-0.5px;">TOP SITE</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:36px 32px;">
          <p style="margin:0 0 8px;font-size:24px;font-weight:800;color:#111;">Olá, ${firstName}! 👋</p>
          <p style="margin:0 0 20px;font-size:15px;color:#555;line-height:1.65;">
            Que bom ter você por aqui! Preparamos alguns modelos pra você ter uma ideia de como pode ficar seu site.
          </p>

          <!-- CTA Button -->
          <table cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
            <tr><td style="background:#c8a96e;border-radius:10px;">
              <a href="${link}" style="display:inline-block;padding:15px 32px;color:#0a0a0a;font-weight:800;font-size:16px;text-decoration:none;">
                Ver os modelos →
              </a>
            </td></tr>
          </table>

          <p style="margin:0 0 8px;font-size:14px;color:#666;line-height:1.65;">
            Lembrando: são só exemplos — o <strong style="color:#111;">SEU</strong> site será personalizado com a sua cara: suas cores, textos e imagens.
          </p>
          <p style="margin:0;font-size:14px;color:#666;line-height:1.65;">
            Qualquer dúvida, responda este e-mail ou <a href="${wa}" style="color:#c8a96e;text-decoration:none;font-weight:700;">chame no WhatsApp</a>.
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#f9fafb;padding:20px 32px;border-top:1px solid #f0f0f0;">
          <p style="margin:0;font-size:12px;color:#aaa;">Equipe TopSite — Sites profissionais para pequenos negócios.</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
  })
}
