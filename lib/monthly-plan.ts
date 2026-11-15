import { prisma } from '@/lib/prisma'
import { COMPANY_CNPJ, COMPANY_NAME } from '@/lib/config'

// ─── Plano mensal sem taxa de criação ─────────────────────────────────────────
// Cliente cadastrado com entryFlow = "mensal": paga só a mensalidade (valor definido
// no cadastro), exclusivamente por Pix com Pix Automático, sem fidelidade (desde a mensal-1.1); sem pagamento, o site sai do ar (desde a mensal-1.2).
// Contratos mensal-1.0 (Angelita, Marcos) mantêm a fidelidade de 6 meses que foi assinada.

export const MONTHLY_ENTRY_FLOW = 'mensal'
export const MONTHLY_PLAN_NAME = 'Site Mensal'
export const MONTHLY_CONTRACT_VERSION = 'mensal-1.3'
// Fidelidade só dos contratos mensal-1.0 (assinados antes da mudança)
export const FIDELITY_MONTHS = 6
// Acréscimo sobre o saldo das mensalidades restantes na quitação antecipada
export const EARLY_TERMINATION_RATE = 0.02
export const DOMAIN_ANNUAL_PRICE = 90
// Taxa para reativar o site depois do 10º dia de atraso (cláusula 6.3 do contrato mensal)
export const REACTIVATION_FEE = 50
export const CONTACT_EMAIL = 'contato@topsitebr.com.br'
export const CONTACT_WHATSAPP_DISPLAY = '(18) 99674-2364'

export function isMonthlyClient(client: { entryFlow: string | null | undefined }) {
  return client.entryFlow === MONTHLY_ENTRY_FLOW
}

export function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

// Valor efetivo de uma assinatura: o próprio (plano mensal) ou o do plano
export function subscriptionPrice(sub: { customPrice?: unknown; plan: { price: unknown } }): number {
  return sub.customPrice != null ? Number(sub.customPrice) : Number(sub.plan.price)
}

// Plano interno ao qual as assinaturas mensais ficam vinculadas (o valor real fica em customPrice)
export async function ensureMonthlyPlan() {
  return prisma.plan.upsert({
    where: { name: MONTHLY_PLAN_NAME },
    update: {},
    create: {
      name: MONTHLY_PLAN_NAME,
      price: 0,
      monthlyChangesIncluded: 0,
      allowedChangeTypes: '',
      changeDeadlineDays: 15,
      discountPercent: 0,
    },
  })
}

// ─── Fidelidade ───────────────────────────────────────────────────────────────

export function addMonths(date: Date, months: number) {
  const d = new Date(date)
  d.setMonth(d.getMonth() + months)
  return d
}

/**
 * Saldo de quitação antecipada: mensalidades que faltam para completar a fidelidade,
 * acrescidas de 2%. Zero quando a fidelidade já terminou.
 */
export function earlyTerminationQuote(params: {
  monthlyPrice: number
  paidMonths: number
  fidelityEndsAt: Date | null
  now?: Date
}) {
  const now = params.now ?? new Date()
  const inFidelity = !!params.fidelityEndsAt && now < params.fidelityEndsAt
  const remainingMonths = inFidelity ? Math.max(0, FIDELITY_MONTHS - params.paidMonths) : 0
  const base = remainingMonths * params.monthlyPrice
  const total = Math.round(base * (1 + EARLY_TERMINATION_RATE) * 100) / 100
  return { inFidelity, remainingMonths, base, total }
}

// ─── Contrato ─────────────────────────────────────────────────────────────────

