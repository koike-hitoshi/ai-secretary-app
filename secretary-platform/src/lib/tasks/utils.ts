import {
  DEFAULT_TASK_FILTERS,
  DEFAULT_TASK_SORT,
  PRIORITY_ORDER,
  type TaskDueFilter,
  type TaskFilters,
  type TaskSort,
} from '@/types/task'
import type { Task } from '@/types'

export function formatLocalDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function getTodayStr(): string {
  return formatLocalDate(new Date())
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

export function getWeekEndStr(): string {
  const today = new Date()
  const day = today.getDay()
  const daysUntilSunday = day === 0 ? 0 : 7 - day
  return formatLocalDate(addDays(today, daysUntilSunday))
}

export function getMonthEndStr(): string {
  const today = new Date()
  const end = new Date(today.getFullYear(), today.getMonth() + 1, 0)
  return formatLocalDate(end)
}

function matchesDueFilter(dueDate: string | undefined, filter: TaskDueFilter): boolean {
  if (filter === 'all') return true
  if (!dueDate) return false

  const today = getTodayStr()

  switch (filter) {
    case 'today':
      return dueDate === today
    case 'week':
      return dueDate >= today && dueDate <= getWeekEndStr()
    case 'month':
      return dueDate >= today && dueDate <= getMonthEndStr()
    case 'overdue':
      return dueDate < today
    default:
      return true
  }
}

export function filterTasks(tasks: Task[], filters: TaskFilters): Task[] {
  return tasks.filter((task) => {
    if (filters.status === 'pending' && task.completed) return false
    if (filters.status === 'completed' && !task.completed) return false
    if (filters.priority !== 'all' && task.priority !== filters.priority) return false
    if (!matchesDueFilter(task.dueDate, filters.due)) return false
    return true
  })
}

export function sortTasks(tasks: Task[], sort: TaskSort): Task[] {
  const sorted = [...tasks]

  sorted.sort((a, b) => {
    let cmp = 0

    switch (sort.field) {
      case 'title':
        cmp = a.title.localeCompare(b.title, 'ja')
        break
      case 'priority':
        cmp = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
        break
      case 'dueDate': {
        const aDue = a.dueDate ?? '9999-12-31'
        const bDue = b.dueDate ?? '9999-12-31'
        cmp = aDue.localeCompare(bDue)
        break
      }
      case 'createdAt':
        cmp = a.createdAt.localeCompare(b.createdAt)
        break
    }

    if (cmp === 0) {
      cmp = a.createdAt.localeCompare(b.createdAt)
    }

    return sort.order === 'asc' ? cmp : -cmp
  })

  return sorted
}

export function applyTaskQuery(
  tasks: Task[],
  filters: TaskFilters = DEFAULT_TASK_FILTERS,
  sort: TaskSort = DEFAULT_TASK_SORT,
): Task[] {
  return sortTasks(filterTasks(tasks, filters), sort)
}

export function formatDueDateLabel(dueDate: string | undefined): string {
  if (!dueDate) return '期限なし'

  const today = getTodayStr()
  if (dueDate < today) return '期限切れ'
  if (dueDate === today) return '今日'

  const tomorrow = formatLocalDate(addDays(new Date(), 1))
  if (dueDate === tomorrow) return '明日'

  const due = new Date(`${dueDate}T00:00:00`)
  const now = new Date(`${today}T00:00:00`)
  const diffDays = Math.round(
    (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  )

  if (diffDays > 0 && diffDays <= 7) return `あと${diffDays}日`

  const [y, m, d] = dueDate.split('-')
  return `${y}/${m}/${d}`
}

export function isDueOverdue(dueDate: string | undefined): boolean {
  if (!dueDate) return false
  return dueDate < getTodayStr()
}

export function isDueSoon(dueDate: string | undefined, daysAhead = 2): boolean {
  if (!dueDate) return false
  const today = getTodayStr()
  const end = formatLocalDate(addDays(new Date(), daysAhead))
  return dueDate >= today && dueDate <= end
}

export function hasActiveFilters(filters: TaskFilters): boolean {
  return (
    filters.status !== 'all' ||
    filters.priority !== 'all' ||
    filters.due !== 'all'
  )
}
