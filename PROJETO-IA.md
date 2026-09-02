# TopSite — Módulo de Criação de Site por IA (Chat)

> **IMPORTANTE — LEIA PRIMEIRO:** Este é um MÓDULO NOVO e ISOLADO, um INCREMENTO.
> NÃO altere, quebre ou interfira em nada que já existe no sistema (propostas,
> orçamento, clientes, cobrança, briefing, timeline, financeiro, etc.). Tudo que
> já funciona deve continuar funcionando exatamente igual. Este módulo APENAS
> ADICIONA uma nova funcionalidade. Em caso de dúvida entre modificar algo
> existente ou criar algo novo isolado, SEMPRE crie algo novo isolado.

---

## 1. Visão Geral

Um lead acessa um link e cai direto num CHAT com IA (experiência tipo ChatGPT).
A IA conversa, coleta as informações do negócio, e — de forma INVISÍVEL para o
lead — seleciona um template pronto do setor certo e o preenche com os dados. Ao
final, gera o site do lead com um link funcionando na hora. O site abre com um
banner/popup fixo dizendo que o lead deve finalizar (pagar) para tornar o site
permanente.

**Objetivo de negócio:** converter leads FRIOS/CURIOSOS (que hoje se perdem),
além dos quentes. Ao ter algo mágico para mostrar (o site pronto na hora), libera
o uso de tráfego pago de ENGAJAMENTO (custo ~R$2,50/conversa) que hoje é inviável,
em vez de só tráfego de vendas (~R$7/conversa). Mais volume, custo menor, nova
conversão de frios.

---

## 2. Fluxo Completo (SELF-SERVICE — sem WhatsApp)

Importante: o lead faz TUDO sozinho, SEM CONTA nessa primeira fase. NÃO vai para
o WhatsApp em momento nenhum (o WhatsApp tem sido bloqueado pelo Meta e não
escala). Todo o fluxo é self-service na plataforma.

1. Lead clica no anúncio → cai no CHAT com IA (sem conta ainda)
2. IA conversa e coleta os dados do negócio (nome, ramo, serviços, contato...)
3. Por trás (invisível): IA identifica o SETOR e gera o site preenchido
4. IA apresenta 2 MODELOS para o lead escolher
5. Lead escolhe um modelo
6. Sistema pergunta se ele quer alterar algo (textos, imagens):
   - Se sim → ele edita sozinho (self-service)
   - Se não → segue
7. Ao finalizar, o lead vê o site num MOCKUP DE CELULAR (prévia completa e bonita,
   sem link compartilhável ainda). Modal com mockup rolável para ver o site todo.
8. CAPTURA DO LEAD (no FIM, não no início): perto de publicar/ver o site pronto,
   o sistema pede NOME, WHATSAPP e EMAIL → salvo no painel da TopSite.
   Motivo de ser no fim: pedir dados logo no início gera desconfiança e fricção.
   No fim, o lead já está engajado (já viu o site tomando forma) e fornece os
   dados de boa vontade.
9. Pendência bem destacada: "Publicar site e ver link próprio"
10. Lead clica em "Publicar" → paga R$9,90 (1º mês) IMEDIATAMENTE. Barreira
    MÍNIMA de propósito — só R$9,90, SEM domínio obrigatório aqui (jogar R$100 no
    publicar mataria o indeciso frio). Nessa etapa o lead não tem conta/registro
    persistente, então ou paga e publica, ou perde a prévia.
11. Lead paga → recebe o link (tela + email) → site PUBLICADO.
12. AUTOMÁTICO: cria a conta do cliente e envia o login por email (sem ação
    humana — lead pode pagar de madrugada).
13. Após publicado, OFERTAS na escada de valor (cada uma no momento de máxima
    vontade):
    a) DOMÍNIO (por desejo, não obrigado): mostrar contraste endereço temporário
       feio vs endereço profissional (.com.br). R$91/ano, já configurado por nós.
    b) AJUSTE HUMANO (upsell): R$159, uma rodada de ajustes com consultor humano
       (diferencial vs geradores self-service).
