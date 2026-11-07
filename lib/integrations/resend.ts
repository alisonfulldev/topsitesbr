interface SendEmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail(options: SendEmailOptions): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey || apiKey === 'mock') {
    console.log('[MOCK:email]', options.to, '|', options.subject)
    return
  }

  const from = process.env.EMAIL_FROM ?? 'Painel de Sites <noreply@example.com>'

  // BCC automático em todo e-mail enviado, exceto quando o destinatário já é o admin
  const adminBcc = process.env.ADMIN_NOTIFICATION_EMAIL ?? 'alisonfulldev@gmail.com'
  const bcc = adminBcc !== options.to ? adminBcc : undefined

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      ...(bcc ? { bcc } : {}),
    }),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    const msg = `[Resend] Falha ${res.status}: ${text}`
    console.error(msg)
    throw new Error(msg)
  }
}

// ── Prospecção ────────────────────────────────────────────────────────────────
// Envio separado do sendEmail: remetente próprio, versão texto, cabeçalhos de descadastro
// (one-click) e chave de idempotência. Sem BCC para o admin.

interface ProspectingEmailOptions {
  from: string
  to: string
  replyTo?: string
  subject: string
  html: string
  text: string
  headers: Record<string, string>
  idempotencyKey?: string
}

export async function sendProspectingEmail(options: ProspectingEmailOptions): Promise<{ id: string }> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey || apiKey === 'mock') {
    console.log('[MOCK:prospeccao]', options.to, '|', options.subject)
    return { id: 'mock_' + crypto.randomUUID() }
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      // O Resend não reenvia um e-mail com a mesma chave (janela de 24h): proteção extra contra envio duplicado
      ...(options.idempotencyKey ? { 'Idempotency-Key': options.idempotencyKey } : {}),
    },
    body: JSON.stringify({
      from: options.from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      headers: options.headers,
      ...(options.replyTo ? { reply_to: options.replyTo } : {}),
    }),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(`[Resend] Falha ${res.status}: ${JSON.stringify(data)}`)
  }
  return { id: String(data.id) }
}
