'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { NavItem } from '@/lib/navigation'

export type NavigationItemProps = {
  item: NavItem
  active: boolean
  onNavigate?: () => void
  compact?: boolean
}

export function NavigationItem({
  item,
  active,
  onNavigate,
  compact = false,
}: NavigationItemProps) {
  const { href, label, description, Icon, badge } = item

  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex items-start gap-md rounded-lg px-md py-sm transition-colors duration-fast',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        active
          ? 'bg-primary text-primary-foreground shadow-sm'
          : 'text-foreground hover:bg-secondary',
      )}
    >
      <Icon
        size={20}
        className={cn(
          'mt-xs shrink-0',
          active ? 'text-primary-foreground' : 'text-muted-foreground',
        )}
      />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-sm">
          <span className="block text-base font-medium">{label}</span>
          {badge && (
            <span
              className={cn(
                'rounded-full px-sm py-xs text-xs font-medium',
                active
                  ? 'bg-primary-foreground/20 text-primary-foreground'
                  : 'bg-secondary text-muted-foreground',
              )}
            >
              {badge}
            </span>
          )}
        </span>
        {!compact && (
          <span
            className={cn(
              'mt-xs block text-sm leading-relaxed',
              active ? 'text-primary-foreground' : 'text-muted-foreground',
            )}
          >
            {description}
          </span>
        )}
      </span>
    </Link>
  )
}
