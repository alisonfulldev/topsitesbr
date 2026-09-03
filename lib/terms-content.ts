import { prisma } from '@/lib/prisma'
import { TERMS_VERSION } from '@/lib/config'

// ─── Snapshot imutável do texto dos termos por versão ─────────────────────────
// Quando os termos mudarem, incremente TERMS_VERSION em lib/config.ts e adicione
// a nova chave aqui. O conteúdo gravado aqui é o que o cliente efetivamente leu.

const TERMS_SNAPSHOTS: Record<string, string> = {
  'apresentacao-1.0': `
<p style="color:#6b7280;font-size:13px;margin:0 0 24px;"><strong>Contrato de Prestação de Serviços de Criação de Site — Última atualização:</strong> setembro de 2026</p>

<h3>1. Partes</h3>
<p><strong>Prestadora:</strong> TOP SITE, CNPJ 22.556.759/0001-98 ("TOP SITE").<br>
<strong>Contratante:</strong> pessoa identificada no formulário de contratação ("Cliente").</p>

<h3>2. O que está sendo contratado</h3>
<p>Este contrato tem como objeto exclusivo a <strong>CRIAÇÃO DO SITE</strong> do Cliente, pelo valor de <strong>R$ 97,00 (noventa e sete reais), pagamento único e sem recorrência.</strong></p>
<p>O serviço de criação compreende:</p>
<ul>
  <li>Desenvolvimento do site personalizado com a identidade visual do Cliente (logo, cores, textos e fotos fornecidos)</li>
  <li>1 (uma) rodada de revisão após apresentação do layout</li>
  <li>Entrega dos arquivos finais do site (HTML, CSS e JavaScript) via painel ou e-mail, de propriedade plena do Cliente</li>
</ul>

<h3>3. O que NÃO está incluso neste contrato</h3>
<p style="background:#fef2f2;border-left:3px solid #dc2626;padding:12px 14px;border-radius:4px;"><strong>O valor de R$ 97,00 NÃO inclui hospedagem, publicação na internet, domínio, SSL ou qualquer serviço de manutenção.</strong> São serviços distintos, não contratados aqui.</p>
<ul>
  <li><strong>Hospedagem:</strong> o serviço de colocar o site acessível na internet e no Google não faz parte deste contrato. Sem hospedagem, os arquivos funcionam no computador do Cliente, mas não ficam disponíveis publicamente online.</li>
  <li><strong>Domínio (.com.br ou .com):</strong> não incluso. O Cliente pode usar um domínio próprio ou um subdomínio gratuito fornecido pela TOP SITE, caso contrate o plano de hospedagem separadamente.</li>
  <li><strong>Suporte contínuo e manutenção:</strong> não incluso. O Cliente recebe os arquivos e pode gerenciá-los como preferir.</li>
</ul>

<h3>4. Hospedagem — serviço separado e opcional</h3>
<p>Para que o site fique acessível na internet é necessário um serviço de hospedagem. A TOP SITE oferece um plano de hospedagem mensal (<strong>R$ 19,00/mês</strong>, 1.º mês gratuito, sem fidelidade, cancelável a qualquer momento) que pode ser contratado de forma independente após a entrega dos arquivos. O Cliente pode também optar por contratar hospedagem de outro fornecedor de sua escolha — sem nenhuma obrigação com a TOP SITE além do presente contrato de criação.</p>

<h3>5. Propriedade dos arquivos</h3>
<p>Os arquivos do site desenvolvido pertencem ao Cliente. A TOP SITE não retém, não revende e não restringe o uso dos arquivos entregues. Após o recebimento, o Cliente tem liberdade total para hospedar, modificar ou distribuir o site como desejar.</p>

<h3>6. Prazo de entrega</h3>
<p>Até <strong>7 (sete) dias úteis</strong> após a confirmação do pagamento e o recebimento dos materiais necessários (logo, textos e fotos). O prazo é suspenso enquanto os materiais não forem enviados pelo Cliente.</p>

<h3>7. Direito de Arrependimento</h3>
<p>Conforme o art. 49 do Código de Defesa do Consumidor, o Cliente pode cancelar esta contratação em até <strong>7 (sete) dias corridos</strong> da confirmação do pagamento, com devolução integral do valor pago, desde que a entrega dos arquivos ainda não tenha ocorrido. Após a entrega, aplica-se o disposto no art. 53 do CDC (serviço já prestado). Para exercer o direito: contato@topsite.com.br ou WhatsApp +55 18 99674-2364.</p>

<h3>8. Responsabilidades do Cliente</h3>
<p>O Cliente declara que todos os conteúdos fornecidos (textos, imagens, marca, logo) são de sua titularidade ou têm autorização de uso, não violam direitos de terceiros e não são difamatórios, ilegais ou enganosos. Qualquer responsabilidade decorrente do conteúdo publicado é exclusiva do Cliente.</p>

<h3>9. Privacidade e LGPD</h3>
<p>Os dados pessoais fornecidos pelo Cliente (nome, e-mail, CPF/CNPJ) são usados exclusivamente para execução deste contrato, emissão de documentos fiscais e comunicações relacionadas ao serviço. A TOP SITE não compartilha dados com terceiros para fins comerciais. Conforme a Lei Geral de Proteção de Dados (Lei 13.709/2018), o Cliente pode solicitar acesso, correção ou exclusão de seus dados a qualquer momento pelo e-mail contato@topsite.com.br.</p>

<h3>10. Lei Aplicável e Foro</h3>
<p>Este contrato é regido pelas leis da República Federativa do Brasil. As partes elegem o foro da Comarca de São Paulo/SP para dirimir eventuais controvérsias, sem prejuízo de outros meios de resolução.</p>

<h3>11. Contato</h3>
<p>contato@topsite.com.br · WhatsApp: +55 18 99674-2364</p>
`,
  '1.1': `
<p style="color:#6b7280;font-size:13px;margin:0 0 24px;"><strong>Última atualização:</strong> setembro de 2026</p>

<h3>1. Objeto e Partes</h3>
<p>Estes Termos de Uso regulam a prestação de serviços de hospedagem, manutenção e suporte de sites oferecidos por <strong>TOP SITE</strong>, CNPJ 22.556.759/0001-98, ao cliente que contratou os serviços por meio do painel de gestão ou por contato direto via WhatsApp. Ao ativar sua assinatura e marcar o aceite neste instrumento, o cliente concorda integralmente com todas as disposições abaixo.</p>

<h3>2. Planos e Assinatura</h3>
<p>A TOP SITE oferece dois planos de hospedagem mensal, sem contrato de fidelidade:</p>
<table style="width:100%;border-collapse:collapse;font-size:13px;margin:12px 0;">
  <thead>
    <tr style="background:#f3f4f6;">
      <th style="text-align:left;padding:8px 10px;border:1px solid #e5e7eb;">Benefício</th>
      <th style="text-align:center;padding:8px 10px;border:1px solid #e5e7eb;">Básico — R$ 17/mês</th>
      <th style="text-align:center;padding:8px 10px;border:1px solid #e5e7eb;">Plus — R$ 29/mês</th>
    </tr>
  </thead>
  <tbody>
    <tr><td style="padding:7px 10px;border:1px solid #e5e7eb;">Site no ar + SSL + monitoramento</td><td style="text-align:center;border:1px solid #e5e7eb;">✓</td><td style="text-align:center;border:1px solid #e5e7eb;">✓</td></tr>
    <tr style="background:#f9fafb;"><td style="padding:7px 10px;border:1px solid #e5e7eb;">Alterações de conteúdo incluídas/mês</td><td style="text-align:center;border:1px solid #e5e7eb;">0</td><td style="text-align:center;border:1px solid #e5e7eb;">1 (texto OU imagem)</td></tr>
    <tr><td style="padding:7px 10px;border:1px solid #e5e7eb;">Prazo de execução de alterações</td><td style="text-align:center;border:1px solid #e5e7eb;">até 15 dias úteis</td><td style="text-align:center;border:1px solid #e5e7eb;">até 7 dias úteis</td></tr>
    <tr style="background:#f9fafb;"><td style="padding:7px 10px;border:1px solid #e5e7eb;">Correções ilimitadas e gratuitas</td><td style="text-align:center;border:1px solid #e5e7eb;">✓</td><td style="text-align:center;border:1px solid #e5e7eb;">✓</td></tr>
    <tr><td style="padding:7px 10px;border:1px solid #e5e7eb;">Relatório de visitas</td><td style="text-align:center;border:1px solid #e5e7eb;">—</td><td style="text-align:center;border:1px solid #e5e7eb;">✓ completo</td></tr>
    <tr style="background:#f9fafb;"><td style="padding:7px 10px;border:1px solid #e5e7eb;">Suporte via WhatsApp direto</td><td style="text-align:center;border:1px solid #e5e7eb;">—</td><td style="text-align:center;border:1px solid #e5e7eb;">✓</td></tr>
    <tr><td style="padding:7px 10px;border:1px solid #e5e7eb;">Desconto em serviços avulsos e upsells</td><td style="text-align:center;border:1px solid #e5e7eb;">—</td><td style="text-align:center;border:1px solid #e5e7eb;">10%</td></tr>
  </tbody>
</table>
<p>Primeiro mês gratuito para novos clientes. Cobranças mensais automáticas via Pix, boleto ou cartão de crédito, processadas pelo Asaas. Renovação automática até cancelamento.</p>

<h3>3. Correções × Alterações de Conteúdo</h3>
<p><strong>Correção</strong>: ajuste de erro pré-existente — texto errado, link quebrado, dado desatualizado. Ilimitada e gratuita em qualquer plano, não consome o limite mensal.</p>
<p><strong>Alteração de conteúdo</strong>: substituição intencional de texto ou imagem por novo conteúdo escolhido pelo cliente. Consome o limite mensal do plano Plus. Clientes do Básico e alterações além do limite são cobrados avulso:</p>
<ul>
  <li>Alteração de Texto: R$ 20,00</li>
  <li>Alteração de Imagem: R$ 40,00</li>
  <li>Alteração de Texto e Imagem: R$ 60,00 (sempre avulsa, em qualquer plano)</li>
  <li>Nova Seção: R$ 40,00</li>
  <li>Nova Página: R$ 70,00</li>
</ul>
<p>Assinantes do Plus têm 10% de desconto nos serviços avulsos acima.</p>

<h3>4. Inadimplência</h3>
<p>Em caso de atraso, a TOP SITE notificará o cliente por e-mail e pelo painel:</p>
<ul>
  <li><strong>Dia 0:</strong> aviso amigável com link para pagamento</li>
  <li><strong>Dia 5:</strong> alerta de despublicação em 5 dias</li>
  <li><strong>Dia 10:</strong> site despublicado</li>
</ul>
<p>Após regularização, o site é republicado sem taxa de reativação. Os arquivos ficam disponíveis para download mesmo durante a inadimplência.</p>

<h3>5. Propriedade do Site</h3>
<p>Os arquivos do site pertencem ao cliente. A TOP SITE não retém nem revende o site. Os arquivos ficam disponíveis para download no painel a qualquer momento.</p>

<h3>6. Cancelamento</h3>
<p>O cliente pode cancelar a assinatura a qualquer momento pelo WhatsApp ou pelo painel. Não há multa ou taxa. Valores já pagos não são reembolsados, exceto nos casos previstos em lei.</p>

<h3>7. Direito de Arrependimento</h3>
<p>Conforme o Código de Defesa do Consumidor (art. 49), o cliente pode cancelar em até 7 dias corridos da contratação, com devolução integral dos valores pagos. Para exercer esse direito: contato@topsite.com.br ou pelo WhatsApp.</p>

<h3>8. Disponibilidade</h3>
<p>A TOP SITE envidará seus melhores esforços para manter o site online de forma contínua. Eventuais indisponibilidades técnicas não gerarão direito a desconto ou reembolso, salvo comprovada negligência do prestador.</p>

<h3>9. Responsabilidades do Cliente</h3>
<ul>
  <li>Manter dados cadastrais atualizados (CPF/CNPJ, e-mail, telefone)</li>
  <li>Garantir que os conteúdos enviados não violam direitos de terceiros e não são difamatórios ou ilegais</li>
  <li>Manter a senha de acesso ao painel em sigilo</li>
</ul>

<h3>10. Alteração dos Termos</h3>
<p>A TOP SITE pode atualizar estes Termos a qualquer momento. O cliente será notificado por e-mail e no painel. O uso continuado dos serviços após a comunicação implica aceite das novas condições.</p>

<h3>11. Lei Aplicável e Foro</h3>
<p>Estes Termos são regidos pelas leis da República Federativa do Brasil. Foro eleito: Comarca de São Paulo/SP.</p>

<h3>12. Contato</h3>
<p>contato@topsite.com.br | WhatsApp: +55 18 99674-2364</p>
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
