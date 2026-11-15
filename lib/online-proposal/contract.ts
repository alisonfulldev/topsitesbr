import { createHash } from 'crypto'
import { COMPANY_CNPJ, COMPANY_NAME } from '@/lib/config'
import { CONTACT_EMAIL, CONTACT_WHATSAPP_DISPLAY, DOMAIN_ANNUAL_PRICE, formatBRL } from '@/lib/monthly-plan'
import type { ProposalExtra } from './config'

export const ONLINE_CONTRACT_VERSION = 'proposta-online-1.1'

function esc(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export interface OnlineContractData {
  name: string
  company: string | null
  document: string | null
  email: string
  whatsapp: string | null
  planKey: string
  planName: string
  setupPrice: number
  monthlyPrice: number
  extras: ProposalExtra[]
  previewLink: string
  signedAt?: Date
}

/** SHA-256 do texto assinado — prova de que o contrato não foi alterado depois. */
export function contractHash(content: string) {
  return createHash('sha256').update(content, 'utf8').digest('hex')
}

/** Contrato da proposta online (sem fidelidade), preenchido com os dados do prospect. */
export function buildOnlineContract(d: OnlineContractData): string {
  const extrasTotal = d.extras.reduce((sum, e) => sum + e.price, 0)
  const total = d.setupPrice + extrasTotal
  const extrasText = d.extras.length ? d.extras.map((e) => `${esc(e.name)} (${formatBRL(e.price)})`).join(', ') : 'nenhum'
  const signedAt = d.signedAt
    ? d.signedAt.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : 'no momento da assinatura eletrônica'
  const withPanel = d.planKey === 'com_painel'

  return `
<p style="font-weight:700;font-size:15px;margin:0 0 4px;">Contrato de Prestação de Serviços — Criação e Manutenção de Site</p>
<p style="color:#6b7280;font-size:13px;margin:0 0 20px;">Versão ${ONLINE_CONTRACT_VERSION} · Data da assinatura: ${esc(signedAt)}</p>

<h3>1. Partes</h3>
<p><strong>CONTRATADA:</strong> ${COMPANY_NAME}, CNPJ ${COMPANY_CNPJ}, e-mail ${CONTACT_EMAIL}, WhatsApp ${CONTACT_WHATSAPP_DISPLAY}.</p>
<p><strong>CONTRATANTE:</strong> ${esc(d.name)}${d.company ? `, ${esc(d.company)}` : ''}, CPF/CNPJ ${esc(d.document || 'informado na assinatura')}, e-mail ${esc(d.email)}, WhatsApp ${esc(d.whatsapp || 'não informado')}.</p>

<h3>2. Objeto</h3>
<p>2.1. A CONTRATADA cria o site do CONTRATANTE com base na <strong>prévia aprovada</strong> por ele na plataforma (${esc(d.previewLink)}), publica o site e o mantém no ar, na modalidade de assinatura mensal.</p>
<p>2.2. <strong>Plano contratado: ${esc(d.planName)}.</strong> ${withPanel
    ? 'O site é publicado com hospedagem e SSL, e o CONTRATANTE recebe um painel administrativo para editar ele mesmo textos, imagens e informações do site.'
    : 'O site é publicado com hospedagem e SSL; as alterações de conteúdo são feitas pela CONTRATADA, conforme a cláusula 7.'}</p>
<p>2.3. <strong>Extras contratados:</strong> ${extrasText}.</p>

<h3>3. Valores</h3>
<p>3.1. <strong>Setup (criação e publicação do site):</strong> ${formatBRL(d.setupPrice)}.</p>
<p>3.2. <strong>Extras:</strong> ${formatBRL(extrasTotal)}, pagos uma única vez junto com o setup.</p>
<p>3.3. <strong>Total a pagar na contratação:</strong> ${formatBRL(total)}.</p>
<p>3.4. <strong>Mensalidade (hospedagem, SSL, manutenção e suporte):</strong> ${formatBRL(d.monthlyPrice)}.</p>

<h3>4. Pagamento</h3>
<p>4.1. O setup e os extras são pagos <strong>no ato da contratação</strong>, por <strong>Pix ou cartão de crédito</strong>. A produção começa após a confirmação do pagamento.</p>
<p>4.2. A mensalidade é paga <strong>exclusivamente por Pix</strong>. A <strong>primeira mensalidade vence 30 dias após o pagamento do setup</strong>, e as seguintes todo mês, na mesma data.</p>

<h3>5. Produção e entrega</h3>
<p>5.1. Confirmado o pagamento, o CONTRATANTE envia pelo painel as informações finais do negócio (briefing), e a CONTRATADA desenvolve a versão final a partir da prévia aprovada.</p>
<p>5.2. A versão final é apresentada ao CONTRATANTE para revisão no painel. Ajustes ficam limitados ao escopo da prévia aprovada; pedidos fora desse escopo são orçados à parte.</p>
<p>5.3. Após a aprovação final, a CONTRATADA publica o site.</p>

<h3>6. Domínio</h3>
<p>6.1. O domínio próprio é <strong>opcional</strong> e não está incluído nos valores acima. Se o CONTRATANTE quiser um domínio profissional (ex.: seunegocio.com.br), a CONTRATADA registra e configura o domínio por <strong>${formatBRL(DOMAIN_ANNUAL_PRICE)} por ano</strong>, pago por Pix, a qualquer momento em que ele solicitar. O domínio fica em nome do CONTRATANTE e pertence a ele.</p>
<p>6.2. Sem domínio próprio, o site é publicado sem custo em um <strong>subdomínio fornecido pela CONTRATADA</strong>. O subdomínio faz parte do serviço e deixa de funcionar se o contrato for encerrado.</p>

<h3>7. Alterações e correções</h3>
<p>7.1. Correções de erros (link quebrado, erro de digitação, dado desatualizado) são gratuitas.</p>
<p>7.2. Alterações de conteúdo: no plano <strong>Com painel</strong>, o próprio CONTRATANTE faz pelo painel; no plano <strong>Sem painel</strong>, são cobradas à parte, conforme a tabela vigente exibida no painel.</p>

<h3>8. Atraso no pagamento e cobrança</h3>
<p>8.1. Em caso de atraso da mensalidade, o CONTRATANTE é avisado por e-mail e pelo painel no vencimento e no 5º dia de atraso; no 10º dia, o site é retirado do ar até a regularização, sem taxa de reativação.</p>
<p>8.2. Valores vencidos e não pagos podem ser cobrados por <strong>meios extrajudiciais e judiciais</strong>, inclusive com <strong>inscrição do nome e do CPF/CNPJ em órgãos de proteção ao crédito</strong> (Serasa, SPC, Boa Vista), após a comunicação prévia exigida por lei, e <strong>protesto em cartório</strong>. Na cobrança judicial, o CONTRATANTE arca com custas e honorários fixados pelo juiz.</p>

<h3>9. Cancelamento</h3>
<p>9.1. Não há fidelidade. O CONTRATANTE pode cancelar a mensalidade a qualquer momento, pelo painel ou pelo WhatsApp, <strong>sem multa</strong>. O cancelamento vale ao fim do mês já pago, e o site sai do ar.</p>
<p>9.2. Mensalidades pagas não são reembolsadas, salvo nos casos previstos em lei.</p>

<h3>10. Direito de arrependimento</h3>
<p>Como a contratação é feita pela internet, o CONTRATANTE pode desistir em até <strong>7 dias corridos</strong> (art. 49 do CDC). Se a produção já tiver começado, por ser um serviço personalizado e sob encomenda, o valor do setup correspondente ao trabalho já realizado não é restituído.</p>

<h3>11. Propriedade do site</h3>
<p>Pago o setup, os arquivos do site pertencem ao CONTRATANTE, que pode solicitá-los a qualquer momento.</p>

<h3>12. Responsabilidades do CONTRATANTE</h3>
<ul>
  <li>Enviar informações e materiais verdadeiros, com direito de uso sobre textos, imagens e marcas.</li>
  <li>Manter os dados de cadastro atualizados e as senhas em sigilo.</li>
</ul>

<h3>13. Dados pessoais</h3>
<p>Os dados são tratados conforme a LGPD (Lei 13.709/2018) e a Política de Privacidade publicada em topsitebr.com.br/privacidade, apenas para prestar o serviço e fazer as cobranças.</p>

<h3>14. Assinatura eletrônica</h3>
<p>14.1. O CONTRATANTE assina pela plataforma, marcando o aceite e informando o <strong>nome completo</strong> e o <strong>CPF</strong>. A assinatura eletrônica tem validade jurídica (MP 2.200-2/2001, art. 10, § 2º).</p>
<p>14.2. O sistema registra a data e o horário, o endereço IP, o navegador e o <strong>código de verificação (hash SHA-256)</strong> do texto assinado, que comprova que ele não foi alterado depois.</p>
<p>14.3. Uma cópia é enviada por e-mail ao CONTRATANTE e à CONTRATADA.</p>

<h3>15. Foro</h3>
<p>Fica eleito o foro da Comarca de São Paulo/SP, ressalvado o direito do consumidor de propor ação no foro do próprio domicílio.</p>
`.trim()
}
