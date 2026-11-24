import type { BadgeVariant } from '@/components/ui/badge'

// Rótulos do WhatsApp com IA (usados no admin, no servidor e no navegador)
export const WA_CATEGORY = {
  lead: { label: 'Lead', variant: 'info' },
  cliente: { label: 'Cliente', variant: 'success' },
  revisar: { label: 'A revisar', variant: 'warning' },
  nao_classificado: { label: 'Sem conversa', variant: 'neutral' },
  pessoal: { label: 'Pessoal', variant: 'purple' },
} as const satisfies Record<string, { label: string; variant: BadgeVariant }>

export type WaCategoryKey = keyof typeof WA_CATEGORY

export const WA_MESSAGE_STATUS: Record<string, { label: string; variant: BadgeVariant }> = {
  recebida: { label: 'Recebida', variant: 'neutral' },
  historico: { label: 'Histórico', variant: 'neutral' },
  simulada: { label: 'Simulada (não enviada)', variant: 'warning' },
  enviada: { label: 'Enviada', variant: 'info' },
  entregue: { label: 'Entregue', variant: 'info' },
  lida: { label: 'Lida', variant: 'success' },
  falhou: { label: 'Falhou', variant: 'error' },
}

export const WA_AUTHOR: Record<string, string> = {
  contato: 'Contato',
  voce: 'Você (celular)',
  ia: 'IA',
  sistema: 'Sistema',
}

export const WA_KIND: Record<string, string> = {
  resposta: 'resposta',
  follow_up: 'follow-up',
  oferta: 'oferta',
  descadastro: 'descadastro',
}

export const WA_CAMPAIGN_STATUS: Record<string, { label: string; variant: BadgeVariant }> = {
  rascunho: { label: 'Rascunho', variant: 'neutral' },
  ativa: { label: 'Ativa', variant: 'success' },
  pausada: { label: 'Pausada', variant: 'warning' },
  concluida: { label: 'Concluída', variant: 'info' },
}

export const WA_SEND_STATUS: Record<string, { label: string; variant: BadgeVariant }> = {
  enviado: { label: 'Enviado', variant: 'success' },
  simulado: { label: 'Simulado', variant: 'warning' },
  pulado: { label: 'Pulado', variant: 'neutral' },
  falhou: { label: 'Falhou', variant: 'error' },
}

export function fmtDateTimeSP(date: Date | null | undefined) {
  if (!date) return '—'
  return date.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })
}
