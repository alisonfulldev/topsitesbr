import { prisma } from '@/lib/prisma'
import { TERMS_VERSION } from '@/lib/config'

// ─── Snapshot imutável do texto dos termos por versão ─────────────────────────
// Quando os termos mudarem, incremente TERMS_VERSION em lib/config.ts e adicione
// a nova chave aqui. O conteúdo gravado aqui é o que o cliente efetivamente leu.

const TERMS_SNAPSHOTS: Record<string, string> = {
  '1.2': `
<p style="color:#6b7280;font-size:13px;margin:0 0 24px;"><strong>Última atualização:</strong> outubro de 2026</p>

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
    <tr style="background:#f9fafb;"><td style="padding:7px 10px;border:1px solid #e5e7eb;">Prazo de execução de alterações</td><td style="text-align:center;border:1px solid #e5e7eb;">até 15 dias úteis</td><td style="text-align:center;border:1px solid #e5e7eb;">até 7 dias úteis</td></tr>
    <tr><td style="padding:7px 10px;border:1px solid #e5e7eb;">Correções ilimitadas e gratuitas</td><td style="text-align:center;border:1px solid #e5e7eb;">✓</td><td style="text-align:center;border:1px solid #e5e7eb;">✓</td></tr>
    <tr style="background:#f9fafb;"><td style="padding:7px 10px;border:1px solid #e5e7eb;">Relatório de visitas</td><td style="text-align:center;border:1px solid #e5e7eb;">—</td><td style="text-align:center;border:1px solid #e5e7eb;">✓ completo</td></tr>
    <tr><td style="padding:7px 10px;border:1px solid #e5e7eb;">Suporte via WhatsApp direto</td><td style="text-align:center;border:1px solid #e5e7eb;">—</td><td style="text-align:center;border:1px solid #e5e7eb;">✓</td></tr>
    <tr style="background:#f9fafb;"><td style="padding:7px 10px;border:1px solid #e5e7eb;">Desconto em serviços avulsos e upsells</td><td style="text-align:center;border:1px solid #e5e7eb;">—</td><td style="text-align:center;border:1px solid #e5e7eb;">10%</td></tr>
  </tbody>
</table>
<p>Primeiro mês gratuito para novos clientes. Cobranças mensais automáticas via Pix, boleto ou cartão de crédito, processadas pelo Asaas. Renovação automática até cancelamento.</p>

<h3>3. Correções × Alterações de Conteúdo</h3>
<p><strong>Correção</strong>: ajuste de erro pré-existente — texto errado, link quebrado, dado desatualizado. Ilimitada e gratuita em qualquer plano, não consome nenhum limite.</p>
<p><strong>Alteração de conteúdo</strong>: substituição intencional de texto ou imagem por novo conteúdo escolhido pelo cliente. Todas as alterações de conteúdo são cobradas avulso, independentemente do plano:</p>
<ul>
  <li>Alteração de Texto: R$ 20,00</li>
  <li>Alteração de Imagem: R$ 40,00</li>
  <li>Alteração de Texto e Imagem: R$ 60,00</li>
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
  'apresentacao-1.0': `
<p style="font-weight:700;font-size:15px;margin:0 0 20px;">Contrato de Prestação de Serviço de Desenvolvimento de Site</p>

<p><strong>1. Partes:</strong> TOP SITE, CNPJ 22.556.759/0001-98 (Contratada) e {{NOME}} (Contratante).</p>

<p><strong>2. Objeto:</strong> desenvolvimento de um site conforme o escopo da proposta aprovada e do briefing acordado.</p>

<p><strong>3. Valor e pagamento:</strong> o valor refere-se EXCLUSIVAMENTE ao desenvolvimento (criação) do site, no valor de R$ 97,00. Pagamento único via Asaas; a confirmação inicia a produção.</p>

<p><strong>4. O que está incluído:</strong> os itens listados como inclusos na proposta.</p>

<p><strong>5. Revisão:</strong> 1 (uma) rodada de ajustes dentro do escopo do briefing; alterações fora do escopo são orçadas à parte.</p>

<p><strong>6. Prazo de entrega:</strong> o site será entregue em até 7 (sete) dias úteis, contados a partir da confirmação do pagamento e do envio, pelo Contratante, de todo o conteúdo necessário para a produção.</p>

<p><strong>7. Propriedade:</strong> os arquivos do site pertencem ao Contratante, que pode recebê-los mediante solicitação.</p>

<p><strong>8. Responsabilidades do Contratante:</strong> veracidade e legalidade do conteúdo, e titularidade/licença de textos e imagens enviados.</p>

<p><strong>9. Serviços não incluídos:</strong> publicação, hospedagem, SSL, monitoramento, manutenção, correções e alterações posteriores à entrega, e registro de domínio próprio. Tais serviços podem ser contratados separadamente.</p>

<p><strong>10. Direito de arrependimento:</strong> por se tratar de contratação fora de estabelecimento físico, o Contratante poderá desistir em até 7 dias corridos, desde que a produção não tenha sido iniciada. Uma vez iniciada, por ser serviço personalizado e sob encomenda, o valor correspondente ao desenvolvimento já realizado não será restituído.</p>

<p><strong>11. Aceite:</strong> ao marcar a caixa e confirmar, o Contratante declara ter lido e concordado, manifestando vontade eletrônica com validade jurídica nos termos da legislação brasileira. Versão do contrato: 2026-07.</p>
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
