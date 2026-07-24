import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/integrations/resend'
import { COMPANY_NAME, COMPANY_WHATSAPP, APP_URL } from '@/lib/config'

// ── Tipos de e-mail ───────────────────────────────────────────────────────────

export type EmailType =
  | 'site-status'
  | 'charge-created'
  | 'payment-confirmed'
  | 'payment-overdue'
  | 'payment-overdue-warning'
  | 'payment-overdue-critical'
  | 'payment-regularized'
  | 'subscription-welcome'
  | 'ticket-received'
  | 'ticket-done'
  | 'promotion'
  | 'referral-reward'
  | 'password-reset-request'
  | 'generic'

const EMAIL_CONFIG: Record<EmailType, { color: string; icon: string; label: string }> = {
  'site-status':              { color: '#0ea5e9', icon: '🌐', label: 'Atualização do site' },
  'charge-created':           { color: '#f59e0b', icon: '📄', label: 'Cobrança gerada' },
  'payment-confirmed':        { color: '#22c55e', icon: '✅', label: 'Pagamento confirmado' },
  'payment-overdue':          { color: '#ef4444', icon: '⚠️', label: 'Pagamento em atraso' },
  'payment-overdue-warning':  { color: '#f97316', icon: '🔔', label: 'Aviso: site em risco' },
  'payment-overdue-critical': { color: '#dc2626', icon: '🚫', label: 'Site despublicado' },
  'payment-regularized':      { color: '#22c55e', icon: '✅', label: 'Pagamento regularizado' },
  'subscription-welcome':     { color: '#7c3aed', icon: '🎉', label: 'Bem-vindo(a)!' },
  'ticket-received':          { color: '#8b5cf6', icon: '📬', label: 'Solicitação recebida' },
  'ticket-done':              { color: '#10b981', icon: '🎉', label: 'Solicitação concluída' },
  'promotion':                { color: '#f97316', icon: '🎁', label: 'Promoção especial' },
  'referral-reward':          { color: '#eab308', icon: '⭐', label: 'Recompensa de indicação' },
  'password-reset-request':   { color: '#6366f1', icon: '🔐', label: 'Redefinição de senha' },
  'generic':                  { color: '#6b7280', icon: '🔔', label: 'Notificação' },
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

function buildHtml(title: string, message: string, type: EmailType, extraHtml?: string): string {
  const { color, icon, label } = EMAIL_CONFIG[type]
  const panelUrl = APP_URL + '/painel'
  const termosUrl = APP_URL + '/termos'
  const privacidadeUrl = APP_URL + '/privacidade'

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

              ${extraHtml ?? ''}

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
                Você recebeu este e-mail porque é cliente do ${esc(COMPANY_NAME)}.<br>
                <a href="${panelUrl}" style="color:${color};text-decoration:none;">${panelUrl}</a><br>
                <a href="${termosUrl}" style="color:#9ca3af;text-decoration:underline;">Termos de Uso</a>
                &nbsp;·&nbsp;
                <a href="${privacidadeUrl}" style="color:#9ca3af;text-decoration:underline;">Privacidade</a>
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

// ── E-mail de boas-vindas na ativação da assinatura ───────────────────────────

export async function sendSubscriptionWelcome(
  email: string,
  clientName: string,
  nextDueDate: Date | null,
): Promise<void> {
  const panelUrl = APP_URL + '/painel'
  const whatsappUrl = `https://wa.me/${COMPANY_WHATSAPP}`
  const nextDueFmt = nextDueDate
    ? nextDueDate.toLocaleDateString('pt-BR')
    : '30 dias'
  const nextDueDay = nextDueDate ? nextDueDate.getDate() : 'mensal'

  const benefits = [
    'Site no ar com hospedagem e SSL',
    'Correções ilimitadas e gratuitas (bugs, erros, links quebrados)',
    'Monitoramento 24h e recuperação em caso de queda do servidor',
    '1 alteração de conteúdo por mês inclusa (texto ou imagem)',
    'Prazo de atendimento de até 7 dias',
    'Suporte especializado direto pelo WhatsApp',
    'Relatório de visitas: quantas pessoas acessam, de onde vêm e páginas mais vistas',
    '10% de desconto em serviços e upgrades',
  ]

  const benefitsList = benefits
    .map((b) => `<li style="margin-bottom:6px;font-size:14px;color:#374151;">✓ ${esc(b)}</li>`)
    .join('')

  const extraHtml = `
    <!-- Plano e primeiro mês grátis -->
    <div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:10px;padding:18px 20px;margin-bottom:24px;">
      <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#5b21b6;text-transform:uppercase;letter-spacing:0.8px;">Plano ativado</p>
      <p style="margin:0 0 2px;font-size:22px;font-weight:800;color:#111827;">Site no Ar — R$ 29,00/mês</p>
      <p style="margin:0;font-size:13px;color:#7c3aed;font-weight:600;">Primeiro mês grátis. Sua primeira cobrança será em ${nextDueFmt}.</p>
    </div>

    <!-- Benefícios -->
    <p style="margin:0 0 10px;font-size:14px;font-weight:700;color:#111827;">O que está incluído:</p>
    <ul style="margin:0 0 24px;padding-left:0;list-style:none;">
      ${benefitsList}
    </ul>

    <!-- Próximos passos -->
    <p style="margin:0 0 10px;font-size:14px;font-weight:700;color:#111827;">Próximos passos:</p>
    <ol style="margin:0 0 24px;padding-left:20px;font-size:14px;color:#374151;line-height:1.8;">
      <li>Acesse o painel e acompanhe o status do seu site</li>
      <li>Solicite alterações ou correções quando precisar</li>
      <li>Acompanhe as visitas e o desempenho do site</li>
    </ol>

    <!-- Botão WhatsApp -->
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:24px;">
      <tr>
        <td align="center">
          <a href="${whatsappUrl}"
             style="display:inline-block;background:#22c55e;color:#ffffff;
                    text-decoration:none;font-size:14px;font-weight:600;
                    padding:11px 26px;border-radius:7px;">
            Falar pelo WhatsApp
          </a>
        </td>
      </tr>
    </table>

    <!-- Regras da cobrança -->
    <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px 18px;margin-bottom:4px;">
      <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.6px;">Sobre a cobrança mensal</p>
      <ul style="margin:0;padding-left:16px;font-size:12px;color:#6b7280;line-height:1.7;">
        <li>Cobrança mensal de <strong>R$29,00</strong>, todo dia ${nextDueDay} de cada mês</li>
        <li>Seu site permanece no ar enquanto a assinatura estiver ativa</li>
        <li>Em caso de atraso: lembretes por e-mail. Após 10 dias o site é temporariamente despublicado até a regularização — sem taxa de reativação</li>
        <li>Seus arquivos ficam sempre disponíveis para download</li>
        <li>Sem contrato: cancele quando quiser</li>
      </ul>
    </div>
  `

  const subject = `Bem-vindo(a)! Seu site está no ar 🎉`
  const message = `Olá, ${clientName}! Sua assinatura do plano Site no Ar foi ativada com sucesso. O primeiro mês é grátis — sua primeira cobrança de R$29,00 será em ${nextDueFmt}.`

  const html = buildHtml(subject, message, 'subscription-welcome', extraHtml)

  try {
    await sendEmail({ to: email, subject, html })
  } catch (err) {
    console.error('[sendSubscriptionWelcome] Falha:', err instanceof Error ? err.message : err)
  }
}

// ── Emails de régua de cobrança em atraso ─────────────────────────────────────

export async function sendOverdueDay0(
  email: string,
  clientName: string,
  paymentLink: string | null,
): Promise<void> {
  const subject = 'Pagamento não identificado — verifique sua fatura'
  const message = `Olá, ${clientName}! Identificamos que sua fatura do plano Site no Ar venceu hoje e ainda não foi paga. Provavelmente foi só um esquecimento — sem problema! Regularize agora para manter seu site no ar sem interrupções.`

  const extraHtml = paymentLink
    ? `<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:24px;">
        <tr>
          <td align="center">
            <a href="${paymentLink}"
               style="display:inline-block;background:#f59e0b;color:#ffffff;
                      text-decoration:none;font-size:14px;font-weight:600;
                      padding:11px 26px;border-radius:7px;">
              Pagar fatura agora
            </a>
          </td>
        </tr>
      </table>`
    : ''

  const html = buildHtml(subject, message, 'payment-overdue', extraHtml)
  try {
    await sendEmail({ to: email, subject, html })
  } catch (err) {
    console.error('[sendOverdueDay0] Falha:', err instanceof Error ? err.message : err)
  }
}

export async function sendOverdueDay5(
  email: string,
  clientName: string,
  paymentLink: string | null,
): Promise<void> {
  const subject = 'Aviso: seu site será despublicado em 5 dias'
  const message = `Olá, ${clientName}! Sua fatura do plano Site no Ar está em atraso há 5 dias. Se não regularizada até ${new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')}, seu site será temporariamente despublicado. Não existe taxa de reativação — assim que o pagamento for confirmado o site volta ao ar automaticamente.`

  const extraHtml = paymentLink
    ? `<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:24px;">
        <tr>
          <td align="center">
            <a href="${paymentLink}"
               style="display:inline-block;background:#f97316;color:#ffffff;
                      text-decoration:none;font-size:14px;font-weight:600;
                      padding:11px 26px;border-radius:7px;">
              Regularizar pagamento
            </a>
          </td>
        </tr>
      </table>`
    : ''

  const html = buildHtml(subject, message, 'payment-overdue-warning', extraHtml)
  try {
    await sendEmail({ to: email, subject, html })
  } catch (err) {
    console.error('[sendOverdueDay5] Falha:', err instanceof Error ? err.message : err)
  }
}

export async function sendOverdueDay10(
  email: string,
  clientName: string,
  paymentLink: string | null,
): Promise<void> {
  const subject = 'Seu site foi despublicado — como regularizar'
  const message = `Olá, ${clientName}! Como sua fatura está em atraso há 10 dias, seu site foi temporariamente despublicado. Assim que o pagamento for confirmado (pode levar até algumas horas), seu site voltará ao ar automaticamente — sem nenhuma taxa de reativação. Seus arquivos continuam disponíveis para download no painel a qualquer momento.`

  const extraHtml = paymentLink
    ? `<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:24px;">
        <tr>
          <td align="center">
            <a href="${paymentLink}"
               style="display:inline-block;background:#dc2626;color:#ffffff;
                      text-decoration:none;font-size:14px;font-weight:600;
                      padding:11px 26px;border-radius:7px;">
              Pagar e reativar o site
            </a>
          </td>
        </tr>
      </table>`
    : ''

  const html = buildHtml(subject, message, 'payment-overdue-critical', extraHtml)
  try {
    await sendEmail({ to: email, subject, html })
  } catch (err) {
    console.error('[sendOverdueDay10] Falha:', err instanceof Error ? err.message : err)
  }
}

export async function sendPaymentRegularized(
  email: string,
  clientName: string,
): Promise<void> {
  const subject = 'Pagamento confirmado — seu site será reativado'
  const message = `Olá, ${clientName}! Recebemos a confirmação do seu pagamento. Seu site será republicado em breve (normalmente em até algumas horas). Obrigado por manter sua presença online conosco!`
  const html = buildHtml(subject, message, 'payment-regularized')
  try {
    await sendEmail({ to: email, subject, html })
  } catch (err) {
    console.error('[sendPaymentRegularized] Falha:', err instanceof Error ? err.message : err)
  }
}

// ── E-mail de redefinição de senha ────────────────────────────────────────────

export async function sendPasswordResetEmail(
  email: string,
  resetLink: string,
): Promise<void> {
  const subject = `Redefinição de senha — ${COMPANY_NAME}`
  const message =
    'Recebemos uma solicitação para redefinir a senha da sua conta. ' +
    'Clique no botão abaixo para criar uma nova senha. ' +
    'Este link é válido por 1 hora.'

  const extraHtml = `
    <!-- Botão de redefinição -->
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:24px;">
      <tr>
        <td align="center">
          <a href="${resetLink}"
             style="display:inline-block;background:#6366f1;color:#ffffff;
                    text-decoration:none;font-size:14px;font-weight:600;
                    padding:13px 30px;border-radius:7px;letter-spacing:0.3px;">
            Redefinir senha
          </a>
        </td>
      </tr>
    </table>

    <!-- Aviso de expiração e segurança -->
    <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px 18px;margin-bottom:24px;">
      <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.6px;">Importante</p>
      <ul style="margin:0;padding-left:16px;font-size:12px;color:#6b7280;line-height:1.8;">
        <li>Este link expira em <strong>1 hora</strong>.</li>
        <li>Se você não solicitou a redefinição de senha, ignore este e-mail — sua senha permanece a mesma.</li>
        <li>Nunca compartilhe este link com ninguém.</li>
      </ul>
    </div>

    <!-- Link alternativo em texto -->
    <p style="margin:0 0 24px;font-size:12px;color:#9ca3af;word-break:break-all;">
      Se o botão não funcionar, copie e cole este endereço no seu navegador:<br>
      <a href="${resetLink}" style="color:#6366f1;text-decoration:underline;">${resetLink}</a>
    </p>
  `

  const html = buildHtml(subject, message, 'password-reset-request', extraHtml)

  try {
    await sendEmail({ to: email, subject, html })
  } catch (err) {
    console.error('[sendPasswordResetEmail] Falha:', err instanceof Error ? err.message : err)
  }
}
