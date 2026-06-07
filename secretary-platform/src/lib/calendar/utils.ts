import type { CalendarItem, CalendarViewMode } from '@/types/calendar'
import type { Task } from '@/types'

export function formatDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export function endOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999)
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

export function addMonths(date: Date, months: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + months, 1)
}

export function getMonthGridDays(current: Date): Date[] {
  const year = current.getFullYear()
  const month = current.getMonth()
  const firstOfMonth = new Date(year, month, 1)
  const startOffset = firstOfMonth.getDay()
  const gridStart = addDays(firstOfMonth, -startOffset)

  return Array.from({ length: 42 }, (_, index) => addDays(gridStart, index))
}

export function getWeekDays(current: Date): Date[] {
  const start = addDays(current, -current.getDay())
  return Array.from({ length: 7 }, (_, index) => addDays(start, index))
}

export function getRangeForView(
  current: Date,
  viewMode: CalendarViewMode,
): { start: Date; end: Date } {
  if (viewMode === 'day') {
    return { start: startOfDay(current), end: endOfDay(current) }
  }

  if (viewMode === 'week') {
    const days = getWeekDays(current)
    return { start: startOfDay(days[0]), end: endOfDay(days[6]) }
  }

  const gridDays = getMonthGridDays(current)
  return {
    start: startOfDay(gridDays[0]),
    end: endOfDay(gridDays[gridDays.length - 1]),
  }
}

export function toIsoRange(start: Date, end: Date): {
  timeMin: string
  timeMax: string
} {
  return {
    timeMin: start.toISOString(),
    timeMax: end.toISOString(),
  }
}

export function getItemDateKey(item: CalendarItem): string {
  if (item.source === 'task') {
    return item.dueDate
  }

  if (item.allDay) {
    return item.start.slice(0, 10)
  }

  return formatDateKey(new Date(item.start))
}

export function groupItemsByDate(
  items: CalendarItem[],
): Record<string, CalendarItem[]> {
  const grouped: Record<string, CalendarItem[]> = {}

  for (const item of items) {
    const key = getItemDateKey(item)
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(item)
  }

  for (const key of Object.keys(grouped)) {
    grouped[key].sort((a, b) => a.title.localeCompare(b.title, 'ja'))
  }

  return grouped
}

export function taskToCalendarItem(task: Task) {
  if (!task.dueDate) return null

  return {
    id: task.id,
    title: task.title,
    description: task.description,
    dueDate: task.dueDate,
    priority: task.priority,
    completed: task.completed,
    source: 'task' as const,
  }
}

export function formatMonthLabel(date: Date): string {
  return `${date.getFullYear()}年${date.getMonth() + 1}月`
}

export function formatDayLabel(date: Date): string {
  const weekdays = ['日', '月', '火', '水', '木', '金', '土']
  return `${date.getMonth() + 1}/${date.getDate()}（${weekdays[date.getDay()]}）`
}

export function formatTimeLabel(iso: string, allDay: boolean): string {
  if (allDay) return '終日'
  const date = new Date(iso)
  const h = String(date.getHours()).padStart(2, '0')
  const m = String(date.getMinutes()).padStart(2, '0')
  return `${h}:${m}`
}