14. Mensalidade: R$19/mês a partir do 2º mês.
15. Cliente acessa a tela do cliente já existente (upsells, performance,
    visitantes). Reaproveitar o fluxo existente.
14. (Opcional, segunda parte) → domínio próprio (ver seção 6.1)

### Arquitetura de hospedagem e LIMPEZA (decisão importante)
- **Antes de pagar (prévia):** existe apenas como MOCKUP/prévia na infra da
  TopSite (Vercel). Sem conta, sem link compartilhável.
- **LIMPEZA 1 (prévias abandonadas):** prévias que NÃO viraram pagantes devem ser
  apagadas AUTOMATICAMENTE após um tempo, para não encher o servidor com sites que
  não avançaram. (Ex: prévia sem pagamento após X horas → deletada.)
- **Ao pagar:** o site é publicado e fica INICIALMENTE na infra da TopSite
  (Vercel) → funciona na hora, o lead recebe o link (tela + email). A conta é
  criada e o login enviado AUTOMATICAMENTE.
- **Migração para permanente (manual, após pagamento):** nós subimos o
  código-fonte do site para o GitHub Pages e trocamos o link. Há um prazo de 48h
  para fazer essa migração manual com folga.
- **LIMPEZA 2 (link temporário dos pagantes):** após a migração para o GitHub, o
  link temporário da Vercel expira em 48h (prazo seguro para o trabalho manual de
  migração). O site permanente fica no GitHub (grátis, não sobrecarrega a infra da
  TopSite, que ficaria cara/travaria com 100+ sites permanentes).
- Resumo: prévia = mockup na Vercel (apagada se não pagar); ao pagar = Vercel na
  hora + conta automática; depois = migra manual para GitHub e o link Vercel some
  em 48h. Automatizar a migração quando o volume justificar.

---

## 3. Decisões Técnicas

- **IA (LLM):** Llama via **Groq** (rápido e barato).
- **Publicação dos sites:** infraestrutura atual da TopSite (**Vercel**). NÃO usar
  GitHub Pages (build lento demais para publicação instantânea).
- **Templates:** HTML/CSS/JS puro (vanilla), com campos preenchíveis no formato
  {{CAMPO}}. Cada template acompanha um JSON de "receita" (schema) listando seus
  campos.
- **Preenchimento:** o sistema substitui os {{CAMPO}} pelos dados coletados pela
  IA → gera o HTML final.
- **Templates são NOVOS**, do zero, dedicados a este módulo. A implementação
  antiga de templates NÃO é descontinuada nem afetada.

---

## 4. Setores (6) — público AMPLO, a IA classifica o negócio

DECISÃO: atender público AMPLO (vários setores), NÃO nicho único. Motivo: o motor
do modelo é TRÁFEGO PAGO BARATO de alto volume (engajamento ~R$2,50/conversa).
Público restrito (ex: só médicos) ENCARECE o tráfego (leilão mais caro, menos
volume) e quebra essa lógica. Público amplo mantém o tráfego barato e o volume.

MAS amplo NÃO pode virar genérico (senão vira "mais um Webnode"). O que evita isso:
- TEMPLATES EXCEPCIONAIS (qualidade muito acima da média — é o que separa do
  Webnode e dos genéricos).
- IA gera TEXTOS ESPECÍFICOS por profissão (cada cliente sente que é feito pra
  ele, mesmo o produto sendo amplo).
- TOQUE HUMANO disponível (upsell de ajuste com consultor — diferencial vs
  geradores self-service frios).
Resultado: volume do amplo + sensação de específico.

Os 6 setores (a IA classifica o negócio em um):
1. **Saúde & Bem-estar** — clínicas, dentistas, psicólogos, nutricionistas,
   estética, spa, terapias alternativas. Visual: claro, limpo, confiável.
   (JÁ TEM 2 modelos prontos.)
