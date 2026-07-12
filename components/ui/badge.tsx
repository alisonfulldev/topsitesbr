import { cn } from '@/lib/utils'

export type BadgeVariant =
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'neutral'
  | 'brand'
  | 'purple'
  | 'orange'
  | 'pink'

const variantClasses: Record<BadgeVariant, string> = {
  success: 'bg-green-100 text-green-700',
  warning: 'bg-yellow-100 text-yellow-700',
  error: 'bg-red-100 text-red-700',
  info: 'bg-blue-100 text-blue-700',
  neutral: 'bg-gray-100 text-gray-600',
  brand: 'bg-brand-100 text-brand-text',
  purple: 'bg-purple-100 text-purple-700',
  orange: 'bg-orange-100 text-orange-700',
  pink: 'bg-pink-100 text-pink-700',
}

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  size?: 'sm' | 'md'
  dot?: boolean
}

export function Badge({ variant = 'neutral', size = 'sm', dot = false, className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-medium rounded-full',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs',
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {dot && (
        <span className={cn(
          'inline-block w-1.5 h-1.5 rounded-full',
          variant === 'success' && 'bg-green-500',
          variant === 'warning' && 'bg-yellow-500',
          variant === 'error' && 'bg-red-500',
          variant === 'info' && 'bg-blue-500',
          variant === 'neutral' && 'bg-gray-400',
          variant === 'brand' && 'bg-brand',
          variant === 'purple' && 'bg-purple-500',
          variant === 'orange' && 'bg-orange-500',
          variant === 'pink' && 'bg-pink-500',
        )} />
      )}
      {children}
    </span>
  )
}

// Mapeamentos semânticos prontos para reutilização

export const SITE_STATUS_VARIANT: Record<string, BadgeVariant> = {
  pendente_ativacao: 'warning',
  online: 'success',
  offline: 'neutral',
  manutencao: 'info',
  suspenso: 'error',
}

export const SITE_STATUS_LABEL: Record<string, string> = {
  pendente_ativacao: 'Aguardando ativação',
  online: 'Online',
  offline: 'Offline',
  manutencao: 'Em manutenção',
  suspenso: 'Suspenso',
}

export const SUB_STATUS_VARIANT: Record<string, BadgeVariant> = {
  active: 'success',
  overdue: 'error',
  canceled: 'neutral',
}

export const SUB_STATUS_LABEL: Record<string, string> = {
  active: 'Ativa',
  overdue: 'Inadimplente',
  canceled: 'Cancelada',
}

export const TICKET_STATUS_VARIANT: Record<string, BadgeVariant> = {
  open: 'warning',
  in_progress: 'info',
  done: 'success',
}

export const TICKET_STATUS_LABEL: Record<string, string> = {
  open: 'Aberto',
  in_progress: 'Em andamento',
  done: 'Concluído',
}

export const CHANGE_TYPE_VARIANT: Record<string, BadgeVariant> = {
  correcao: 'purple',
  texto: 'brand',
  imagem: 'pink',
  texto_e_imagem: 'purple',
  nova_secao: 'orange',
  nova_pagina: 'orange',
  duvida: 'neutral',
  outro: 'neutral',
}

export const CHANGE_TYPE_LABEL: Record<string, string> = {
  correcao: 'Correção',
  texto: 'Alt. de Texto',
  imagem: 'Alt. de Imagem',
  texto_e_imagem: 'Texto + Imagem',
  nova_secao: 'Nova Seção',
  nova_pagina: 'Nova Página',
  duvida: 'Dúvida',
  outro: 'Outro',
}
