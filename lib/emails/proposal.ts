import { buildHtml } from '@/lib/notifications'
import { sendEmail } from '@/lib/integrations/resend'
import { APP_URL } from '@/lib/config'

const CONTRACT_VERSION = '2026-07'

function contractText(params: {
  clientName: string
  proposalTitle: string
  creationPrice: number
  acceptedAt: Date
}): string {
  const { clientName, proposalTitle, creationPrice, acceptedAt } = params
  const priceFormatted = creationPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
  const dateFmt = acceptedAt.toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    timeZone: 'America/Sao_Paulo',
  })
  return `CONTRATO DE PRESTAÇÃO DE SERVIÇO DE DESENVOLVIMENTO DE SITE

1. Partes: TOP SITE, CNPJ 22.556.759/0001-98 (Contratada) e ${clientName} (Contratante).

2. Objeto: desenvolvimento de um site conforme o escopo da proposta "${proposalTitle}" e do briefing acordado.

3. Valor e pagamento: o valor da proposta refere-se EXCLUSIVAMENTE ao desenvolvimento (criação) do site, no valor de R$ ${priceFormatted}. Pagamento único via Asaas; a confirmação inicia a produção.

4. O que está incluído: os itens listados como inclusos na proposta.

5. Revisão: 1 (uma) rodada de ajustes dentro do escopo do briefing; alterações fora do escopo são orçadas à parte.

6. Prazo de entrega: o site será entregue em até 7 (sete) dias úteis, contados a partir da confirmação do pagamento e do envio, pelo Contratante, de todo o conteúdo necessário para a produção (textos, imagens e informações do briefing).

7. Propriedade: os arquivos do site pertencem ao Contratante, que pode recebê-los mediante solicitação.

8. Responsabilidades do Contratante: veracidade e legalidade do conteúdo, e titularidade/licença de textos e imagens enviados.

9. Serviços não incluídos nesta contratação: publicação, hospedagem, SSL, monitoramento, manutenção, correções e alterações posteriores à entrega, e registro de domínio próprio (o site é disponibilizado em endereço/domínio provisório fornecido pela Contratada). Tais serviços podem ser contratados separadamente.

10. Direito de arrependimento e serviço personalizado: nos termos do art. 49 do CDC, por se tratar de contratação fora de estabelecimento físico, o Contratante poderá desistir em até 7 (sete) dias corridos contados da aprovação, desde que o desenvolvimento ainda não tenha sido iniciado. Uma vez iniciada a produção — o que ocorre após a confirmação do pagamento e o envio do conteúdo —, por se tratar de serviço personalizado e desenvolvido sob encomenda, conforme especificações exclusivas do Contratante, e que não pode ser reaproveitado para terceiros, o valor correspondente ao desenvolvimento já realizado não será restituído, cabendo eventual devolução apenas sobre etapas comprovadamente não executadas. A satisfação estética/subjetiva do Contratante será atendida por meio da rodada de ajustes prevista na cláusula 5, dentro do escopo do briefing, não constituindo motivo para restituição de valores.

11. Aceite: ao marcar a caixa e aprovar, o Contratante declara ter lido e concordado, manifestando vontade eletrônica com validade jurídica nos termos da legislação brasileira.

---
Aceite registrado em: ${dateFmt} (Horário de Brasília)
Versão do contrato: ${CONTRACT_VERSION}`
}

function contractHtml(text: string): string {
  const lines = text.split('\n')
  const htmlLines = lines.map((l) => {
    const trimmed = l.trim()
    if (!trimmed) return '<br>'
    if (trimmed.startsWith('CONTRATO DE')) {
      return `<p style="margin:0 0 16px;font-size:13px;font-weight:700;color:#111827;text-align:center;">${esc(trimmed)}</p>`
    }
    if (trimmed.startsWith('---')) {
      return `<hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0;">`
    }
    const isClause = /^\d+\./.test(trimmed)
    return `<p style="margin:0 0 10px;font-size:13px;color:${isClause ? '#111827' : '#374151'};line-height:1.7;${isClause ? 'font-weight:600;' : ''}">${esc(trimmed)}</p>`
  })
  return `<div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:20px 22px;margin-bottom:24px;font-family:monospace;">
    ${htmlLines.join('\n    ')}
  </div>`
}

// ── E-mail ao cliente: cópia do contrato assinado ─────────────────────────────

