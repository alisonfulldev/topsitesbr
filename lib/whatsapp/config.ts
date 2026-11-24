import { z } from 'zod'
import { prisma } from '@/lib/prisma'

// Configurações da IA do WhatsApp — guardadas como JSON em system_settings
const SETTINGS_KEY = 'whatsapp_ai_config'

const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use o formato HH:MM')
const templateName = z.string().trim().regex(/^[a-z0-9_]*$/, 'Nome do modelo: só letras minúsculas, números e _')

export const waConfigSchema = z.object({
  // Trava principal: desligado = a IA decide e escreve, mas nada sai (fica como "simulada" no painel).
  // O número de teste recebe de verdade mesmo com a trava desligada.
  liveMode: z.boolean(),
  testNumber: z.string().trim().regex(/^(\d{12,13})?$/, 'Número de teste: só números, com DDI e DDD'),
  assistantName: z.string().trim().min(1, 'Informe o nome que a IA usa'),
  businessContext: z.string().trim().min(20, 'Descreva o negócio (produtos, regras) para a IA'),
  // A IA nunca fala de valores: quando perguntam preço/orçamento, avisa que o responsável vai passar e chama você
  priceToHuman: z.boolean(),
  autoReply: z.boolean(),
  // Responder mensagens recebidas fora da janela de horário (follow-ups e ofertas sempre respeitam a janela)
  replyAnyTime: z.boolean(),
  followUpEnabled: z.boolean(),
  // Horas de conversa parada antes de cada follow-up (ex: 20, 72, 168 = três follow-ups).
  // Até 23h a janela de 24h ainda pode estar aberta (texto livre); depois disso só com modelo aprovado.
  followUpHours: z.array(z.number().int().min(1).max(1440)).min(1).max(5),
  // Conversas paradas há mais tempo que isso não recebem follow-up (ficam para as campanhas)
  followUpMaxAgeDays: z.number().int().min(1).max(180),
  // Modelo aprovado na Meta para follow-up fora da janela de 24h (vazio = só faz follow-up com a janela aberta)
  followUpTemplateName: templateName,
  followUpTemplateLanguage: z.string().trim().min(2),
  followUpTemplateBody: z.string().trim(),
  // Depois que você responde pelo celular, a IA fica quieta com aquele contato por estas horas
  humanTakeoverHours: z.number().int().min(1).max(720),
  // Limite diário de mensagens proativas (follow-ups + ofertas). Respostas não contam.
  dailyLimit: z.number().int().min(1).max(1000),
  offerMinIntervalDays: z.number().int().min(1).max(180),
  windowStart: time,
  windowEnd: time,
})

export type WaConfig = z.infer<typeof waConfigSchema>

export const DEFAULT_WA_CONFIG: WaConfig = {
  liveMode: false,
  testNumber: '',
  assistantName: 'Alison',
  businessContext: [
    'Empresa: TopSite — sites profissionais para pequenos negócios, feitos para aparecer no Google e nas IAs (ChatGPT, Gemini etc.) quando o cliente pesquisa na região.',
    '',
    'O que oferecemos:',
    '- Criação do site: feito com IA a partir das informações do negócio e aprovado pelo cliente antes de ir ao ar.',
    '- Plano mensal de manutenção e hospedagem: site no ar, SSL (cadeado), monitoramento e correções.',
    '- Extras: domínio próprio (.com.br), e-mail profissional, blog, loja virtual.',
    '',
    'Como funciona: a pessoa passa as informações do negócio, recebe o site para aprovar, pede ajustes e o site vai ao ar.',
    '',
    'Valores, formas de pagamento e condições: quem informa é o responsável.',
  ].join('\n'),
  priceToHuman: true,
  autoReply: true,
  replyAnyTime: true,
  followUpEnabled: true,
  followUpHours: [20, 72, 168],
  followUpMaxAgeDays: 30,
  followUpTemplateName: '',
  followUpTemplateLanguage: 'pt_BR',
  followUpTemplateBody: '',
  humanTakeoverHours: 12,
  dailyLimit: 40,
  offerMinIntervalDays: 15,
  windowStart: '09:00',
  windowEnd: '18:00',
}

export async function getWaConfig(): Promise<WaConfig> {
  const row = await prisma.systemSetting.findUnique({ where: { key: SETTINGS_KEY } })
  if (!row) return DEFAULT_WA_CONFIG
  try {
    // Campos novos ganham o valor padrão quando o JSON salvo é de uma versão anterior
    const parsed = waConfigSchema.safeParse({ ...DEFAULT_WA_CONFIG, ...JSON.parse(row.value) })
    return parsed.success ? parsed.data : DEFAULT_WA_CONFIG
  } catch {
    return DEFAULT_WA_CONFIG
  }
}

export async function saveWaConfig(config: WaConfig) {
  const value = JSON.stringify(config)
  await prisma.systemSetting.upsert({ where: { key: SETTINGS_KEY }, update: { value }, create: { key: SETTINGS_KEY, value } })
}

// Quantas variáveis {{n}} um texto de modelo tem (precisam ser 1..n, sem buracos)
export function templateVarCount(body: string): number {
  const nums = Array.from(body.matchAll(/\{\{(\d+)\}\}/g), (m) => Number(m[1]))
  return nums.length ? Math.max(...nums) : 0
}

export function renderTemplate(body: string, params: string[]): string {
  return body.replace(/\{\{(\d+)\}\}/g, (_, n) => params[Number(n) - 1] ?? '')
}
