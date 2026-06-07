'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { DASHBOARD_NAV_ITEMS, isNavItemActive } from '@/lib/navigation'
import { NavigationItem } from '@/components/layout/NavigationItem'

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="glass-sidebar hidden w-60 shrink-0 flex-col border-r border-border lg:flex">
      <div className="border-b border-border px-lg py-lg">
        <p className="text-label tracking-wide">AI SECRETARY</p>
        <h2 className="mt-sm text-lg font-semibold tracking-tight text-foreground">
          秘書プラットフォーム
        </h2>
      </div>
      <nav
        aria-label="メインナビゲーション"
        className="flex flex-1 flex-col gap-xs overflow-y-auto p-md"
      >
        {DASHBOARD_NAV_ITEMS.map((item) => (
          <NavigationItem
            key={item.href}
            item={item}
            active={isNavItemActive(pathname, item.href)}
          />
        ))}
      </nav>
      <div className="border-t border-border p-md">
        <Link
          href="/dashboard/design-system"
          className="block rounded-lg px-md py-sm text-xs text-muted-foreground transition-colors duration-fast hover:bg-secondary hover:text-foreground"
        >
          デザインシステム
        </Link>
      </div>
    </aside>
  )
}