export async function sendContractCopyToClient(params: {
  to: string
  clientName: string
  proposalTitle: string
  creationPrice: number
  acceptedAt: Date
}): Promise<void> {
  const { to, clientName, proposalTitle, creationPrice, acceptedAt } = params
  const text = contractText({ clientName, proposalTitle, creationPrice, acceptedAt })
  const panelUrl = APP_URL + '/painel/projeto'

  const extraHtml = `
    <p style="margin:0 0 16px;font-size:14px;color:#374151;line-height:1.7;">
      Segue abaixo a cópia do contrato de desenvolvimento de site que você aceitou eletronicamente. Guarde este e-mail como comprovante.
    </p>
    ${contractHtml(text)}
  `

  const html = buildHtml(
    'Cópia do seu contrato — Top Site',
    `Olá, ${clientName}! Seu contrato foi registrado com sucesso.`,
    'proposal-sent',
    extraHtml,
    panelUrl,
    'Acompanhar projeto →',
  )

  await sendEmail({
    to,
    subject: 'Cópia do seu contrato — Top Site',
    html,
  }).catch(() => {})
}

// ── E-mail ao admin: aviso de contrato assinado ───────────────────────────────

export async function sendContractSignedToAdmin(params: {
  clientName: string
  clientEmail: string
  clientPhone: string | null
  clientDocument: string | null
  proposalTitle: string
  creationPrice: number
  acceptedAt: Date
  ip: string | null
}): Promise<void> {
  const { clientName, clientEmail, clientPhone, clientDocument, proposalTitle, creationPrice, acceptedAt, ip } = params
  const priceFormatted = creationPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
  const dateFmt = acceptedAt.toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    timeZone: 'America/Sao_Paulo',
  })

  const extraHtml = `
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px 20px;margin-bottom:20px;">
      <p style="margin:0 0 10px;font-size:12px;font-weight:700;color:#15803d;text-transform:uppercase;letter-spacing:0.6px;">Dados do cliente</p>
      <table style="width:100%;border-collapse:collapse;font-size:13px;color:#374151;">
        <tr><td style="padding:4px 0;width:120px;color:#6b7280;">Nome</td><td style="padding:4px 0;font-weight:600;">${esc(clientName)}</td></tr>
        <tr><td style="padding:4px 0;color:#6b7280;">E-mail</td><td style="padding:4px 0;">${esc(clientEmail)}</td></tr>
        <tr><td style="padding:4px 0;color:#6b7280;">Telefone</td><td style="padding:4px 0;">${clientPhone ? esc(clientPhone) : '—'}</td></tr>
        <tr><td style="padding:4px 0;color:#6b7280;">CPF/CNPJ</td><td style="padding:4px 0;">${clientDocument ? esc(clientDocument) : '—'}</td></tr>
      </table>
    </div>
    <div style="background:#faf5ff;border:1px solid #e9d5ff;border-radius:8px;padding:16px 20px;margin-bottom:20px;">
      <p style="margin:0 0 10px;font-size:12px;font-weight:700;color:#6b21a8;text-transform:uppercase;letter-spacing:0.6px;">Proposta</p>
      <table style="width:100%;border-collapse:collapse;font-size:13px;color:#374151;">
        <tr><td style="padding:4px 0;width:120px;color:#6b7280;">Título</td><td style="padding:4px 0;font-weight:600;">${esc(proposalTitle)}</td></tr>
        <tr><td style="padding:4px 0;color:#6b7280;">Valor</td><td style="padding:4px 0;font-weight:700;color:#15803d;">R$ ${priceFormatted}</td></tr>
        <tr><td style="padding:4px 0;color:#6b7280;">Aceite em</td><td style="padding:4px 0;">${dateFmt}</td></tr>
        ${ip ? `<tr><td style="padding:4px 0;color:#6b7280;">IP</td><td style="padding:4px 0;font-family:monospace;">${esc(ip)}</td></tr>` : ''}
        <tr><td style="padding:4px 0;color:#6b7280;">Versão</td><td style="padding:4px 0;font-family:monospace;">${CONTRACT_VERSION}</td></tr>
      </table>
    </div>
  `

  const html = buildHtml(
    `Novo contrato assinado — ${clientName}`,
    `O cliente ${clientName} aceitou o contrato da proposta "${proposalTitle}" (R$ ${priceFormatted}).`,
    'proposal-approved',
    extraHtml,
    APP_URL + '/admin/clientes',
    'Ver no painel admin →',
  )

  await sendEmail({
    to: 'alisonfulldev@gmail.com',
    subject: `Novo contrato assinado — ${clientName}`,
    html,
  }).catch(() => {})
}

