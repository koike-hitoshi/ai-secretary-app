import type { TaskPriority } from '@/types'

export type CalendarViewMode = 'month' | 'week' | 'day'

export type CalendarEvent = {
  id: string
  title: string
  description?: string
  location?: string
  start: string
  end: string
  allDay: boolean
  htmlLink?: string
  source: 'google'
}

export type CalendarTaskItem = {
  id: string
  title: string
  description?: string
  dueDate: string
  priority: TaskPriority
  completed: boolean
  source: 'task'
}

export type CalendarItem =
  | CalendarEvent
  | CalendarTaskItem

export type CalendarConnectionStatus = {
  connected: boolean
  lastSyncAt: string | null
}

export type CalendarEventInput = {
  title: string
  description?: string
  location?: string
  start: string
  end: string
  allDay?: boolean
  saveAsTask?: boolean
}

export type CalendarSyncResult = {
  eventCount: number
  taskCount: number
  syncedAt: string
}
