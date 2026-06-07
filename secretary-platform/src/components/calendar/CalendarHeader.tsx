'use client'

import { Button } from '@/components/ui/Button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { useCalendar } from '@/hooks/calendar'
import {
  formatDayLabel,
  formatMonthLabel,
} from '@/lib/calendar/utils'
import type { CalendarViewMode } from '@/types/calendar'

const VIEW_OPTIONS: { value: CalendarViewMode; label: string }[] = [
  { value: 'month', label: '月' },
  { value: 'week', label: '週' },
  { value: 'day', label: '日' },
]

export function CalendarHeader() {
  const {
    currentDate,
    viewMode,
    setViewMode,
    goToToday,
    goToPrevious,
    goToNext,
  } = useCalendar()

  const title =
    viewMode === 'day'
      ? formatDayLabel(currentDate)
      : formatMonthLabel(currentDate)

  return (
    <section
      aria-label="カレンダーナビゲーション"
      className="flex flex-col gap-md rounded-2xl border border-border bg-surface-elevated p-lg"
    >
      <div className="flex flex-wrap items-center justify-between gap-sm">
        <div className="flex flex-wrap items-center gap-sm">
          <Button variant="outline" size="sm" onClick={goToPrevious}>
            前へ
          </Button>
          <Button variant="outline" size="sm" onClick={goToToday}>
            今日
          </Button>
          <Button variant="outline" size="sm" onClick={goToNext}>
            次へ
          </Button>
        </div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      </div>

      <Tabs
        defaultValue="month"
        value={viewMode}
        onValueChange={(value) => setViewMode(value as CalendarViewMode)}
      >
        <TabsList aria-label="表示切替">
          {VIEW_OPTIONS.map((option) => (
            <TabsTrigger key={option.value} value={option.value}>
              {option.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </section>
  )
}
