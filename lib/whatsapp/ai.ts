// Decisão da IA para UM contato: classifica, resume e escolhe a ação (responder, follow-up, oferta).
// A IA só escreve e sugere — quem pode receber e quando é decidido em rules.ts/engine.ts.
//
// Variáveis: ANTHROPIC_API_KEY (obrigatória), WHATSAPP_AI_MODEL (opcional, padrão claude-haiku-5-5 — o mais barato,
// ~US$ 0,0006 por decisão; para mais qualidade use claude-sonnet-5-5 ou claude-opus-5-5)

import Anthropic from '@anthropic-ai/sdk'
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod'
import { z } from 'zod'
import type { WaConfig } from './config'

const MODEL = process.env.WHATSAPP_AI_MODEL || 'claude-haiku-5-5'

// Fallback no servidor quando a IA recusa um pedido: só existe nesses modelos (o Haiku não tem;
// lá uma recusa vira AiRefusal e o contato é marcado como processado)
const fallback = /^claude-(opus-5|sonnet-5-5|fable-5)/.test(MODEL)
  ? { betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' as const }
  : {}

let client: Anthropic | null = null
function anthropic() {
  client ??= new Anthropic()
  return client
}

export function aiConfigured() {
  return !!process.env.ANTHROPIC_API_KEY
}

export const DecisionSchema = z.object({
  categoria: z.enum(['cliente', 'lead', 'pessoal', 'revisar']),
  resumo: z.string(),
  interesse: z.string(),
  acao: z.enum(['enviar', 'nada', 'chamar_humano', 'descadastrar']),
  mensagem: z.string(),
  parametros: z.array(z.string()),
  motivo: z.string(),
})

export type Decision = z.infer<typeof DecisionSchema>

export type Task =
  | { type: 'classificar' }
  | { type: 'responder' }
  | { type: 'follow_up'; step: number; total: number; idleDays: number; template: TemplateInfo | null }
  | { type: 'oferta'; campaign: string; offer: string; template: TemplateInfo | null }

export interface TemplateInfo {
  name: string
  body: string
  vars: number
}

export interface TranscriptLine {
  at: Date
  author: string
  body: string
  status: string
}

export interface ContactInfo {
  name: string | null
  waId: string
  category: string
  categoryByAdmin: boolean
  summary: string | null
  clientInfo: string | null
}

function systemPrompt(config: WaConfig) {
  return `Você é ${config.assistantName} e atende o WhatsApp da empresa descrita abaixo. Os contatos são pessoas que já estão no WhatsApp da empresa: clientes, interessados (leads) e também contatos pessoais do dono.

<negocio>
${config.businessContext}
</negocio>

Em cada pedido você lê a conversa com UM contato e devolve uma decisão.

Categoria:
- cliente: já comprou ou contratou algo da empresa.
- lead: perguntou sobre os produtos/serviços ou mostrou interesse, mas não comprou (ou não fica claro que comprou).
- pessoal: família, amigos, conhecidos, fornecedores, prestadores de serviço para o dono, ou qualquer conversa que não seja sobre os serviços da empresa. Decida pelo assunto da conversa, não pelo tom.
- revisar: não dá para saber (conversa curta demais, só mídia, só um "oi" sem contexto).

Ação:
- enviar: mandar a mensagem (campo mensagem) ou, quando o pedido disser que é modelo, os valores das variáveis (campo parametros).
- nada: não mandar nada. Use quando a conversa já terminou bem ("ok, obrigado"), quando não há nada útil a dizer, quando o contato é pessoal ou a revisar, ou quando insistir seria chato.
- chamar_humano: o dono precisa assumir. Use para reclamação, problema com pagamento ou com um site já entregue, negociação de preço ou condição fora do contexto do negócio, pedido para falar com uma pessoa, áudio que parece importante, ou qualquer pergunta cuja resposta não está no contexto do negócio. Nesse caso a mensagem pode avisar que o responsável vai responder em breve.
- descadastrar: o contato pediu, com qualquer palavra, para não receber mais mensagens.

${config.priceToHuman ? `VALORES — regra mais importante:
- Nunca fale de preço, valor, orçamento, desconto, parcelamento, forma ou condição de pagamento. Nem se estiver no contexto, na oferta ou se o dono já tiver falado de valores antes na conversa. Não escreva números em reais.
- Quando o contato perguntar algo sobre isso, use acao = chamar_humano e escreva uma mensagem curta e simpática avisando que o responsável vai passar os valores (ex: "Vou pedir pro responsável te passar os valores certinhos, ele já te chama por aqui!"). Pode aproveitar para tirar uma dúvida que não seja sobre valor.

` : ''}Histórico e datas:
- Cada mensagem tem data e hora. Compare com "Agora". Mensagens de semanas ou meses atrás são contexto, não pedem resposta imediata.
- "Dono (pelo celular)" são mensagens que o dono mandou pessoalmente. Se ele já respondeu, já passou orçamento, já combinou algo ou estava negociando, NÃO repita, NÃO contradiga e NÃO reabra o que ele resolveu. Continue a partir do ponto em que ele parou, ou escolha nada se for melhor deixar com ele.
- Se o cliente já fechou, já pagou ou já está sendo atendido pelo dono, não ofereça de novo o que ele já tem.

Como escrever:
- Português do Brasil, jeito de WhatsApp: curto, simpático e direto, como uma pessoa real. De 1 a 4 frases, no máximo 1 emoji.
- Nunca invente preço, prazo, desconto, link ou promessa que não esteja no contexto do negócio.
- Não diga que é uma IA, a menos que perguntem diretamente; se perguntarem, diga a verdade: você é a assistente virtual da empresa e o responsável acompanha as conversas.
- Use o primeiro nome do contato quando souber.
- Responda o que a pessoa perguntou antes de puxar venda.
- Follow-up: retome o assunto da conversa com naturalidade, sem cobrar e sem pressão. Cada follow-up traz algo novo (uma dúvida comum, um benefício, uma pergunta simples) e nunca repete o anterior.
- Oferta: só ofereça se fizer sentido para esse contato pelo que a conversa mostra. Se não fizer, escolha nada e explique no motivo.
- Variáveis de modelo: cada valor em uma linha só, curto, sem quebra de linha, encaixando no texto do modelo.

Campos de texto: resumo (1 ou 2 frases sobre quem é o contato e em que pé está), interesse (produto ou serviço de interesse, ou vazio), motivo (por que você escolheu essa ação; o dono lê isso no painel). Campos que não se aplicam ficam vazios (mensagem "" ou parametros []).`
}

const AUTHOR_LABEL: Record<string, string> = { contato: 'Contato', voce: 'Dono (pelo celular)', ia: 'Assistente', sistema: 'Sistema' }

function fmt(date: Date) {
  return date.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })
}

