import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/integrations/resend'

// ── Tipos de e-mail ───────────────────────────────────────────────────────────

export type EmailType =
  | 'site-status'
  | 'charge-created'
  | 'payment-confirmed'
  | 'payment-overdue'
  | 'ticket-received'
  | 'ticket-done'
  | 'promotion'
  | 'referral-reward'
  | 'generic'

const EMAIL_CONFIG: Record<EmailType, { color: string; icon: string; label: string }> = {
  'site-status':        { color: '#0ea5e9', icon: '🌐', label: 'Atualização do site' },
  'charge-created':     { color: '#f59e0b', icon: '📄', label: 'Cobrança gerada' },
  'payment-confirmed':  { color: '#22c55e', icon: '✅', label: 'Pagamento confirmado' },
  'payment-overdue':    { color: '#ef4444', icon: '⚠️', label: 'Pagamento em atraso' },
  'ticket-received':    { color: '#8b5cf6', icon: '📬', label: 'Solicitação recebida' },
  'ticket-done':        { color: '#10b981', icon: '🎉', label: 'Solicitação concluída' },
  'promotion':          { color: '#f97316', icon: '🎁', label: 'Promoção especial' },
  'referral-reward':    { color: '#eab308', icon: '⭐', label: 'Recompensa de indicação' },
  'generic':            { color: '#6b7280', icon: '🔔', label: 'Notificação' },
}

function detectType(title: string): EmailType {
  const t = title.toLowerCase()
  if (t.includes('solicitação recebida') || t.includes('solicitacao recebida')) return 'ticket-received'
  if (t.includes('solicitação concluída') || t.includes('solicitacao concluida')) return 'ticket-done'
  if (t.includes('pagamento confirmado') || t.includes('compra confirmada')) return 'payment-confirmed'
  if (t.includes('atraso') || t.includes('vencido') || t.includes('inadimplente')) return 'payment-overdue'
  if (t.includes('mês grátis') || t.includes('mes gratis') || t.includes('ganhou') || t.includes('recompensa')) return 'referral-reward'
  if (t.includes('promoção') || t.includes('promocao') || t.includes('promo')) return 'promotion'
  if (t.includes('site') && (t.includes('online') || t.includes('offline') || t.includes('publicado') || t.includes('status'))) return 'site-status'
  if (t.includes('cobrança') || t.includes('cobranca') || t.includes('boleto') || t.includes('fatura')) return 'charge-created'
  return 'generic'
}

// ── Template HTML ─────────────────────────────────────────────────────────────

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/\n/g, '<br>')
}

function buildHtml(title: string, message: string, type: EmailType): string {
  const { color, icon, label } = EMAIL_CONFIG[type]
  const panelUrl = (process.env.NEXTAUTH_URL ?? 'http://localhost:3000') + '/painel'

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${esc(title)}</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
         style="background:#f3f4f6;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" role="presentation"
               style="max-width:560px;width:100%;">

          <!-- Cabeçalho colorido -->
          <tr>
            <td style="background:${color};border-radius:10px 10px 0 0;
                        padding:28px 32px;text-align:center;">
              <div style="font-size:38px;line-height:1;">${icon}</div>
              <div style="margin-top:10px;color:rgba(255,255,255,0.92);
                          font-size:11px;font-weight:700;letter-spacing:1.8px;
                          text-transform:uppercase;">${esc(label)}</div>
            </td>
          </tr>

          <!-- Corpo -->
          <tr>
            <td style="background:#ffffff;border:1px solid #e5e7eb;border-top:none;
                        border-radius:0 0 10px 10px;padding:32px 36px;">

              <h1 style="margin:0 0 14px;font-size:20px;font-weight:700;
                          color:#111827;line-height:1.35;">${esc(title)}</h1>

              <p style="margin:0 0 28px;font-size:15px;line-height:1.75;
                         color:#374151;">${esc(message)}</p>

              <!-- Botão CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td align="center" style="padding-bottom:28px;">
                    <a href="${panelUrl}"
                       style="display:inline-block;background:${color};color:#ffffff;
                              text-decoration:none;font-size:14px;font-weight:600;
                              padding:13px 30px;border-radius:7px;letter-spacing:0.3px;">
                      Acessar o painel
                    </a>
                  </td>
                </tr>
              </table>

              <hr style="border:none;border-top:1px solid #e5e7eb;margin:0 0 20px;">

              <p style="margin:0;font-size:11px;color:#9ca3af;text-align:center;line-height:1.6;">
                Você recebeu este e-mail porque é cliente do painel de gestão de sites.<br>
                <a href="${panelUrl}" style="color:${color};text-decoration:none;">
                  ${panelUrl}
                </a>
              </p>

            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

// ── Função pública ────────────────────────────────────────────────────────────

export async function sendNotification(
  clientId: string | null,
  title: string,
  message: string,
  channel: 'painel' | 'email' | 'whatsapp' = 'painel',
  type?: EmailType,
): Promise<void> {
  await prisma.notification.create({
    data: { clientId, title, message, channel },
  })

  // Notificações internas do admin (clientId = null) não geram e-mail
  if (!clientId) {
    console.log('[NOTIF:admin]', title)
    return
  }

  // Busca o e-mail do cliente para envio
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { email: true },
  })
  if (!client?.email) return

  const emailType = type ?? detectType(title)
  const html = buildHtml(title, message, emailType)

  try {
    await sendEmail({ to: client.email, subject: title, html })
  } catch (err) {
    // Falha de e-mail não quebra a notificação (já foi salva no banco)
    console.error('[NOTIF:email] Falha:', err instanceof Error ? err.message : err)
  }
}
