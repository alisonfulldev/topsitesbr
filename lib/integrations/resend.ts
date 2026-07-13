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
    }),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    // Loga mas não lança — falha de e-mail não deve quebrar a notificação
    console.error('[Resend] Falha ao enviar e-mail:', res.status, text)
  }
}
