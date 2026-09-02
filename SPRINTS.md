# TopSite — Módulo IA: Plano de Sprints (Execução)

> Documento complementar ao PROJETO-IA.md. Aqui está o passo a passo de
> construção, sprint por sprint. Cada sprint entrega algo TESTÁVEL antes de
> passar para a próxima. NÃO construir tudo de uma vez.
>
> REGRA DE OURO: módulo NOVO e ISOLADO. Não alterar/quebrar nada que já existe
> (propostas, orçamento, clientes, cobrança, briefing, etc.). É adição pura.
> Cada peça é testada isolada antes de integrar.

---

## Visão geral das sprints

- **Sprint 1** — Templates preenchíveis (a base)
- **Sprint 2** — Chat + IA (conversa e extração de dados)
- **Sprint 3** — Geração + preview no mockup
- **Sprint 4** — Publicação (pagamento → Vercel → conta automática)
- **Sprint 5** — Migração + domínio + limpeza automática

Ordem obrigatória: cada uma depende da anterior. Não pular.

---

## SPRINT 1 — Templates preenchíveis (6 setores, público amplo)

**Objetivo:** criar 2 modelos por setor (a IA mostra 2 para o lead escolher),
todos com qualidade EXCEPCIONAL. Saúde JÁ está pronta (2 modelos). Adicionar os
outros 5 setores. Um setor/modelo por vez: modelo 1 primeiro, aprovar, depois o 2.

**Setores:** Saúde & Bem-estar (pronto) | Jurídico & Profissional | Serviços &
Negócios em Geral (coringa) | Beleza & Estilo | Alimentação | Comércio & Loja.

**Entrega:** templates HTML/CSS/JS por setor com campos {{}} + JSON de receita.

**STATUS:** Saúde concluída (2 modelos). Faltam os outros 5 setores.

**PROMPT (colar no Claude Code, um setor por vez):**
```
SPRINT 1 — Templates preenchíveis por IA (setor SAÚDE & BEM-ESTAR)

Contexto: módulo onde uma IA conversa com o lead e gera um site preenchendo um
template pronto. Esta sprint cria os TEMPLATES (a base). Leia PROJETO-IA.md na
raiz para o contexto completo.

ISOLAMENTO: módulo NOVO e ISOLADO. NÃO altere/quebre nada existente (propostas,
orçamento, clientes, cobrança, briefing). Adição pura. Crie em pasta própria
(ex: /templates-ia/).

O QUE ENTREGA:
Para SAÚDE & BEM-ESTAR, crie 2 MODELOS diferentes entre si (layouts distintos,
não a mesma coisa com cor trocada — a IA mostrará 2 opções ao lead). Faça o
MODELO 1 completo e caprichado, me mostre para aprovar, e só depois o MODELO 2.

QUALIDADE (nível agência premium, NÃO genérico):
- Setor Saúde: fundo claro/arejado, tons azul/verde suave + branco, confiança,
  cuidado, higiene. Sofisticado e leve.
- Tipografia forte (Google Fonts: títulos marcantes + corpo Poppins/Inter),
  contraste e hierarquia.
- Profundidade: fundos alternados, gradientes sutis, sombras suaves, bordas
  elegantes, muito respiro.
- Micro-interações: animações ao rolar (fade/slide), hover elegante, scroll
  suave, transições 0.3s.
- Ícones de qualidade (Lucide/Font Awesome via CDN, NÃO emojis).
- Imagens Unsplash adequadas a saúde.

ESTRUTURA (one-page): cabeçalho (logo, menu, botão contato) | hero (nome +
slogan + imagem + CTA) | sobre | serviços/especialidades (3-6) | diferenciais
(3 com ícones) | depoimentos (2-3) | contato (tel/WhatsApp, endereço, horário,
mapa placeholder) | rodapé.

CRÍTICO — PREENCHÍVEL POR IA: cada template com campos {{CAMPO}}:
{{NOME_EMPRESA}}, {{SLOGAN}}, {{SOBRE_TEXTO}}, {{SERVICO_1}}..{{SERVICO_6}}
(+ {{SERVICO_N_DESC}}), {{DIFERENCIAL_1..3}}, {{DEPOIMENTO_1..3}}
(+ {{DEPOIMENTO_N_AUTOR}}), {{TELEFONE}}, {{WHATSAPP}}, {{ENDERECO}},
{{HORARIO}}, {{INSTAGRAM}}, {{FACEBOOK}} (opcionais). Para listas variáveis
(serviços), deixe claro como repetir/remover blocos programaticamente.

Crie também um JSON de RECEITA por setor (ex: saude.schema.json) listando cada
campo: nome, descrição, obrigatório/opcional, limite (ex: serviços até 6). Se os
2 modelos usam os mesmos campos, uma receita serve para os dois.

TÉCNICO:
- HTML/CSS/JS PURO (vanilla). Roda em Vercel E GitHub Pages (sem build/framework).
- MOBILE-FIRST e impecável no celular — CRÍTICO (o lead vê num mockup de celular).
- Libs só via CDN. Código limpo, campos {{}} fáceis de localizar/substituir.
- Organize: /templates-ia/saude/modelo-1/, /modelo-2/ + JSON de receita.

Faça SÓ o MODELO 1 de Saúde agora, capriche, me mostre. Depois da aprovação,
faça o MODELO 2. Liste o que criou.
```

