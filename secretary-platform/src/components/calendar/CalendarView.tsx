'use client'

import { EventItem } from '@/components/calendar/EventItem'
import { Spinner } from '@/components/ui/Spinner'
import { useCalendar } from '@/hooks/calendar'
import {
  formatDateKey,
  getMonthGridDays,
  getWeekDays,
} from '@/lib/calendar/utils'
import type { CalendarItem } from '@/types/calendar'
import { cn } from '@/lib/utils'

const WEEKDAY_LABELS = ['日', '月', '火', '水', '木', '金', '土']

type CalendarViewProps = {
  onSelectItem: (item: CalendarItem) => void
  onSelectDate: (dateKey: string) => void
}

function DayCell({
  date,
  inCurrentMonth,
  isToday,
  items,
  onSelectItem,
  onSelectDate,
}: {
  date: Date
  inCurrentMonth: boolean
  isToday: boolean
  items: CalendarItem[]
  onSelectItem: (item: CalendarItem) => void
  onSelectDate: (dateKey: string) => void
}) {
  const dateKey = formatDateKey(date)

  return (
    <button
      type="button"
      onClick={() => onSelectDate(dateKey)}
      className={cn(
        'flex min-h-[120px] flex-col gap-xs rounded-xl border border-border p-sm text-left transition-colors duration-fast hover:bg-secondary/40',
        !inCurrentMonth && 'opacity-40',
        isToday && 'border-primary bg-primary/5',
      )}
    >
      <span
        className={cn(
          'text-sm font-medium',
          isToday ? 'text-primary' : 'text-foreground',
        )}
      >
        {date.getDate()}
      </span>
      <div className="flex flex-col gap-xs overflow-hidden">
        {items.slice(0, 3).map((item) => (
          <div
            key={`${item.source}-${item.id}`}
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
          >
            <EventItem item={item} onSelect={onSelectItem} compact />
          </div>
        ))}
        {items.length > 3 && (
          <span className="text-xs text-muted-foreground">
            +{items.length - 3} 件
          </span>
        )}
      </div>
    </button>
  )
}

function ListDaySection({
  date,
  items,
  onSelectItem,
  onSelectDate,
}: {
  date: Date
  items: CalendarItem[]
  onSelectItem: (item: CalendarItem) => void
  onSelectDate: (dateKey: string) => void
}) {
  const dateKey = formatDateKey(date)
  const todayKey = formatDateKey(new Date())

  return (
    <section className="rounded-2xl border border-border bg-surface p-lg">
      <button
        type="button"
        onClick={() => onSelectDate(dateKey)}
        className="mb-md text-base font-semibold text-foreground hover:text-primary"
      >
        {date.getMonth() + 1}/{date.getDate()}（{WEEKDAY_LABELS[date.getDay()]}）
        {dateKey === todayKey && (
          <span className="ml-sm text-sm text-primary">今日</span>
        )}
      </button>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">予定・タスクなし</p>
      ) : (
        <div className="flex flex-col gap-sm">
          {items.map((item) => (
            <EventItem key={`${item.source}-${item.id}`} item={item} onSelect={onSelectItem} />
          ))}
        </div>
      )}
    </section>
  )
}

export function CalendarView({ onSelectItem, onSelectDate }: CalendarViewProps) {
  const { currentDate, viewMode, itemsByDate, isLoading } = useCalendar()
  const todayKey = formatDateKey(new Date())

  if (isLoading) {
    return (
      <div className="flex justify-center py-2xl">
        <Spinner size="lg" label="カレンダーを読み込み中" />
      </div>
    )
  }

  if (viewMode === 'month') {
    const gridDays = getMonthGridDays(currentDate)
    const currentMonth = currentDate.getMonth()

    return (
      <div className="rounded-2xl border border-border bg-surface-elevated p-lg">
        <div className="mb-md grid grid-cols-7 gap-sm">
          {WEEKDAY_LABELS.map((label) => (
            <div
              key={label}
              className="text-center text-xs font-semibold uppercase text-muted-foreground"
            >
              {label}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-sm">
          {gridDays.map((date) => {
            const dateKey = formatDateKey(date)
            return (
              <DayCell
                key={dateKey}
                date={date}
                inCurrentMonth={date.getMonth() === currentMonth}
                isToday={dateKey === todayKey}
                items={itemsByDate[dateKey] ?? []}
                onSelectItem={onSelectItem}
                onSelectDate={onSelectDate}
              />
            )
          })}
        </div>
      </div>
    )
  }

  const days =
    viewMode === 'week' ? getWeekDays(currentDate) : [currentDate]

  return (
    <div className="flex flex-col gap-md">
      {days.map((date) => {
        const dateKey = formatDateKey(date)
        return (
          <ListDaySection
            key={dateKey}
            date={date}
            items={itemsByDate[dateKey] ?? []}
            onSelectItem={onSelectItem}
            onSelectDate={onSelectDate}
          />
        )
      })}
    </div>
  )
}
