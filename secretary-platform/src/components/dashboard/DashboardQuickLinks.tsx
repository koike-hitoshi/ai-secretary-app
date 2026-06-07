'use client'

import Link from 'next/link'
import { DASHBOARD_NAV_ITEMS } from '@/lib/navigation'

export function DashboardQuickLinks() {
  const modules = DASHBOARD_NAV_ITEMS.filter(
    (item) => item.href !== '/dashboard',
  )

  return (
    <div className="grid gap-md p-xl sm:grid-cols-2 lg:grid-cols-3">
      {modules.map((item) => {
        const Icon = item.Icon
        return (
          <Link
            key={item.href}
            href={item.href}
            className="group rounded-2xl border border-border bg-surface-elevated p-lg shadow-md transition-shadow duration-normal hover:shadow-lg"
          >
            <div className="flex items-center gap-sm">
              <Icon
                size={22}
                className="shrink-0 text-primary transition-colors duration-fast group-hover:text-primary-hover"
              />
              <h2 className="text-lg font-semibold text-foreground group-hover:text-primary">
                {item.label}
              </h2>
            </div>
            <p className="mt-sm text-caption">{item.description}</p>
          </Link>
        )
      })}
    </div>
  )
}
