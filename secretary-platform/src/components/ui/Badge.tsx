import { type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { IconX } from '@/components/ui/icons'

export type BadgeVariant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'destructive'

export type BadgeSize = 'sm' | 'md'

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant
  size?: BadgeSize
  dismissible?: boolean
  onDismiss?: () => void
  children: ReactNode
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-secondary text-secondary-foreground',
  primary: 'bg-primary text-primary-foreground',
  secondary: 'bg-surface-elevated text-foreground ring-1 ring-border',
  accent: 'bg-accent text-accent-foreground',
  success: 'bg-success text-success-foreground',
  warning: 'bg-warning text-warning-foreground',
  destructive: 'bg-destructive text-destructive-foreground',
}

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-sm py-xs text-xs',
  md: 'px-md py-xs text-sm',
}

export function Badge({
  variant = 'default',
  size = 'sm',
  dismissible = false,
  onDismiss,
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex max-w-full items-center gap-xs rounded-full font-medium',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      <span className="truncate">{children}</span>
      {dismissible && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="削除"
          className={cn(
            'inline-flex shrink-0 rounded-full p-xs transition-colors duration-fast',
            'hover:bg-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          )}
        >
          <IconX size={12} />
        </button>
      )}
    </span>
  )
}