function esc(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export interface MonthlyContractData {
  name: string
  document: string | null
  email: string
  phone: string | null
  monthlyPrice: number
  acceptedAt?: Date
}

/** Texto do contrato do plano mensal, já preenchido com os dados do cliente. */
export function buildMonthlyContract(data: MonthlyContractData): string {
  const price = formatBRL(data.monthlyPrice)
  const acceptedAt = data.acceptedAt
    ? data.acceptedAt.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : 'no momento do aceite eletrônico'

  return `
<p style="font-weight:700;font-size:15px;margin:0 0 4px;">Contrato de Prestação de Serviços — Site por Assinatura Mensal</p>
<p style="color:#6b7280;font-size:13px;margin:0 0 20px;">Versão ${MONTHLY_CONTRACT_VERSION} · Data do aceite: ${esc(acceptedAt)}</p>

<h3>1. Partes</h3>
<p><strong>CONTRATADA:</strong> ${COMPANY_NAME}, CNPJ ${COMPANY_CNPJ}, e-mail ${CONTACT_EMAIL}, WhatsApp ${CONTACT_WHATSAPP_DISPLAY}.</p>
<p><strong>CONTRATANTE:</strong> ${esc(data.name)}, CPF/CNPJ ${esc(data.document || 'não informado')}, e-mail ${esc(data.email)}, telefone ${esc(data.phone || 'não informado')}.</p>

<h3>2. Objeto</h3>
<p>2.1. A CONTRATADA cria, publica e mantém no ar um site para o CONTRATANTE, na modalidade de assinatura mensal, <strong>sem cobrança de taxa de criação</strong>.</p>
<p>2.2. A assinatura inclui:</p>
<ul>
  <li>criação do site conforme o modelo e as informações enviadas pelo CONTRATANTE;</li>
  <li>publicação e hospedagem do site;</li>
  <li>certificado de segurança (SSL);</li>
  <li><strong>painel administrativo</strong>, para o próprio CONTRATANTE editar o conteúdo do site (textos, imagens e informações);</li>
  <li>suporte técnico sobre o funcionamento do site e do painel.</li>
</ul>
<p>2.3. As alterações de conteúdo são feitas pelo próprio CONTRATANTE no painel administrativo. A CONTRATADA não faz alterações de conteúdo como parte da assinatura.</p>
<p>2.4. O CONTRATANTE responde pelo conteúdo que publica no site pelo painel.</p>

<h3>3. Valor</h3>
<p>3.1. O CONTRATANTE paga a mensalidade de <strong>${price}</strong>.</p>
<p>3.2. Não há taxa de criação, de adesão ou de ativação.</p>

<h3>4. Domínio</h3>
<p>4.1. O domínio próprio do site (por exemplo, www.suaempresa.com.br) <strong>não está incluído na mensalidade</strong> e fica por conta do CONTRATANTE.</p>
<p>4.2. O domínio próprio é <strong>opcional</strong>. Se o CONTRATANTE quiser um domínio profissional (por exemplo, seunegocio.com.br), a CONTRATADA registra o domínio e o configura no site pelo valor de <strong>${formatBRL(DOMAIN_ANNUAL_PRICE)} por ano</strong>, pago à parte, por Pix. A renovação é anual, pelo mesmo valor, e deve ser paga antes do vencimento do registro. Sem a renovação, o domínio pode expirar e o site volta a ser publicado no subdomínio da cláusula 4.4.</p>
<p>4.3. O domínio é registrado <strong>em nome do CONTRATANTE</strong> e pertence a ele em qualquer situação, inclusive depois do encerramento do contrato.</p>
<p>4.4. Sem domínio próprio, o site é publicado sem custo em um <strong>subdomínio fornecido pela CONTRATADA</strong>. O CONTRATANTE pode solicitar o domínio profissional depois, a qualquer momento, nas condições da cláusula 4.2.</p>
<p>4.5. O subdomínio faz parte do serviço da CONTRATADA e não pertence ao CONTRATANTE. Ele deixa de funcionar quando o contrato é encerrado.</p>

<h3>5. Forma de pagamento</h3>
<p>5.1. Todos os pagamentos são feitos <strong>exclusivamente por Pix</strong>.</p>
<p>5.2. <strong>A primeira mensalidade vence no ato da contratação e deve ser paga imediatamente.</strong> O site só é publicado depois da confirmação desse pagamento.</p>
<p>5.3. As mensalidades seguintes vencem todo mês, na mesma data do primeiro pagamento, e são cobradas por Pix.</p>

<h3>6. Atraso no pagamento</h3>
<p>6.1. Se uma mensalidade não for paga no vencimento, a CONTRATADA avisa o CONTRATANTE por e-mail e pelo painel: no dia do vencimento, com o link de pagamento; no 5º dia de atraso, com o alerta de que o site sairá do ar; e no 10º dia de atraso o site é retirado do ar.</p>
<p>6.2. Se o pagamento for regularizado <strong>até o 10º dia de atraso</strong>, o CONTRATANTE paga apenas a mensalidade vencida, sem nenhum acréscimo.</p>
<p>6.3. A partir do 11º dia de atraso, com o site fora do ar, a reativação custa <strong>${formatBRL(REACTIVATION_FEE)}</strong>, pagos junto com <strong>uma</strong> mensalidade vencida.</p>
<p>6.4. A regra é a mesma por mais tempo que o site fique fora do ar (por exemplo, 3 meses): o CONTRATANTE paga somente <strong>uma mensalidade mais a taxa de reativação</strong>. As mensalidades do período em que o site ficou fora do ar não são cobradas.</p>

<h3>7. Encerramento e reembolso</h3>
<p>7.1. <strong>Não há fidelidade.</strong> O CONTRATANTE pode encerrar a assinatura a qualquer momento, pelo painel do cliente ou pelo WhatsApp oficial, <strong>sem multa</strong>. O encerramento vale ao fim do mês já pago, e o site sai do ar.</p>
<p>7.2. O serviço é prestado continuamente desde o primeiro mês: o site é criado, publicado e mantido no ar, com o painel liberado. Por isso, <strong>mensalidades já pagas não são reembolsadas</strong>, salvo nos casos previstos em lei.</p>

<h3>8. Direito de arrependimento</h3>
<p>8.1. Como a contratação é feita pela internet, o CONTRATANTE pode desistir em até <strong>7 (sete) dias corridos</strong> do aceite (art. 49 do Código de Defesa do Consumidor).</p>
<p>8.2. A desistência é feita pelo painel ou pelo WhatsApp oficial.</p>

<h3>9. Propriedade do site</h3>
<p>9.1. O site é disponibilizado ao CONTRATANTE como parte do serviço de assinatura.</p>
<p>9.2. O domínio próprio registrado em nome do CONTRATANTE pertence a ele em qualquer situação, conforme a cláusula 4.3.</p>

<h3>10. Responsabilidades do CONTRATANTE</h3>
<ul>
  <li>Enviar e publicar informações e materiais verdadeiros, com direito de uso sobre textos, imagens e marcas.</li>
  <li>Manter os dados de cadastro atualizados.</li>
  <li>Manter em sigilo as senhas de acesso ao painel do cliente e ao painel administrativo do site.</li>
</ul>

<h3>11. Disponibilidade</h3>
<p>A CONTRATADA se esforça para manter o site no ar continuamente. Indisponibilidades técnicas pontuais não geram desconto ou reembolso, salvo negligência comprovada da CONTRATADA.</p>

<h3>12. Dados pessoais</h3>
<p>Os dados do CONTRATANTE são tratados conforme a Lei Geral de Proteção de Dados (Lei 13.709/2018) e a Política de Privacidade publicada em topsitebr.com.br/privacidade, apenas para prestar o serviço e fazer as cobranças.</p>

<h3>13. Aceite eletrônico e cópia</h3>
<p>13.1. Ao marcar a caixa de aceite e confirmar no painel, o CONTRATANTE declara que leu e concorda com este contrato. O aceite eletrônico tem validade jurídica (MP 2.200-2/2001, art. 10, § 2º).</p>
<p>13.2. O sistema registra a data, o horário, o endereço IP e a versão do contrato aceito.</p>
<p>13.3. Uma cópia do contrato aceito é enviada por e-mail ao CONTRATANTE e à CONTRATADA.</p>

<h3>14. Foro</h3>
<p>Fica eleito o foro da Comarca de São Paulo/SP, ressalvado o direito do consumidor de propor ação no foro do próprio domicílio.</p>
`.trim()
}
