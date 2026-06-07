'use client'

import { Badge } from '@/components/ui/Badge'
import { isCalendarEvent } from '@/contexts/CalendarContext'
import { formatTimeLabel } from '@/lib/calendar/utils'
import type { CalendarItem } from '@/types/calendar'
import { PRIORITY_LABELS } from '@/types/task'
import { cn } from '@/lib/utils'

type EventItemProps = {
  item: CalendarItem
  onSelect: (item: CalendarItem) => void
  compact?: boolean
}

export function EventItem({ item, onSelect, compact = false }: EventItemProps) {
  const isEvent = isCalendarEvent(item)
  const isTask = item.source === 'task'

  const variant = isEvent
    ? 'primary'
    : item.completed
      ? 'secondary'
      : item.priority === 'high'
        ? 'destructive'
        : item.priority === 'medium'
          ? 'warning'
          : 'secondary'

  const label = isEvent
    ? `${formatTimeLabel(item.start, item.allDay)} ${item.title}`
    : `${PRIORITY_LABELS[item.priority]} ${item.title}`

  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      className={cn(
        'w-full text-left transition-opacity duration-fast hover:opacity-90',
        item.source === 'task' && item.completed && 'opacity-60',
      )}
    >
      <Badge
        variant={variant}
        size="sm"
        className={cn('max-w-full', compact && 'text-xs')}
      >
        {isTask && !item.completed ? '📋 ' : isEvent ? '📅 ' : '✓ '}
        {label}
      </Badge>
    </button>
  )
}
