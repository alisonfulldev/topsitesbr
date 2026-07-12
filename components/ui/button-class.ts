import { cn } from '@/lib/utils'

export type ButtonVariant = 'conversion' | 'primary' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

export const variantClasses: Record<ButtonVariant, string> = {
  conversion: 'bg-brand hover:bg-brand-hover text-brand-dark font-semibold shadow-sm',
  primary: 'bg-gray-900 hover:bg-gray-800 text-white font-semibold',
  secondary: 'border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium',
  ghost: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 font-medium',
  danger: 'bg-red-600 hover:bg-red-700 text-white font-semibold',
}

export const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-lg min-h-[32px]',
  md: 'px-4 py-2.5 text-sm rounded-xl min-h-[44px]',
  lg: 'px-5 py-3 text-sm rounded-xl min-h-[52px]',
}

export function buttonVariantClass(variant: ButtonVariant = 'primary', size: ButtonSize = 'md') {
  return cn(
    'inline-flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
    variantClasses[variant],
    sizeClasses[size],
  )
}