export { CONTRACT_VERSION }

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

// ── Informações do Site (briefing) enviadas ao admin ──────────────────────────

export async function sendBriefingToAdmin(params: {
  clientName: string
  proposalTitle: string
  briefingData: Record<string, unknown>
}): Promise<void> {
  const { clientName, proposalTitle, briefingData } = params

  const d = briefingData as Record<string, string | string[] | boolean | undefined>

  const sections = [
    { title: '1. Sobre a Empresa', fields: [
      ['Nome da empresa', d.companyName],
      ['Ramo de atuação', d.industry],
      ['Sobre a empresa', d.companyDescription],
      ['Missão / objetivo principal', d.mission],
    ]},
    { title: '2. Objetivo do Site', fields: [
      ['Objetivos selecionados', Array.isArray(d.goals) ? d.goals.join(', ') : d.goals],
      ['Outro objetivo', d.goalsOther],
    ]},
    { title: '3. Público-alvo', fields: [
      ['Quem é o público-alvo', d.targetAudience],
      ['Cidades / regiões que atende', d.regions],
    ]},
    { title: '4. Conteúdo', fields: [
      ['Serviços / produtos a apresentar', d.services],
      ['Serviço em destaque', d.highlightedService],
      ['Possui textos prontos?', d.hasTexts === 'sim' ? 'Sim' : 'Não'],
      ['Textos prontos', d.texts],
    ]},
    { title: '5. Identidade Visual', fields: [
      ['Possui logotipo?', d.hasLogo === 'sim' ? 'Sim' : 'Não'],
      ['Cores da marca', d.brandColors],
    ]},
    { title: '6. Informações de Contato', fields: [
      ['WhatsApp', d.contactWhatsapp],
      ['Telefone', d.contactPhone],
      ['E-mail', d.contactEmail],
      ['Endereço', d.contactAddress],
      ['Horário de atendimento', d.contactHours],
      ['Redes sociais', d.contactSocial],
    ]},
    { title: '7. Funcionalidades', fields: [
      ['Funcionalidades selecionadas', Array.isArray(d.features) ? d.features.join(', ') : d.features],
      ['Outra funcionalidade', d.featuresOther],
    ]},
    { title: '8. Referências', fields: [
      ['Sites que gosta', d.sitesLike],
      ['Sites que não gosta', d.sitesDislike],
    ]},
    { title: '9. Observações Finais', fields: [
      ['Observações', d.finalNotes],
    ]},
  ]

  const textBody = sections.map(s => {
    const lines = s.fields
      .filter(([, v]) => v != null && v !== '')
      .map(([k, v]) => `  ${k}: ${v}`)
    if (!lines.length) return ''
    return `${s.title}\n${lines.join('\n')}`
  }).filter(Boolean).join('\n\n')

  const htmlSections = sections.map(s => {
    const rows = s.fields
      .filter(([, v]) => v != null && v !== '')
      .map(([k, v]) => `<tr><td style="padding:4px 8px 4px 0;color:#6b7280;font-size:13px;vertical-align:top;white-space:nowrap;">${esc(String(k))}</td><td style="padding:4px 0;font-size:13px;color:#111827;white-space:pre-wrap;">${esc(String(v))}</td></tr>`)
    if (!rows.length) return ''
    return `<h3 style="margin:16px 0 8px;font-size:13px;color:#374151;">${esc(s.title)}</h3><table style="width:100%;border-collapse:collapse;">${rows.join('')}</table>`
  }).filter(Boolean).join('')

  const extraHtml = `
    <p style="margin:0 0 16px;font-size:14px;color:#374151;">
      O cliente <strong>${esc(clientName)}</strong> enviou as informações para o projeto <strong>${esc(proposalTitle)}</strong>.
    </p>
    ${htmlSections}
  `

  const html = buildHtml(
    `Informações do site — ${clientName}`,
    `Informações do site recebidas — ${clientName} / ${proposalTitle}`,
    'proposal-approved',
    extraHtml,
    APP_URL + '/admin/clientes',
    'Ver no painel admin →',
  )

  // textBody is used for logging/debugging only — sendEmail only supports html
  void textBody
  await sendEmail({
    to: 'alisonfulldev@gmail.com',
    subject: `Informações do site recebidas — ${clientName}`,
    html,
  })
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
