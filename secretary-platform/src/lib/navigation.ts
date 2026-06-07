import type { ComponentType, SVGProps } from 'react'
import {
  IconCalendar,
  IconDashboard,
  IconFileText,
  IconMic,
  IconSearch,
  IconTasks,
} from '@/components/layout/nav-icons'

export type NavIconComponent = ComponentType<
  SVGProps<SVGSVGElement> & { size?: number }
>

export type NavItem = {
  href: string
  label: string
  description: string
  Icon: NavIconComponent
  badge?: string
}

/** ダッシュボード配下のメインナビゲーション（チケット #03） */
export const DASHBOARD_NAV_ITEMS: NavItem[] = [
  {
    href: '/dashboard',
    label: 'ダッシュボード',
    description: '概要とクイックアクセス',
    Icon: IconDashboard,
  },
  {
    href: '/dashboard/tasks',
    label: 'タスク管理',
    description: 'Todo・期限・優先度',
    Icon: IconTasks,
  },
  {
    href: '/dashboard/calendar',
    label: 'カレンダー',
    description: 'Google連携',
    Icon: IconCalendar,
  },
  {
    href: '/dashboard/documents/proofread',
    label: '文章校正',
    description: '誤字・文法・文体改善',
    Icon: IconFileText,
  },
  {
    href: '/dashboard/documents/minutes',
    label: '議事録',
    description: '音声から議事録作成',
    Icon: IconMic,
  },
  {
    href: '/dashboard/documents/research',
    label: 'リサーチ',
    description: 'Web調査と要約',
    Icon: IconSearch,
  },
]

export function isNavItemActive(pathname: string, href: string): boolean {
  if (href === '/dashboard') return pathname === '/dashboard'
  return pathname === href || pathname.startsWith(`${href}/`)
}
