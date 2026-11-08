import { SITE_URL } from '@/lib/marketing'
import type { ProspectingConfig } from './config'

// Base dos links que vão nos e-mails (redirecionador do WhatsApp e descadastro)
export const PROSPECTING_BASE_URL = (process.env.NEXT_PUBLIC_APP_URL || SITE_URL).replace(/\/$/, '')

export function whatsappRedirectUrl(emailId: string, test = false) {
  return `${PROSPECTING_BASE_URL}/r/w/${emailId}${test ? '?teste=1' : ''}`
}

export function unsubscribePageUrl(token: string, test = false) {
  return `${PROSPECTING_BASE_URL}/sair/${token}${test ? '?teste=1' : ''}`
}

// Endpoint do one-click (List-Unsubscribe-Post): o provedor de e-mail chama com POST
export function unsubscribeOneClickUrl(token: string) {
  return `${PROSPECTING_BASE_URL}/api/prospeccao/descadastro/${token}`
}

interface Vars {
  nome: string
  negocio: string
  link_whatsapp: string
  link_descadastro: string
}

// Única alteração feita no texto colado: trocar as variáveis
export function fillVariables(text: string, vars: Vars) {
  return text.replace(/\{\{\s*(nome|negocio|link_whatsapp|link_descadastro)\s*\}\}/g, (_, key: keyof Vars) => vars[key])
}

export function whatsappUrl(config: ProspectingConfig, prospect: { name: string; business: string }) {
  const text = config.whatsappText.replace(/\{\{\s*nome\s*\}\}/g, prospect.name).replace(/\{\{\s*negocio\s*\}\}/g, prospect.business)
  return `https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(text)}`
}

// No HTML, o {{link_whatsapp}} vira um botão; no texto puro continua sendo o endereço
const WHATSAPP_BUTTON_MARK = '%%BOTAO_WHATSAPP%%'

function whatsappButton(url: string) {
  return '<br><a href="' + url + '" style="display:inline-block;margin-top:12px;padding:12px 24px;border-radius:10px;'
    + 'background:#25D366;color:#ffffff;font-weight:700;font-size:15px;text-decoration:none;">Chamar no WhatsApp</a>'
}

function escapeHtml(text: string) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

// Texto simples → HTML básico: parágrafos nas linhas em branco, <br> nas quebras simples e links clicáveis
function textToHtml(text: string) {
  return text
    .split(/\n{2,}/)
    .map((paragraph) => {
      const html = escapeHtml(paragraph.trim())
        .replace(/https?:\/\/[^\s<]+[^\s<.,;:!?)]/g, (url) => `<a href="${url}" style="color:#111827;">${url}</a>`)
        .replace(/\n/g, '<br>')
      return `<p style="margin:0 0 16px;">${html}</p>`
    })
    .join('\n')
}

export interface RenderInput {
  config: ProspectingConfig
  prospect: { name: string; business: string; unsubscribeToken: string }
  email: { id: string; subject: string; body: string }
  test?: boolean
}

export function renderProspectEmail({ config, prospect, email, test = false }: RenderInput) {
  const unsubscribeUrl = unsubscribePageUrl(prospect.unsubscribeToken, test)
  const vars: Vars = {
    nome: prospect.name,
    negocio: prospect.business,
    link_whatsapp: whatsappRedirectUrl(email.id, test),
    link_descadastro: unsubscribeUrl,
  }
  const subject = fillVariables(email.subject, vars)
  const body = fillVariables(email.body, vars)
  const htmlBody = textToHtml(fillVariables(email.body, { ...vars, link_whatsapp: WHATSAPP_BUTTON_MARK }))
    .split(WHATSAPP_BUTTON_MARK).join(whatsappButton(vars.link_whatsapp))

  const footerText = [
    '--',
    `${config.senderName} · ${config.company}`,
    config.contactLine,
    `Não quer mais receber estes e-mails? Descadastre-se: ${unsubscribeUrl}`,
  ].join('\n')

  const text = `${body}\n\n${footerText}\n`

  const html = `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:24px 16px;background:#ffffff;">
<div style="max-width:600px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;font-size:15px;line-height:1.6;color:#111827;">
${htmlBody}
<div style="margin-top:32px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:12px;line-height:1.6;color:#6b7280;">
${escapeHtml(config.senderName)} · ${escapeHtml(config.company)}<br>
${escapeHtml(config.contactLine)}<br>
Não quer mais receber estes e-mails? <a href="${unsubscribeUrl}" style="color:#6b7280;">Descadastre-se</a>.
</div>
</div>
</body></html>`

  return { subject, text, html }
}
