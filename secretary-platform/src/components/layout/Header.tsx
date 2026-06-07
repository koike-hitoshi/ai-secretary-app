'use client'

import Link from 'next/link'
import { Input } from '@/components/ui/Input'
import { IconBell, IconMenu } from '@/components/layout/nav-icons'
import { UserMenu } from '@/components/layout/UserMenu'
import { cn } from '@/lib/utils'

export type HeaderProps = {
  onOpenMobileMenu: () => void
  showSearch?: boolean
}

export function Header({ onOpenMobileMenu, showSearch = true }: HeaderProps) {
  return (
    <header className="glass-sidebar sticky top-0 z-30 flex h-14 shrink-0 items-center gap-md border-b border-border px-md lg:px-lg">
      <button
        type="button"
        onClick={onOpenMobileMenu}
        aria-label="メニューを開く"
        className={cn(
          'inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-foreground lg:hidden',
          'hover:bg-secondary transition-colors duration-fast',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        )}
      >
        <IconMenu size={22} />
      </button>

      <Link
        href="/dashboard"
        className="flex min-w-0 items-center gap-sm rounded-lg transition-opacity duration-fast hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
          AI
        </span>
        <span className="hidden min-w-0 sm:block">
          <span className="block truncate text-sm font-semibold text-foreground">
            AI Secretary
          </span>
          <span className="block truncate text-xs text-muted-foreground">
            秘書プラットフォーム
          </span>
        </span>
      </Link>

      {showSearch && (
        <div className="mx-auto hidden max-w-md flex-1 md:block">
          <Input
            type="search"
            placeholder="検索..."
            aria-label="アプリ内検索"
            className="[&_input]:min-h-[40px] [&_input]:bg-secondary"
          />
        </div>
      )}

      <div className="ml-auto flex items-center gap-xs">
        <button
          type="button"
          aria-label="通知（準備中）"
          className={cn(
            'relative inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-muted-foreground',
            'hover:bg-secondary hover:text-foreground transition-colors duration-fast',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          )}
        >
          <IconBell size={20} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive" />
        </button>
        <UserMenu />
      </div>
    </header>
  )
}
