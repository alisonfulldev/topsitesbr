import { z } from 'zod'
import { prisma } from '@/lib/prisma'

// Configurações da prospecção — guardadas como JSON em system_settings (chave abaixo)
const SETTINGS_KEY = 'prospecting_config'

const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use o formato HH:MM')

export const prospectingConfigSchema = z.object({
  // Trava principal: enquanto false, nada é enviado a prospects (só os testes para testEmail)
  liveMode: z.boolean(),
  senderName: z.string().trim().min(1, 'Informe o seu nome'),
  company: z.string().trim().min(1, 'Informe a empresa'),
  contactLine: z.string().trim().min(1, 'Informe um contato para o rodapé'),
  whatsappNumber: z.string().trim().regex(/^\d{12,13}$/, 'Só números, com DDI e DDD (ex: 5518996742364)'),
  whatsappText: z.string().trim().min(1, 'Informe a mensagem do WhatsApp'),
  from: z.string().trim().min(3, 'Informe o remetente'),
  replyTo: z.string().trim().email('Reply-to inválido').or(z.literal('')),
  testEmail: z.string().trim().email('E-mail de teste inválido'),
  dailyLimit: z.number().int().min(1).max(500),
  windowStart: time,
  windowEnd: time,
  cadenceDays: z.array(z.number().int().min(0).max(60)).length(5),
  allowDirectActivate: z.boolean(),
})

export type ProspectingConfig = z.infer<typeof prospectingConfigSchema>

export const DEFAULT_PROSPECTING_CONFIG: ProspectingConfig = {
  liveMode: false,
  senderName: 'Alison',
  company: 'TopSite',
  contactLine: 'WhatsApp (18) 99674-2364 · contato@topsitebr.com.br',
  whatsappNumber: '5518996742364',
  whatsappText: 'Olá! Recebi seu e-mail sobre o site da {{negocio}} e quero saber mais.',
  from: 'Alison da TopSite <contato@topsitebr.com.br>',
  replyTo: 'contato@topsitebr.com.br',
  testEmail: 'alisonfulldev@gmail.com',
  dailyLimit: 30,
  windowStart: '09:00',
  windowEnd: '17:00',
  cadenceDays: [0, 2, 4, 6, 8],
  allowDirectActivate: false,
}

export async function getProspectingConfig(): Promise<ProspectingConfig> {
  const row = await prisma.systemSetting.findUnique({ where: { key: SETTINGS_KEY } })
  if (!row) return DEFAULT_PROSPECTING_CONFIG
  try {
    // Campos novos ganham o valor padrão quando o JSON salvo é de uma versão anterior
    const parsed = prospectingConfigSchema.safeParse({ ...DEFAULT_PROSPECTING_CONFIG, ...JSON.parse(row.value) })
    return parsed.success ? parsed.data : DEFAULT_PROSPECTING_CONFIG
  } catch {
    return DEFAULT_PROSPECTING_CONFIG
  }
}

export async function saveProspectingConfig(config: ProspectingConfig) {
  const value = JSON.stringify(config)
  await prisma.systemSetting.upsert({ where: { key: SETTINGS_KEY }, update: { value }, create: { key: SETTINGS_KEY, value } })
}
