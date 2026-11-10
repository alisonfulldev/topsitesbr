import { z } from 'zod'
import { prisma } from '@/lib/prisma'

// ─── Proposta online: planos, extras, cronograma e textos da sequência ────────
// Tudo editável no admin (salvo em system_settings). Os valores de cada proposta
// também podem ser ajustados individualmente no cadastro do prospect.

export const PLAN_PRESETS = [
  { key: 'sem_painel', name: 'Sem painel', setup: 197, monthly: 49 },
  { key: 'com_painel', name: 'Com painel', setup: 470, monthly: 70 },
] as const

export const EXTRA_PRESETS = [{ key: 'botao_atendimento', name: 'Botão de atendimento', price: 300 }] as const

export type ProposalExtra = { key: string; name: string; price: number }

export const STATUS_LABEL: Record<string, string> = {
  prospect: 'Cadastrado',
  previa_enviada: 'Prévia enviada',
  ajuste_solicitado: 'Ajuste solicitado',
  aprovada: 'Aprovada',
  contrato_assinado: 'Contrato assinado',
  ativo: 'Ativo (pago)',
  expirada: 'Expirada',
  cancelada: 'Cancelada',
}

const templateSchema = z.object({
  subject: z.string().trim().min(1),
  body: z.string().trim().min(1),
})

const configSchema = z.object({
  scheduleDays: z.array(z.number().int().min(0).max(60)).length(5),
  windowStart: z.string().regex(/^\d{2}:\d{2}$/),
  windowEnd: z.string().regex(/^\d{2}:\d{2}$/),
  from: z.string().trim().min(3),
  replyTo: z.string().trim().email().or(z.literal('')),
  whatsappNumber: z.string().trim().regex(/^\d{12,13}$/),
  templates: z.array(templateSchema).length(5),
})

export type OnlineProposalConfig = z.infer<typeof configSchema>

// Variáveis: {{nome}} {{empresa}} {{plano}} {{valor_setup}} {{valor_mensal}} {{link}} {{expira_em}} {{whatsapp}}
export const DEFAULT_CONFIG: OnlineProposalConfig = {
  scheduleDays: [0, 2, 4, 7, 10],
  windowStart: '08:00',
  windowEnd: '19:00',
  from: 'Alison da TopSite <contato@topsitebr.com.br>',
  replyTo: 'contato@topsitebr.com.br',
  whatsappNumber: '5518996742364',
  templates: [
    {
      subject: '{{nome}}, a prévia do site da {{empresa}} está pronta',
      body: `Olá, {{nome}}!

A prévia do site da {{empresa}} está pronta. Preparei tudo pensando no seu negócio, e você já pode ver como ele vai ficar.

Pelo link você vê o site, aprova ou pede algum ajuste, sem compromisso.

Plano {{plano}}: {{valor_setup}} de criação e {{valor_mensal}}/mês.`,
    },
    {
      subject: 'Por que ter um site profissional, {{nome}}?',
      body: `Olá, {{nome}}!

Um site profissional faz a {{empresa}} aparecer quando alguém procura pelos seus serviços no Google, passa confiança para quem ainda não conhece você e transforma visitas em contatos, inclusive fora do horário comercial.

A prévia que preparei já está pronta para você ver.`,
    },
    {
      subject: 'Como funciona a aprovação do seu site',
      body: `Olá, {{nome}}!

É simples: você abre a prévia, aprova ou pede um ajuste. Depois de aprovar, assina o contrato pela própria página e faz o pagamento.

No plano {{plano}} estão inclusos a criação do site, a publicação, a hospedagem com SSL e o suporte, por {{valor_setup}} de criação e {{valor_mensal}}/mês.`,
    },
    {
      subject: 'Ficou alguma dúvida, {{nome}}?',
      body: `Olá, {{nome}}!

Algumas dúvidas comuns: o site funciona no celular, você pode pedir ajustes antes de aprovar e o domínio próprio é opcional.

Se quiser conversar, é só me chamar no WhatsApp: {{whatsapp}}`,
    },
    {
      subject: 'Último aviso: sua prévia expira em {{expira_em}}',
      body: `Olá, {{nome}}!

A prévia do site da {{empresa}} fica disponível até {{expira_em}}. Depois dessa data o link expira.

Se quiser seguir com o site, é só aprovar pela página.`,
    },
  ],
}

const SETTINGS_KEY = 'online_proposal_config'

export async function getOnlineProposalConfig(): Promise<OnlineProposalConfig> {
  const row = await prisma.systemSetting.findUnique({ where: { key: SETTINGS_KEY } })
  if (!row) return DEFAULT_CONFIG
  try {
    const parsed = configSchema.safeParse({ ...DEFAULT_CONFIG, ...JSON.parse(row.value) })
    return parsed.success ? parsed.data : DEFAULT_CONFIG
  } catch {
    return DEFAULT_CONFIG
  }
}

export async function saveOnlineProposalConfig(input: unknown): Promise<{ error?: string }> {
  const parsed = configSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Configuração inválida.' }
  const value = JSON.stringify(parsed.data)
  await prisma.systemSetting.upsert({ where: { key: SETTINGS_KEY }, update: { value }, create: { key: SETTINGS_KEY, value } })
  return {}
}
