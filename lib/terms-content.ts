import { prisma } from '@/lib/prisma'
import { TERMS_VERSION } from '@/lib/config'

// ─── Snapshot imutável do texto dos termos por versão ─────────────────────────
// Quando os termos mudarem, incremente TERMS_VERSION em lib/config.ts e adicione
// a nova chave aqui. O conteúdo gravado aqui é o que o cliente efetivamente leu.

const TERMS_SNAPSHOTS: Record<string, string> = {
  'apresentacao-1.0': `
<p style="color:#6b7280;font-size:13px;margin:0 0 24px;"><strong>Última atualização:</strong> setembro de 2026</p>

<h3>1. Partes</h3>
<p><strong>TOP SITE</strong>, CNPJ 22.556.759/0001-98, e o cliente identificado no formulário de contratação.</p>

<h3>2. Objeto — Criação do Site (R$ 97,00)</h3>
<p>A contratação no valor de <strong>R$ 97,00 (noventa e sete reais)</strong> refere-se <strong>exclusivamente</strong> à criação e entrega dos arquivos do site (HTML, CSS e JavaScript), personalizado com a identidade visual do cliente (logo, cores, textos e fotos).</p>
<p style="background:#fef9c3;border-left:3px solid #ca8a04;padding:10px 14px;border-radius:4px;font-size:13px;"><strong>Atenção:</strong> O valor de R$ 97,00 <strong>não inclui</strong> hospedagem, publicação na internet, domínio ou qualquer serviço recorrente. Para que o site fique acessível online é necessário um serviço de hospedagem, cobrado separadamente.</p>

<h3>3. Hospedagem (opcional — R$ 19/mês)</h3>
<p>A TOP SITE oferece o plano <strong>Site no Ar</strong> por <strong>R$ 19,00/mês</strong>, com o primeiro mês gratuito, sem contrato de fidelidade e com cancelamento a qualquer momento. O cliente pode optar por hospedar o site por conta própria usando os arquivos entregues — sem nenhuma obrigação adicional.</p>

<h3>4. O que está incluído no R$ 97,00</h3>
<ul>
  <li>Criação do site personalizado com a identidade do cliente</li>
  <li>1 (uma) rodada de revisão após a entrega</li>
  <li>Entrega dos arquivos finais (HTML/CSS/JS) via painel ou e-mail</li>
</ul>

<h3>5. Prazo de entrega</h3>
<p>Até 7 dias úteis após a confirmação do pagamento e envio das informações necessárias (logo, textos, fotos).</p>

<h3>6. Direito de Arrependimento</h3>
<p>Conforme o Código de Defesa do Consumidor (art. 49), o cliente pode cancelar a contratação em até 7 dias corridos da confirmação do pagamento, com devolução integral do valor pago. Para exercer esse direito: contato@topsite.com.br ou pelo WhatsApp.</p>

<h3>7. Responsabilidade do Cliente</h3>
<p>O cliente declara que os conteúdos fornecidos (textos, imagens) não violam direitos de terceiros, não são difamatórios nem enganosos.</p>

<h3>8. Lei Aplicável</h3>
<p>Estes Termos são regidos pelas leis da República Federativa do Brasil. Foro eleito: Comarca de São Paulo/SP.</p>

<h3>9. Contato</h3>
<p>contato@topsite.com.br · WhatsApp: +55 18 99674-2364</p>
`,
  '1.0': `
<p style="color:#6b7280;font-size:13px;margin:0 0 24px;"><strong>Última atualização:</strong> 23 de julho de 2026</p>

<h3>1. Objeto e Partes</h3>
<p>Estes Termos de Uso regulam a prestação de serviços de hospedagem, manutenção e suporte de sites oferecidos por <strong>TOP SITE</strong>, CNPJ 22.556.759/0001-98, ao cliente que contratou os serviços por meio do painel de gestão disponível em nosso site ou por contato direto via WhatsApp.</p>
<p>Ao ativar sua assinatura e marcar o aceite neste instrumento, o cliente concorda integralmente com todas as disposições abaixo.</p>

<h3>2. Plano e Assinatura</h3>
<p>O plano contratado é o <strong>Site no Ar</strong>, com as seguintes características:</p>
<ul>
  <li>Valor: <strong>R$ 29,00 por mês</strong></li>
  <li>Primeiro mês gratuito para novos clientes; a partir do segundo mês a cobrança mensal será iniciada automaticamente na data definida no painel</li>
  <li>Cobranças mensais automáticas via Pix, boleto ou cartão de crédito, processadas pelo Asaas</li>
  <li>Sem contrato de fidelidade mínima — o cliente pode cancelar a qualquer momento</li>
  <li>Renovação automática até que o cliente solicite o cancelamento</li>
</ul>

<h3>3. O que está incluído</h3>
<ul>
  <li>Hospedagem do site com SSL ativo e renovado automaticamente</li>
  <li>Monitoramento 24h com notificação em caso de queda</li>
  <li><strong>1 (uma) alteração de conteúdo por mês</strong> — texto ou imagem — com prazo de execução de até 7 dias úteis</li>
  <li><strong>Correções ilimitadas e gratuitas</strong>: erros de digitação, links quebrados, dados desatualizados (telefone, endereço). Correções não consomem o limite mensal de alterações</li>
  <li>Suporte via WhatsApp direto</li>
  <li>Relatório mensal de visitas (visitantes, origem, páginas mais vistas)</li>
  <li>10% de desconto em serviços e upgrades avulsos</li>
</ul>

<h3>4. Diferença entre Correção e Alteração</h3>
<p><strong>Correção</strong>: ajuste de erro pré-existente no site — texto errado, link quebrado, dado desatualizado. Ilimitada e gratuita em qualquer plano.</p>
<p><strong>Alteração de conteúdo</strong>: substituição intencional de texto ou imagem por novo conteúdo escolhido pelo cliente. Consome o limite mensal. Alterações além do limite são cobradas avulso:</p>
<ul>
  <li>Alteração de texto: R$ 20,00</li>
  <li>Alteração de imagem: R$ 40,00</li>
  <li>Alteração de texto e imagem: R$ 60,00</li>
  <li>Nova seção: R$ 50,00</li>
  <li>Nova página: R$ 97,00</li>
</ul>
<p>Serviços avulsos têm desconto de 10% para assinantes (ex: nova seção por R$ 45,00 e nova página por R$ 87,30).</p>

<h3>5. Inadimplência</h3>
<p>Em caso de atraso no pagamento, TOP SITE notificará o cliente por e-mail e pelo painel. O fluxo de inadimplência funciona da seguinte forma:</p>
<ul>
  <li><strong>Dia 0:</strong> e-mail de aviso amigável com link para pagamento</li>
  <li><strong>Dia 5:</strong> e-mail de alerta informando que o site será despublicado em 5 dias</li>
  <li><strong>Dia 10:</strong> site temporariamente despublicado. Notificação interna ao administrador para remoção do site do ar</li>
</ul>
<p>Após a regularização do pagamento, o site é republicado sem cobrança de taxa de reativação. Os arquivos do site ficam disponíveis para download no painel mesmo durante a inadimplência.</p>

<h3>6. Propriedade do Site</h3>
<p>Os arquivos e o código do site criado para o cliente pertencem ao próprio cliente. Os arquivos ficam disponíveis para download no painel a qualquer momento. TOP SITE não retém nem revende o site do cliente.</p>

<h3>7. Cancelamento</h3>
<p>O cliente pode cancelar a assinatura a qualquer momento pelo WhatsApp ou pelo painel. Após o cancelamento, o site será despublicado e a assinatura encerrada. Não há multa ou taxa de cancelamento. Valores já pagos não são reembolsados, exceto nos casos previstos em lei.</p>

<h3>8. Direito de Arrependimento</h3>
<p>De acordo com o Código de Defesa do Consumidor (art. 49), contratos celebrados fora do estabelecimento comercial — inclusive por meio digital — admitem arrependimento em até 7 (sete) dias corridos a contar da contratação, com devolução integral dos valores pagos. Para exercer esse direito, entre em contato por contato@topsite.com.br ou pelo WhatsApp.</p>

<h3>9. Disponibilidade</h3>
<p>TOP SITE envidará seus melhores esforços para manter o site do cliente online de forma contínua. Eventuais indisponibilidades técnicas não gerarão direito a desconto ou reembolso, salvo quando comprovada negligência do prestador.</p>

<h3>10. Responsabilidades do Cliente</h3>
<ul>
  <li>Manter seus dados cadastrais atualizados, incluindo CPF/CNPJ, e-mail e telefone</li>
  <li>Garantir que os conteúdos enviados para publicação (textos, imagens) não violam direitos de terceiros, não são difamatórios, ilegais ou enganosos</li>
  <li>Manter sua senha de acesso ao painel em sigilo</li>
</ul>

<h3>11. Alteração dos Termos</h3>
<p>TOP SITE pode atualizar estes Termos a qualquer momento. O cliente será notificado por e-mail e no painel. O uso continuado dos serviços após a comunicação das alterações implica aceite das novas condições.</p>

<h3>12. Lei Aplicável e Foro</h3>
<p>Estes Termos são regidos pelas leis da República Federativa do Brasil. As partes elegem o Foro da Comarca de São Paulo/SP para dirimir eventuais conflitos, sem prejuízo de outros meios alternativos de resolução de disputas.</p>

<h3>13. Contato</h3>
<p>Dúvidas e solicitações: contato@topsite.com.br | WhatsApp: +55 18 99674-2364</p>
`,
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getTermsSnapshot(version: string): string {
  return TERMS_SNAPSHOTS[version] ?? `<p>Texto dos termos (versão ${version}) não encontrado no arquivo.</p>`
}

export async function ensureTermsVersionSeeded(): Promise<void> {
  const content = TERMS_SNAPSHOTS[TERMS_VERSION]
  if (!content) return
  await prisma.termsVersion.upsert({
    where: { version: TERMS_VERSION },
    update: {},
    create: { version: TERMS_VERSION, content },
  })
}

export async function getTermsContentFromDb(version: string): Promise<string | null> {
  const tv = await prisma.termsVersion.findUnique({ where: { version } })
  return tv?.content ?? getTermsSnapshot(version)
}