2. **Jurídico & Profissional** — advogados, contadores, consultores, corretores,
   arquitetos, engenheiros. Visual: sóbrio, elegante, autoridade.
3. **Serviços & Negócios em Geral (CORINGA)** — prestadores, autônomos,
   assistência técnica, pet shop, oficina, e qualquer negócio que não encaixe em
   outro setor (inclusive profissões incomuns). Visual: versátil, moderno, neutro.
   Fallback quando a IA não souber classificar.
4. **Beleza & Estilo** — barbearia, salão, manicure, tatuador, sobrancelha.
   Visual: estiloso, moderno, com personalidade.
5. **Alimentação** — restaurante, lanchonete, pizzaria, delivery, confeitaria,
   bar. Visual: apetitoso, acolhedor, fotos de destaque.
6. **Comércio & Loja** — loja, boutique, revenda, catálogo, comércio local.
   Visual: vitrine, produtos em destaque.

Começar com 2 modelos por setor (a IA mostra 2 para o lead escolher). Saúde já
está pronta; adicionar os outros setores. A qualidade dos templates deve ser
EXCEPCIONAL em todos.

---

## 5. Campos Padronizados dos Templates

Cada template deve conter (via placeholders {{}}):
- {{LOGO}} — logotipo do cliente (IMAGEM, opcional). Se houver imagem, exibe o
  logo; se não houver, exibe {{NOME_EMPRESA}} em texto estilizado (fallback). Todo
  template precisa suportar os dois casos (logo-imagem OU nome-texto).
- {{NOME_EMPRESA}}
- {{SLOGAN}}
- {{SOBRE_TEXTO}}
- {{SERVICO_N}} e {{SERVICO_N_DESC}} (até 6)
- {{DIFERENCIAL_1/2/3}}
- {{DEPOIMENTO_N}} e {{DEPOIMENTO_N_AUTOR}} (até 3)
- {{TELEFONE}}, {{WHATSAPP}}, {{ENDERECO}}, {{HORARIO}}
- {{INSTAGRAM}}, {{FACEBOOK}} (opcionais)

Cada template tem um JSON de receita (ex: saude.schema.json) listando: nome do
campo, descrição, obrigatório/opcional, limite (ex: serviços até 6), tipo (texto
ou imagem).

Como o cliente envia o LOGO (upload no chat, na edição, ou adiciona depois na
tela do cliente) é decisão do fluxo (Sprints 2/3). O template só precisa estar
PREPARADO para receber (ter o campo {{LOGO}} com fallback para o nome em texto).

NOTA DE IMPLEMENTAÇÃO DO LOGO (para a Sprint 3 - geração): a ativação do logo no
template é feita via classe CSS (ex: has-logo) nos elementos de logo do cabeçalho
e rodapé. Portanto, o gerador automático, quando o cliente TIVER logo, precisa
fazer DUAS coisas: (1) substituir {{LOGO}} pela URL da imagem E (2) adicionar a
classe has-logo aos elementos de logo. Quando NÃO tiver logo, não faz nada (fica o
nome em texto, fallback). Garantir que a Sprint 3 trate essa lógica da classe, não
só a substituição de texto.

---

## 6. Modelo de Negócio (ESCADA DE VALOR — barreira mínima na entrada)

Princípio: maximizar quem chega até o site pronto (barreira mínima) e monetizar
na hora da POSSE (quando o encantamento é máximo). Cada item é oferecido no
momento de máxima vontade — não tudo amontoado no "publicar" (que mataria o
indeciso frio, justamente o público que o tráfego de engajamento barato captura).

A ESCADA (na ordem):
1. **Chat + geração:** SEM mencionar preço. Deixa o encantamento crescer.
2. **Publicar (1º pagamento, MÍNIMO):** R$9,90 (1º mês). É o momento de máxima
   conversão (acabou de ver o site pronto). NADA de domínio obrigatório aqui —
   jogar R$100 mataria o impulso do frio. Deixa ele ENTRAR barato.