function templateBlock(t: TemplateInfo) {
  return `A janela de 24h do WhatsApp está FECHADA: só dá para enviar o modelo aprovado abaixo. Preencha as ${t.vars} variáveis em parametros, na ordem ({{1}}, {{2}}...). Deixe mensagem vazia.
<modelo>
${t.body}
</modelo>`
}

function taskText(task: Task) {
  switch (task.type) {
    case 'classificar':
      return 'Apenas classifique e resuma este contato. Use acao = nada.'
    case 'responder':
      return 'O contato mandou mensagem e está esperando resposta. A janela de 24h está aberta: escreva a resposta em mensagem. Se o contato for pessoal ou a revisar, use acao = nada.'
    case 'follow_up':
      return `O contato parou de responder há ${task.idleDays} dia(s). Este seria o follow-up ${task.step} de ${task.total}. Decida se vale mandar e escreva.\n` +
        (task.template ? templateBlock(task.template) : 'A janela de 24h está aberta: escreva o follow-up em mensagem.')
    case 'oferta':
      return `Campanha "${task.campaign}". Oferta:\n<oferta>\n${task.offer}\n</oferta>\nDecida se essa oferta faz sentido para este contato e escreva.\n` +
        (task.template ? templateBlock(task.template) : 'A janela de 24h está aberta: escreva a oferta em mensagem.')
  }
}

function userPrompt(contact: ContactInfo, transcript: TranscriptLine[], task: Task, now: Date) {
  const lines = transcript.map((l) => {
    const body = l.body.length > 1200 ? l.body.slice(0, 1200) + '…' : l.body
    const note = l.status === 'simulada' ? ' (não enviada)' : l.status === 'falhou' ? ' (falhou)' : ''
    return `[${fmt(l.at)}] ${AUTHOR_LABEL[l.author] ?? l.author}${note}: ${body}`
  })
  return `Agora: ${fmt(now)}

<contato>
Nome no WhatsApp: ${contact.name ?? '(sem nome)'}
Telefone: ${contact.waId}
Cadastro no sistema: ${contact.clientInfo ?? 'não encontrado (não é cliente cadastrado)'}
Categoria atual: ${contact.category}${contact.categoryByAdmin ? ' (definida pelo dono; mantenha)' : ''}
${contact.summary ? 'Resumo anterior: ' + contact.summary : ''}
</contato>

<conversa>
${lines.length ? lines.join('\n') : '(nenhuma mensagem)'}
</conversa>

<tarefa>
${taskText(task)}
</tarefa>`
}

export class AiRefusal extends Error {}

export async function decide(config: WaConfig, contact: ContactInfo, transcript: TranscriptLine[], task: Task, now = new Date()): Promise<Decision> {
  const response = await anthropic().beta.messages.parse({
    model: MODEL,
    max_tokens: 8000,
    ...fallback,
    output_config: { effort: task.type === 'classificar' ? 'low' : 'medium', format: betaZodOutputFormat(DecisionSchema) },
    system: [{ type: 'text', text: systemPrompt(config), cache_control: { type: 'ephemeral' } }],
    messages: [{ role: 'user', content: userPrompt(contact, transcript, task, now) }],
  })
  if (response.stop_reason === 'refusal') throw new AiRefusal('A IA recusou este pedido')
  if (!response.parsed_output) throw new Error(`Resposta da IA sem JSON válido (stop_reason: ${response.stop_reason})`)
  return response.parsed_output
}