**Após aprovar os modelos de cada setor:** use os prompts abaixo para os outros
setores (um por vez, mesma lógica: modelo 1 primeiro, aprovar, depois modelo 2).
Saúde já está pronta. Cada prompt segue a mesma estrutura/campos/receita de Saúde,
mudando só o SETOR e a DIREÇÃO VISUAL. Qualidade EXCEPCIONAL em todos.

**PROMPT — JURÍDICO & PROFISSIONAL:**
```
SPRINT 1 — Template preenchível por IA (setor JURÍDICO & PROFISSIONAL).
Mesma estrutura, campos {{}}, JSON de receita e regras técnicas dos templates de
Saúde (leia PROJETO-IA.md). Módulo ISOLADO, pasta /templates-ia/juridico/.
Crie 2 MODELOS distintos. Modelo 1 primeiro, me mostre, depois o Modelo 2.
DIREÇÃO VISUAL: sóbrio, elegante, imponente. Autoridade, tradição, confiança.
Azul-marinho/preto + dourado. Serifada elegante nos títulos (ex: Playfair
Display). Sério e premium. Serve advogados, contadores, consultores, corretores,
arquitetos, engenheiros. Imagens Unsplash adequadas. Mobile-first, HTML/CSS/JS
puro. Inclua {{LOGO}} com fallback para {{NOME_EMPRESA}} em texto. Qualidade
EXCEPCIONAL. Liste o que criou.
```

**PROMPT — SERVIÇOS & NEGÓCIOS EM GERAL (CORINGA):**
```
SPRINT 1 — Template preenchível por IA (setor SERVIÇOS & NEGÓCIOS EM GERAL).
Mesma estrutura/campos/receita/regras dos templates de Saúde (leia PROJETO-IA.md).
Módulo ISOLADO, pasta /templates-ia/servicos/. Crie 2 MODELOS distintos. Modelo 1
primeiro, aprovar, depois o 2.
DIREÇÃO VISUAL: CORINGA — VERSÁTIL para qualquer negócio que não encaixa em outro
setor (prestadores, autônomos, assistência técnica, pet shop, oficina, profissões
incomuns). Moderno, confiável, neutro com acento vibrante. Layout flexível.
Imagens Unsplash genéricas de trabalho/serviço. Mobile-first, HTML/CSS/JS puro.
{{LOGO}} com fallback. Qualidade EXCEPCIONAL. Liste o que criou.
```

