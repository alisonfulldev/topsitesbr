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
  const adminBcc = process.env.ADMIN_NOTIFICATION_EMAIL
  const bcc = adminBcc && adminBcc !== options.to ? adminBcc : undefined

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
