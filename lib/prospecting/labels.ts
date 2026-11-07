import type { BadgeVariant } from '@/components/ui/badge'

// Rótulos e cores de status da prospecção (usados no admin, no servidor e no navegador)
export const PROSPECT_STATUS = {
  rascunho: { label: 'Rascunho', variant: 'neutral' },
  ativo: { label: 'Ativo', variant: 'info' },
  pausado: { label: 'Pausado', variant: 'warning' },
  interessado: { label: 'Interessado', variant: 'success' },
  respondeu: { label: 'Respondeu', variant: 'purple' },
  descadastrado: { label: 'Descadastrado', variant: 'error' },
  invalido: { label: 'E-mail inválido', variant: 'error' },
  finalizado: { label: 'Finalizado', variant: 'neutral' },
} as const satisfies Record<string, { label: string; variant: BadgeVariant }>

export type ProspectStatusKey = keyof typeof PROSPECT_STATUS

export const EMAIL_STATUS = {
  rascunho: { label: 'Rascunho', variant: 'neutral' },
  agendado: { label: 'Agendado', variant: 'info' },
  enviando: { label: 'Enviando', variant: 'warning' },
  enviado: { label: 'Enviado', variant: 'success' },
  cancelado: { label: 'Cancelado', variant: 'neutral' },
  falhou: { label: 'Falhou', variant: 'error' },
} as const satisfies Record<string, { label: string; variant: BadgeVariant }>

export const EVENT_LABEL: Record<string, string> = {
  cadastrado: 'Cadastrado',
  ativado: 'Sequência ativada',
  pausado: 'Pausado',
  retomado: 'Retomado',
  parado: 'Sequência parada',
  editado: 'E-mail editado',
  enviado: 'Enviado',
  entregue: 'Entregue',
  aberto: 'Aberto',
  clique_link: 'Clique em link',
  clique_whatsapp: 'Clicou no WhatsApp',
  clique_whatsapp_teste: 'Clique no WhatsApp (teste)',
  bounce: 'Bounce',
  spam: 'Marcou como spam',
  falha_envio: 'Falha no envio (vai tentar de novo)',
  falha_definitiva: 'Falha no envio (desistiu)',
  teste_enviado: 'Teste enviado',
}

export function fmtDateTimeSP(date: Date | string | null | undefined) {
  if (!date) return '—'
  return new Date(date).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}
