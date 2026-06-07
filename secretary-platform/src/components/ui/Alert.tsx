'use client'

import { type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import {
  IconAlertTriangle,
  IconCheck,
  IconInfo,
  IconX,
} from '@/components/ui/icons'

export type AlertType = 'info' | 'success' | 'warning' | 'error'

export type AlertProps = HTMLAttributes<HTMLDivElement> & {
  type?: AlertType
  title?: string
  children: ReactNode
  dismissible?: boolean
  onDismiss?: () => void
}

const typeConfig: Record<
  AlertType,
  { icon: typeof IconInfo; container: string; iconColor: string }
> = {
  info: {
    icon: IconInfo,
    container: 'border-info/30 bg-info/10',
    iconColor: 'text-info',
  },
  success: {
    icon: IconCheck,
    container: 'border-success/30 bg-success/10',
    iconColor: 'text-success',
  },
  warning: {
    icon: IconAlertTriangle,
    container: 'border-warning/30 bg-warning/10',
    iconColor: 'text-warning',
  },
  error: {
    icon: IconAlertTriangle,
    container: 'border-destructive/30 bg-destructive/10',
    iconColor: 'text-destructive',
  },
}

export function Alert({
  type = 'info',
  title,
  children,
  dismissible = false,
  onDismiss,
  className,
  role = 'alert',
  ...props
}: AlertProps) {
  const { icon: Icon, container, iconColor } = typeConfig[type]

  return (
    <div
      role={role}
      className={cn(
        'flex gap-md rounded-xl border p-md shadow-sm',
        container,
        className,
      )}
      {...props}
    >
      <Icon
        className={cn('mt-xs shrink-0', iconColor)}
        size={20}
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        {title && (
          <p className="mb-xs text-sm font-semibold text-foreground">{title}</p>
        )}
        <div className="text-sm text-foreground">{children}</div>
      </div>
      {dismissible && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="閉じる"
          className={cn(
            'shrink-0 rounded-md p-xs text-muted-foreground transition-colors duration-fast',
            'hover:bg-secondary hover:text-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          )}
        >
          <IconX size={16} />
        </button>
      )}
    </div>
  )
}
