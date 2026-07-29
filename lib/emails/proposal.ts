import { buildHtml } from '@/lib/notifications'
import { sendEmail } from '@/lib/integrations/resend'
import { APP_URL } from '@/lib/config'

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// ── Proposta enviada ao cliente (magic link) ───────────────────────────────────

export async function sendProposalEmail(params: {
  to: string
  clientName: string
  proposalTitle: string
  magicLink: string
  includedItems?: string | null
  creationPrice?: number
}): Promise<void> {
  const { to, clientName, proposalTitle, magicLink, includedItems, creationPrice } = params

  const items = includedItems
    ? includedItems.split('\n').map((l) => l.trim()).filter(Boolean)
    : []

  const itemsHtml =
    items.length > 0
      ? `<div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px 18px;margin-bottom:20px;">
          <p style="margin:0 0 10px;font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.6px;">O que está incluído</p>
          <ul style="margin:0;padding-left:0;list-style:none;">
            ${items.map((item) => `<li style="margin-bottom:8px;font-size:14px;color:#374151;"><span style="color:#22c55e;margin-right:6px;">✓</span>${esc(item)}</li>`).join('')}
          </ul>
        </div>`
      : ''

  const priceHtml =
    creationPrice != null
      ? `<div style="background:#facc15;border-radius:8px;padding:16px;margin-bottom:20px;text-align:center;">
          <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:rgba(0,0,0,0.55);text-transform:uppercase;letter-spacing:0.8px;">Valor total do projeto</p>
          <p style="margin:0;font-size:28px;font-weight:800;color:#1a1a1a;">R$ ${creationPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>`
      : ''

  const noteHtml = `<p style="font-size:12px;color:#9ca3af;text-align:center;margin:0 0 24px;">Este link é exclusivo para você e expira em 30 dias.</p>`

  const extraHtml = itemsHtml + priceHtml + noteHtml

  const html = buildHtml(
    `Você recebeu uma proposta: ${proposalTitle}`,
    `Olá, ${clientName}! Preparamos uma proposta personalizada para o seu projeto. Acesse o link abaixo para visualizar todos os detalhes e aprovar.`,
    'proposal-sent',
    extraHtml,
    magicLink,
    'Ver proposta e aprovar →',
  )

  await sendEmail({
    to,
    subject: `📋 Sua proposta está pronta — ${proposalTitle}`,
    html,
  }).catch(() => {})
}

// ── Pagamento da criação confirmado (cliente) ──────────────────────────────────

export async function sendProposalPaymentConfirmedEmail(params: {
  to: string
  clientName: string
}): Promise<void> {
  const { to, clientName } = params
  const panelUrl = APP_URL + '/painel'

  const extraHtml = `
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px 18px;margin-bottom:24px;">
      <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#15803d;text-transform:uppercase;letter-spacing:0.6px;">O que acontece agora</p>
      <ol style="margin:0;padding-left:18px;font-size:14px;color:#374151;line-height:1.8;">
        <li>Iniciamos o desenvolvimento do seu site</li>
        <li>Você receberá um aviso quando o site estiver pronto para revisão</li>
        <li>Após sua aprovação, publicamos e seu site entra no ar</li>
      </ol>
    </div>
  `

  const html = buildHtml(
    'Pagamento confirmado — projeto em desenvolvimento!',
    `Ótimo, ${clientName}! Recebemos o pagamento e seu projeto já entrou em desenvolvimento. Acompanhe as atualizações pelo painel.`,
    'proposal-approved',
    extraHtml,
    panelUrl,
    'Acompanhar no painel →',
  )

  await sendEmail({
    to,
    subject: '✅ Pagamento confirmado — seu projeto está em desenvolvimento',
    html,
  }).catch(() => {})
}

// ── Atualização de status da proposta (cliente) ────────────────────────────────

export async function sendProposalStatusEmail(params: {
  to: string
  clientName: string
  status: 'em_desenvolvimento' | 'pronto_revisao'
}): Promise<void> {
  const { to, clientName, status } = params
  const panelUrl = APP_URL + '/painel'

  if (status === 'em_desenvolvimento') {
    const html = buildHtml(
      'Seu projeto está em desenvolvimento',
      `Olá, ${clientName}! Boa notícia: seu site já entrou em produção. Acompanhe as etapas e atualizações pelo painel a qualquer momento.`,
      'proposal-status-update',
      undefined,
      panelUrl,
      'Acompanhar progresso →',
    )
    await sendEmail({
      to,
      subject: '🚀 Seu projeto está em desenvolvimento',
      html,
    }).catch(() => {})
    return
  }

  // pronto_revisao
  const projetoUrl = APP_URL + '/painel/projeto'
  const extraHtml = `
    <div style="background:#faf5ff;border:1px solid #e9d5ff;border-radius:8px;padding:16px 18px;margin-bottom:24px;">
      <p style="margin:0;font-size:14px;color:#6b21a8;line-height:1.7;">
        Acesse o painel, confira cada detalhe e nos diga se está tudo certo ou se quer algum ajuste antes da publicação.
      </p>
    </div>
  `

  const html = buildHtml(
    'Seu site está pronto para revisão!',
    `Olá, ${clientName}! O site está finalizado e aguardando a sua aprovação. Dê uma olhada e nos diga o que você acha.`,
    'proposal-status-update',
    extraHtml,
    projetoUrl,
    'Revisar o site →',
  )

  await sendEmail({
    to,
    subject: '🎨 Seu site está pronto — aguardando sua aprovação',
    html,
  }).catch(() => {})
}