**PROMPT — BELEZA & ESTILO:**
```
SPRINT 1 — Template preenchível por IA (setor BELEZA & ESTILO).
Mesma estrutura/campos/receita/regras dos templates de Saúde (leia PROJETO-IA.md).
Módulo ISOLADO, pasta /templates-ia/beleza/. Crie 2 MODELOS distintos. Modelo 1
primeiro, aprovar, depois o 2.
DIREÇÃO VISUAL: estiloso, moderno, com personalidade forte. Pode ser escuro e
sofisticado. Serve barbearia, salão, manicure, tatuador, sobrancelha, estúdio.
Vibe trendy/urbana. Galeria de fotos em destaque. Paleta marcante (ex: escuro +
dourado/neon). Imagens Unsplash adequadas. Mobile-first, HTML/CSS/JS puro.
{{LOGO}} com fallback. Qualidade EXCEPCIONAL. Liste o que criou.
```

**PROMPT — ALIMENTAÇÃO:**
```
SPRINT 1 — Template preenchível por IA (setor ALIMENTAÇÃO).
Mesma estrutura/campos/receita/regras dos templates de Saúde (leia PROJETO-IA.md).
Módulo ISOLADO, pasta /templates-ia/alimentacao/. Crie 2 MODELOS distintos.
Modelo 1 primeiro, aprovar, depois o 2.
DIREÇÃO VISUAL: quente, apetitoso, acolhedor. Dá vontade de comer. Cores quentes
(vermelho, laranja, terrosos). FOTOS GRANDES de destaque (pratos, ambiente). Serve
restaurante, lanchonete, pizzaria, delivery, confeitaria, bar. Pode ter seção de
cardápio. Imagens Unsplash de comida/ambiente de alta qualidade. Mobile-first,
HTML/CSS/JS puro. {{LOGO}} com fallback. Qualidade EXCEPCIONAL. Liste o que criou.
```

**PROMPT — COMÉRCIO & LOJA:**
```
SPRINT 1 — Template preenchível por IA (setor COMÉRCIO & LOJA).
Mesma estrutura/campos/receita/regras dos templates de Saúde (leia PROJETO-IA.md).
Módulo ISOLADO, pasta /templates-ia/comercio/. Crie 2 MODELOS distintos. Modelo 1
primeiro, aprovar, depois o 2.
DIREÇÃO VISUAL: vitrine, produtos em destaque, moderno e confiável. Serve loja,
boutique, revenda, catálogo, comércio local. Layout que valorize produtos (grid de
produtos/destaques). Limpo e comercial, acento de cor atrativo. Imagens Unsplash de
produtos/loja. Mobile-first, HTML/CSS/JS puro. {{LOGO}} com fallback. Qualidade
EXCEPCIONAL. Liste o que criou.
```

**Checklist de aprovação de cada template:**
- [ ] Ficou FODA (não genérico)?
- [ ] Tem a cara do setor?
- [ ] Mobile impecável?
- [ ] Campos {{}} bem colocados?
- [ ] JSON de receita faz sentido?

---

## SPRINT 2 — Chat + IA (conversa, GERAÇÃO DE TEXTOS e extração)

**Objetivo:** interface de chat (tipo ChatGPT) + Llama via Groq. A IA conversa
com o lead, descobre a PROFISSÃO/negócio, GERA os textos do site adequados àquela
profissão (o lead não escreve os textos), identifica o SETOR e devolve tudo
ESTRUTURADO. Testar ISOLADO antes de ligar na geração.

