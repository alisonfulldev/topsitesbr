'use server'

import { sendEmail } from '@/lib/integrations/resend'
import { ADMIN_NOTIFICATION_EMAIL } from '@/lib/config'

export type BriefingData = {
  // Seção 1
  nomeEmpresa: string
  areaAtuacao: string
  endereco: string
  descricao: string
  // Seção 2
  objetivo: string
  publicoAlvo: string
  mensagemPrincipal: string
  // Seção 3
  produtosServicos: string
  possuiFotos: string
  depoimentos: string
  redesSociais: string
  // Seção 4
  estiloDesign: string
  coresPrincipais: string
  exemplosSites: string
  // Seção 5
  formularioContato: string
  integracaoWhatsapp: string
  observacoes: string
}

function row(label: string, value: string) {
  return `<tr>
    <td style="padding:8px 16px 8px 0;color:#6b7280;vertical-align:top;white-space:nowrap;font-size:13px;">${label}</td>
    <td style="padding:8px 0;font-size:14px;color:#111827;">${value || '—'}</td>
  </tr>`
}

function section(title: string, rows: string) {
  return `
<h3 style="margin:24px 0 8px;font-size:15px;color:#111827;border-bottom:1px solid #e5e7eb;padding-bottom:6px;">${title}</h3>
<table style="width:100%;border-collapse:collapse;">${rows}</table>`
}

export async function sendBriefing(data: BriefingData): Promise<{ ok: boolean; error?: string }> {
  try {
    const html = `
<div style="font-family:sans-serif;max-width:680px;margin:0 auto;">
  <h2 style="margin:0 0 4px;font-size:20px;color:#111827;">Novo Briefing Recebido</h2>
  <p style="margin:0 0 20px;color:#6b7280;font-size:13px;">Enviado pelo cliente via /briefing</p>

  ${section('1. Informações da Empresa', [
    row('Nome da empresa', data.nomeEmpresa),
    row('Área de atuação', data.areaAtuacao),
    row('Endereço', data.endereco),
    row('Descrição', data.descricao),
  ].join(''))}

  ${section('2. Objetivos do Site', [
    row('Principal objetivo', data.objetivo),
    row('Público-alvo', data.publicoAlvo),
    row('Mensagem principal', data.mensagemPrincipal),
  ].join(''))}

  ${section('3. Conteúdo e Recursos', [
    row('Produtos/Serviços em destaque', data.produtosServicos),
    row('Possui fotos/imagens?', data.possuiFotos),
    row('Depoimentos/cases?', data.depoimentos),
    row('Redes sociais / outros sites', data.redesSociais),
  ].join(''))}

  ${section('4. Design e Referências', [
    row('Estilo de design', data.estiloDesign),
    row('Cores principais', data.coresPrincipais),
    row('Sites que gosta', data.exemplosSites || '—'),
  ].join(''))}

  ${section('5. Informações Técnicas e Extras', [
    row('Formulário de contato?', data.formularioContato),
    row('Integração WhatsApp/outro?', data.integracaoWhatsapp),
    row('Outras observações', data.observacoes),
  ].join(''))}
</div>`

    await sendEmail({
      to: ADMIN_NOTIFICATION_EMAIL,
      subject: `[TopSite] Briefing — ${data.nomeEmpresa}`,
      html,
    })

    return { ok: true }
  } catch (err) {
    console.error('[briefing] Erro ao enviar e-mail:', err)
    return { ok: false, error: 'Erro ao enviar. Tente novamente.' }
  }
}
