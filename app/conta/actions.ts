'use server'

import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hashPassword, verifyPassword } from '@/lib/password'
import { sendEmail } from '@/lib/integrations/resend'
import { COMPANY_NAME, COMPANY_WHATSAPP, APP_URL } from '@/lib/config'

// ── updateAccountName ─────────────────────────────────────────────────────────

export async function updateAccountName(
  name: string,
): Promise<{ success?: boolean; error?: string }> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return { error: 'Sessão inválida. Faça login novamente.' }
  }

  const trimmed = name.trim()
  if (!trimmed) {
    return { error: 'O nome não pode estar em branco.' }
  }
  if (trimmed.length > 100) {
    return { error: 'O nome deve ter no máximo 100 caracteres.' }
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, clientId: true },
  })

  if (!user) {
    return { error: 'Usuário não encontrado.' }
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { name: trimmed },
  })

  if (user.clientId) {
    await prisma.client.update({
      where: { id: user.clientId },
      data: { name: trimmed },
    })
  }

  revalidatePath('/painel/conta')
  revalidatePath('/admin/conta')

  return { success: true }
}

// ── changeAccountPassword ─────────────────────────────────────────────────────

export async function changeAccountPassword(data: {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}): Promise<{ success?: boolean; error?: string }> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return { error: 'Sessão inválida. Faça login novamente.' }
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, email: true, name: true, passwordHash: true },
  })

  if (!user) {
    return { error: 'Usuário não encontrado.' }
  }

  if (!data.currentPassword) {
    return { error: 'Informe a senha atual.' }
  }

  const valid = await verifyPassword(data.currentPassword, user.passwordHash)
  if (!valid) {
    return { error: 'Senha atual incorreta.' }
  }

  if (data.newPassword.length < 8) {
    return { error: 'A nova senha deve ter pelo menos 8 caracteres.' }
  }

  if (data.newPassword !== data.confirmPassword) {
    return { error: 'As senhas não coincidem.' }
  }

  const newHash = await hashPassword(data.newPassword)

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: newHash },
  })

  // Send security notification email
  await sendPasswordChangedEmail(user.email, user.name)

  return { success: true }
}

// ── Email de segurança: senha alterada ────────────────────────────────────────

async function sendPasswordChangedEmail(email: string, name: string): Promise<void> {
  const subject = 'Sua senha foi alterada'
  const now = new Date().toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    dateStyle: 'short',
    timeStyle: 'short',
  })
  const whatsappUrl = `https://wa.me/${COMPANY_WHATSAPP}`
  const panelUrl = APP_URL + '/painel'

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
         style="background:#f3f4f6;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" role="presentation"
               style="max-width:560px;width:100%;">

          <!-- Cabeçalho -->
          <tr>
            <td style="background:#dc2626;border-radius:10px 10px 0 0;
                        padding:28px 32px;text-align:center;">
              <div style="font-size:38px;line-height:1;">🔐</div>
              <div style="margin-top:10px;color:rgba(255,255,255,0.92);
                          font-size:11px;font-weight:700;letter-spacing:1.8px;
                          text-transform:uppercase;">Alerta de segurança</div>
            </td>
          </tr>

          <!-- Corpo -->
          <tr>
            <td style="background:#ffffff;border:1px solid #e5e7eb;border-top:none;
                        border-radius:0 0 10px 10px;padding:32px 36px;">

              <h1 style="margin:0 0 14px;font-size:20px;font-weight:700;
                          color:#111827;line-height:1.35;">${subject}</h1>

              <p style="margin:0 0 16px;font-size:15px;line-height:1.75;color:#374151;">
                Olá, ${name}! Sua senha de acesso ao painel foi alterada em <strong>${now}</strong>.
              </p>

              <!-- Alerta -->
              <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:16px 18px;margin-bottom:24px;">
                <p style="margin:0;font-size:14px;font-weight:700;color:#dc2626;">
                  ⚠️ Se não foi você quem fez essa alteração, entre em contato imediatamente.
                </p>
              </div>

              <!-- Botão WhatsApp -->
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:24px;">
                <tr>
                  <td align="center">
                    <a href="${whatsappUrl}"
                       style="display:inline-block;background:#22c55e;color:#ffffff;
                              text-decoration:none;font-size:14px;font-weight:600;
                              padding:13px 30px;border-radius:7px;">
                      Falar com suporte pelo WhatsApp
                    </a>
                  </td>
                </tr>
              </table>

              <hr style="border:none;border-top:1px solid #e5e7eb;margin:0 0 20px;">

              <p style="margin:0;font-size:11px;color:#9ca3af;text-align:center;line-height:1.6;">
                Você recebeu este e-mail porque é cliente do ${COMPANY_NAME}.<br>
                <a href="${panelUrl}" style="color:#dc2626;text-decoration:none;">${panelUrl}</a>
              </p>

            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  try {
    await sendEmail({ to: email, subject, html })
  } catch (err) {
    console.error('[conta:password-changed] Falha ao enviar e-mail:', err instanceof Error ? err.message : err)
  }
}
