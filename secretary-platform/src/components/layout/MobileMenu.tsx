'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { usePathname } from 'next/navigation'
import { DASHBOARD_NAV_ITEMS, isNavItemActive } from '@/lib/navigation'
import { NavigationItem } from '@/components/layout/NavigationItem'
import { IconX } from '@/components/ui/icons'
import { cn } from '@/lib/utils'

export type MobileMenuProps = {
  open: boolean
  onClose: () => void
}

export function MobileMenu({ open, onClose }: MobileMenuProps) {
  const pathname = usePathname()

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open, onClose])

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="ナビゲーションメニュー">
      <div
        className="absolute inset-0 bg-background/90 animate-fade-in"
        aria-hidden
        onClick={onClose}
      />
      <aside
        className={cn(
          'absolute left-0 top-0 flex h-full w-[min(20rem,85vw)] flex-col border-r border-border bg-surface-elevated shadow-xl',
          'animate-slide-in-left',
        )}
      >
        <div className="flex items-center justify-between border-b border-border px-lg py-md">
          <div>
            <p className="text-label">メニュー</p>
            <p className="text-sm font-semibold text-foreground">AI Secretary</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="メニューを閉じる"
            className={cn(
              'inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-muted-foreground',
              'hover:bg-secondary hover:text-foreground',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            )}
          >
            <IconX size={20} />
          </button>
        </div>
        <nav className="flex flex-1 flex-col gap-xs overflow-y-auto p-md">
          {DASHBOARD_NAV_ITEMS.map((item) => (
            <NavigationItem
              key={item.href}
              item={item}
              active={isNavItemActive(pathname, item.href)}
              onNavigate={onClose}
            />
          ))}
        </nav>
      </aside>
    </div>,
    document.body,
  )
}
