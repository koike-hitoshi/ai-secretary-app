import type { Task, TaskPriority } from '@/types'

export type TaskStatusFilter = 'all' | 'pending' | 'completed'

export type TaskPriorityFilter = 'all' | TaskPriority

export type TaskDueFilter = 'all' | 'today' | 'week' | 'month' | 'overdue'

export type TaskSortField = 'dueDate' | 'priority' | 'createdAt' | 'title'

export type TaskSortOrder = 'asc' | 'desc'

export type TaskFilters = {
  status: TaskStatusFilter
  priority: TaskPriorityFilter
  due: TaskDueFilter
}

export type TaskSort = {
  field: TaskSortField
  order: TaskSortOrder
}

export type TaskInput = Pick<Task, 'title' | 'description' | 'dueDate' | 'priority'>

export const DEFAULT_TASK_FILTERS: TaskFilters = {
  status: 'all',
  priority: 'all',
  due: 'all',
}

export const DEFAULT_TASK_SORT: TaskSort = {
  field: 'createdAt',
  order: 'desc',
}

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  high: '高',
  medium: '中',
  low: '低',
}

export const PRIORITY_ORDER: Record<TaskPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
}
