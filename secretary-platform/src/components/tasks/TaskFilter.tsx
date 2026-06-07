'use client'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { hasActiveFilters } from '@/lib/tasks/utils'
import { useTasks } from '@/hooks/tasks'
import {
  type TaskDueFilter,
  type TaskPriorityFilter,
  type TaskSortField,
  type TaskStatusFilter,
} from '@/types/task'

const STATUS_OPTIONS = [
  { value: 'all', label: 'すべて' },
  { value: 'pending', label: '未完了' },
  { value: 'completed', label: '完了' },
]

const PRIORITY_OPTIONS = [
  { value: 'all', label: 'すべて' },
  { value: 'high', label: '高' },
  { value: 'medium', label: '中' },
  { value: 'low', label: '低' },
]

const DUE_OPTIONS = [
  { value: 'all', label: 'すべて' },
  { value: 'today', label: '今日' },
  { value: 'week', label: '今週' },
  { value: 'month', label: '今月' },
  { value: 'overdue', label: '期限切れ' },
]

const SORT_OPTIONS = [
  { value: 'createdAt:desc', label: '作成日（新しい順）' },
  { value: 'createdAt:asc', label: '作成日（古い順）' },
  { value: 'dueDate:asc', label: '期限（近い順）' },
  { value: 'dueDate:desc', label: '期限（遠い順）' },
  { value: 'priority:asc', label: '優先度（高→低）' },
  { value: 'title:asc', label: 'タイトル（A→Z）' },
]

export function TaskFilter() {
  const { filters, sort, setFilters, setSort, clearFilters, filteredTasks, tasks } =
    useTasks()

  const sortValue = `${sort.field}:${sort.order}`

  return (
    <section
      aria-label="タスクフィルター"
      className="rounded-2xl border border-border bg-surface-elevated p-lg"
    >
      <div className="mb-md flex flex-wrap items-center justify-between gap-sm">
        <div className="flex flex-wrap items-center gap-sm">
          <h2 className="text-base font-semibold text-foreground">フィルター</h2>
          {hasActiveFilters(filters) && (
            <Badge variant="primary" size="sm">
              適用中
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {filteredTasks.length} / {tasks.length} 件
        </p>
      </div>

      <div className="grid gap-md sm:grid-cols-2 xl:grid-cols-4">
        <Select
          label="ステータス"
          options={STATUS_OPTIONS}
          value={filters.status}
          onChange={(value) =>
            setFilters({ ...filters, status: value as TaskStatusFilter })
          }
        />
        <Select
          label="優先度"
          options={PRIORITY_OPTIONS}
          value={filters.priority}
          onChange={(value) =>
            setFilters({ ...filters, priority: value as TaskPriorityFilter })
          }
        />
        <Select
          label="期限"
          options={DUE_OPTIONS}
          value={filters.due}
          onChange={(value) =>
            setFilters({ ...filters, due: value as TaskDueFilter })
          }
        />
        <Select
          label="並び替え"
          options={SORT_OPTIONS}
          value={sortValue}
          onChange={(value) => {
            const [field, order] = String(value).split(':') as [
              TaskSortField,
              'asc' | 'desc',
            ]
            setSort({ field, order })
          }}
        />
      </div>

      {hasActiveFilters(filters) && (
        <div className="mt-md flex justify-end">
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            フィルターをクリア
          </Button>
        </div>
      )}
    </section>
  )
}