3. **Mensalidade:** R$19/mês a partir do 2º mês (cancele quando quiser).
4. **Domínio (vendido por DESEJO, não obrigado):** R$91/ano, opcional. Oferecido
   DEPOIS de publicado, mostrando o contraste: endereço temporário feio
   (ex: top...com/clinica-jose) vs endereço profissional (clinicajose.com.br). O
   contraste cria o desejo. Vender > obrigar: quem deseja paga feliz e cancela
   menos. Já configurado por nós (cliente não toca em nada técnico) — diferencial
   vs plataformas self-service (Webnode).
5. **Ajuste humano (upsell):** R$159, uma rodada completa de ajustes com um
   consultor humano. É o DIFERENCIAL vs Webnode/genéricos (a IA monta a base, o
   humano refina). Oferecido após publicar.

Cada degrau é oferecido no momento de máxima vontade daquele item. Só para
clientes NOVOS; clientes atuais da TopSite mantêm seus valores. Pagamento
reutiliza Asaas.

NOTA: obrigar domínio na entrada (testado como alternativa) filtra mais e dá mais
caixa imediato, mas MATA o volume de indeciso frio. A escada acima prioriza
volume + monetização por desejo. Se quiser, TESTAR as duas versões e comparar
lucro líquido.

---

## 7. Sprints (construção faseada — cada uma entrega algo TESTÁVEL)

- **Sprint 1 — Templates preenchíveis:** criar os 6 templates (1 por setor) no
  nível "premium", cada um com campos {{}} + JSON de receita. Fazer 1 primeiro
  (Saúde), aprovar, replicar.
- **Sprint 2 — Chat + IA (extração):** interface de chat + Llama via Groq
  conversando e extraindo os dados estruturados. Testar isolado.
- **Sprint 3 — Geração + preview:** dados + template → HTML preenchido → preview.
- **Sprint 4 — Publicação instantânea:** subir o site gerado → link em segundos
  (Vercel).
- **Sprint 5 — Conversão:** banner "finalize" + pagamento + temporário→permanente
  + expiração automática em 48h.

Cada peça é construída e TESTADA isolada antes de juntar. Não construir tudo de
uma vez.

---

## 8. Regras de Ouro do Projeto

- É INCREMENTO: não quebrar nada existente.
- Faseado: uma sprint por vez, cada uma testável.
- Qualidade dos templates é crítica (site feio afasta; site bonito converte).
- Cada peça testada isolada antes de integrar.
- A IA apenas PREENCHE templates prontos — NUNCA gera site/layout do zero.

---

## 9. Roadmap Futuro (NÃO construir agora — só após a v1 validada)

Ideias boas guardadas para versões futuras. NÃO desviar o foco da v1 para elas.

- **Plano 2 — Agendamento (upsell para área da saúde):** um segundo plano, mais
  caro, que adiciona sistema de AGENDAMENTO ao site. É a dor nº 1 da saúde
  (clínicas, dentistas, psicólogos precisam encher/gerenciar a agenda). Modelo de
  tiers: Plano 1 (site, R$29/mês) e Plano 2 (site + agendamento, ticket maior).
  Cuidados: agendamento "simples" tem complexidade real (horários, conflitos,
  cancelamento, notificações). Considerar INTEGRAR ferramenta pronta (Calendly,
  Google Calendar via API) em vez de construir do zero. Só depois da v1 rodando.
- **Outros nichos:** jurídico, beleza & estilo, alimentação, comércio, serviços
  em geral. Replicar o modelo de saúde para novos nichos, um por vez, só depois
  de saúde estar validado e vendendo.
- **Automação de domínio:** registro + DNS automáticos via API de revendedor
  (ex: ResellerClub), quando o volume justificar. Até lá, manual.
- **Edição de imagens no fluxo:** o lead anexa imagem e a IA troca (a edição de
  textos vem antes; imagens logo depois, ainda na v1 se der).