**Ponto central — a IA GERA os textos específicos por profissão:**
- O lead diz apenas O QUE FAZ (ex: "sou dentista", "tenho uma barbearia", "sou
  advogado", "sou macumbeiro", "limpo andaimes") — QUALQUER profissão.
- A IA GERA os textos do site contextualizados àquela profissão: slogan, sobre,
  serviços, diferenciais, CTAs, depoimentos genéricos. Profissional e específico
  do ramo — mesmo o produto sendo amplo, cada cliente sente que é feito pra ele.
- A IA IDENTIFICA o SETOR (entre os 6) para escolher o template. Profissões que
  não encaixam → setor CORINGA (Serviços & Negócios em Geral).
- Motivo: o cliente não sabe/não quer escrever textos. A IA escreve por ele.
- Exige um bom system prompt instruindo a IA a gerar textos adequados e
  específicos para qualquer ramo.

**Entrega:** chat funcional; ao final o sistema tem um objeto estruturado com:
setor identificado + campos do template preenchidos com textos gerados pela IA +
dados do lead (nome, whatsapp, email — coletados no FIM da conversa).

**PROMPT (base — ajustar conforme a Sprint 1):**
```
SPRINT 2 — Chat com IA (Llama via Groq): conversa, GERA textos por profissão,
identifica setor, estrutura os dados.

Leia PROJETO-IA.md e as receitas (schema JSON) dos templates da Sprint 1.
Módulo ISOLADO, não mexer no existente.

Crie uma interface de CHAT (estilo ChatGPT, limpa, premium, mobile-first) onde:
1. A IA (Llama via Groq) conversa de forma natural e acolhedora.
2. Descobre a PROFISSÃO/negócio do lead (ele só diz o que faz).
3. GERA os textos do site adequados à profissão: slogan, sobre, serviços,
   diferenciais, CTAs, depoimentos. O lead NÃO escreve — a IA escreve por ele, de
   forma profissional e específica ao ramo. Funciona para QUALQUER profissão,
   inclusive incomuns. Profissões que não encaixam num setor → setor coringa
   (Serviços & Negócios em Geral).
4. IDENTIFICA o SETOR (entre os 6) para selecionar o template.
5. No FIM (não no início), coleta NOME, WHATSAPP e EMAIL → salva no painel.
6. Ao final, objeto ESTRUTURADO (JSON): setor + campos preenchidos + dados do lead.

TESTAR ISOLADO: ao terminar, exiba/logue o JSON estruturado para eu validar. Ainda
NÃO gerar o site. Groq (API), modelo Llama, chave em variável de ambiente. Trate
erros (mensagem amigável, não quebra). Liste o que criou.
```

---

## SPRINT 3 — Geração + preview no mockup

**Objetivo:** pegar o objeto de dados (da Sprint 2) + o template (da Sprint 1),
substituir os {{}} pelos dados, e gerar o HTML final. Mostrar o resultado num
MOCKUP DE CELULAR rolável (a prévia que o lead vê antes de pagar). Incluir os 2
modelos para o lead escolher, e a edição CONVERSACIONAL (via IA).

**Entrega:** dados + template → site preenchido → exibido em mockup de celular,
com escolha entre 2 modelos e edição conversacional.

**Fluxo de escolha e edição (IMPORTANTE):**
- A IA gera os 2 MODELOS → exibidos em MODAL com MOCKUP de celular (rolável) para
  o lead comparar/escolher.
- Após escolher um modelo, DOIS caminhos (dois botões):
  1. APROVAR DIRETO → segue para o pagamento (gostou, está bom assim).
  2. FAZER ALTERAÇÕES → entra na edição.
- A edição é CONVERSACIONAL (a IA faz por ele, NÃO o lead editando na mão):
  a IA PERGUNTA o que ele quer mudar, ele RESPONDE, a IA ALTERA. Mantém a
  experiência "só converso e a IA faz".
- ESCOPO da edição (Etapa 2): inclui TEXTOS e IMAGENS.
  * TEXTOS: a IA reescreve o que o lead pedir.
  * IMAGENS: o lead ANEXA uma imagem nova (upload) e a IA troca no template.
- FASEAMENTO da construção (só ordem, não exclusão): construir primeiro a edição
  de TEXTOS (mais simples). A edição de IMAGENS (upload + hospedar + substituir)
  é mais complexa e entra logo depois. Ambas fazem parte da Etapa 2; só a ORDEM
  de construção é texto primeiro, imagem em seguida.

**PROMPT (base):**
```
SPRINT 3 — Geração do site e preview em mockup de celular.

Leia PROJETO-IA.md. Módulo ISOLADO, não mexer no existente.

Usando os dados estruturados coletados no chat (Sprint 2) e os templates da
Sprint 1:
1. Selecione os 2 MODELOS do setor identificado.
2. Substitua os campos {{}} de cada modelo pelos dados coletados → gere o HTML
   final preenchido de cada um. (Se houver logo, colocar a URL E ativar a classe
   has-logo; se não, deixa o nome em texto.)
3. Exiba os 2 modelos em MODAL com MOCKUP DE CELULAR rolável (o lead rola e vê o
   site completo dentro do "celular", sem abrir nova aba) para ele ESCOLHER.
4. Após escolher, apresente DOIS botões/caminhos:
   a) APROVAR DIRETO → segue para pagamento.
   b) FAZER ALTERAÇÕES → edição CONVERSACIONAL: a IA pergunta o que mudar, o lead
      responde, a IA altera o texto no site. (Nesta primeira versão, só edição de
      TEXTOS. Edição de imagens fica para etapa posterior.)
5. Mostrar pendência destacada: "Publicar site e ver link próprio".

Ainda NÃO publicar nem cobrar (próxima sprint). Só gerar + preview + escolha +
edição de textos. Mobile-first. Liste o que criou.
```

---

## SPRINT 4 — Publicação (pagamento → Vercel → conta automática)

**Objetivo:** o lead clica em publicar → paga R$29 → o site é publicado na infra
da TopSite (Vercel) → recebe o link (tela + email) → conta criada AUTOMATICAMENTE
+ login enviado por email → cai no fluxo/tela do cliente já existente.

ATENÇÃO: envolve PAGAMENTO e criação de CONTA/AUTENTICAÇÃO — áreas sensíveis.
PEDIR UM PLANO ao Claude Code ANTES de implementar, revisar, e só então executar.

**Entrega:** fluxo pagar → publicar → link (tela+email) → conta automática →
tela do cliente.

**Pontos-chave para o prompt/plano:**
- Reutilizar a estrutura de pagamento existente (Asaas, CPF no pagamento).
- Valor: R$29 (a definir taxa de publicação). Mensalidade R$29/mês (testar 49).
- Ao confirmar pagamento (webhook): publicar site na Vercel + gerar link + enviar
  link por EMAIL + criar conta AUTOMATICAMENTE + enviar login por email.
- Criação de conta 100% automática (lead pode pagar de madrugada — não pode
  depender de ação manual).
- Conectar ao fluxo de cliente JÁ EXISTENTE (tela do cliente, upsells,
  performance, visitantes). Reaproveitar, não recriar.
- Transação segura: criar conta/cliente antes de confirmar tudo, sem registros
  órfãos. Lembrar do histórico de bug de server-side exception em pagamento —
  usar try/catch robusto.

---

## SPRINT 5 — Migração + domínio + limpeza automática

**Objetivo:** as automações de bastidor e a segunda parte (domínio).

**Entrega:**
1. **Migração Vercel → GitHub:** após o pagamento, o site fica na Vercel; nós
   migramos manualmente para o GitHub Pages (subir código + trocar link). Painel
   admin para gerenciar isso. O link temporário da Vercel expira em 48h após a
   migração.
2. **Limpeza automática:**
   - Prévias que NÃO viraram pagantes → apagadas automaticamente após X horas
     (não encher o servidor).
   - Link temporário Vercel dos pagantes → expira 48h após migração.
3. **Domínio próprio (opcional):** avisos convidando o cliente a ter domínio
   .com.br (vender por profissionalismo/credibilidade, não "sem domínio não
   aparece no Google"). Preço R$80/ano. Ao comprar, prazo de 24h; nós
   registramos MANUALMENTE (conta Registro.br) e apontamos para o site no GitHub.
   Futuro: automatizar via API de REVENDEDOR (ex: ResellerClub), não Registro.br
   direto. Só quando o volume justificar.

---

## Lembretes de execução

- Uma sprint por vez. Testar antes de avançar.
- Sprint 4 (pagamento/conta) e qualquer coisa sensível: PEDIR PLANO antes.
- Guardar os prints/aprovações de cada template (Sprint 1).
- Manter PROJETO-IA.md e este SPRINTS.md atualizados conforme decisões mudarem.
- Não dispersar: focar nesse projeto até concluir (evitar pular para outra ideia).