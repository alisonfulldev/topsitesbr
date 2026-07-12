import { cn } from '@/lib/utils'
import { Button, ButtonVariant } from './button'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick?: () => void
    href?: string
    variant?: ButtonVariant
  }
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-6 text-center',
        className,
      )}
    >
      {icon && (
        <div className="text-4xl mb-4 text-gray-300">{icon}</div>
      )}
      <p className="text-sm font-medium text-gray-600">{title}</p>
      {description && (
        <p className="text-xs text-gray-400 mt-1 max-w-xs">{description}</p>
      )}
      {action && (
        <div className="mt-4">
          {action.href ? (
            <a href={action.href}>
              <Button variant={action.variant ?? 'secondary'} size="sm">
                {action.label}
              </Button>
            </a>
          ) : (
            <Button variant={action.variant ?? 'secondary'} size="sm" onClick={action.onClick}>
              {action.label}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
