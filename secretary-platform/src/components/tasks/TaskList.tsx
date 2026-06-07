'use client'

import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { TaskItem } from '@/components/tasks/TaskItem'
import { useTasks } from '@/hooks/tasks'
import type { Task } from '@/types'

const PAGE_SIZE = 10

type TaskListProps = {
  onEdit: (task: Task) => void
}

export function TaskList({ onEdit }: TaskListProps) {
  const { filteredTasks, toggleTaskStatus, deleteTask, isLoading } = useTasks()
  const [page, setPage] = useState(1)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const totalPages = Math.max(1, Math.ceil(filteredTasks.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)

  const paginatedTasks = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filteredTasks.slice(start, start + PAGE_SIZE)
  }, [filteredTasks, currentPage])

  const pendingTasks = paginatedTasks.filter((task) => !task.completed)
  const completedTasks = paginatedTasks.filter((task) => task.completed)

  const handleToggle = async (id: string) => {
    setTogglingId(id)
    try {
      await toggleTaskStatus(id)
    } finally {
      setTogglingId(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('このタスクを削除しますか？')) return
    setDeletingId(id)
    try {
      await deleteTask(id)
    } finally {
      setDeletingId(null)
    }
  }

  if (isLoading && filteredTasks.length === 0) {
    return (
      <div className="flex justify-center py-2xl">
        <Spinner size="lg" />
      </div>
    )
  }

  if (filteredTasks.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-surface p-2xl text-center">
        <p className="text-base font-medium text-foreground">
          タスクがありません
        </p>
        <p className="mt-sm text-sm text-muted-foreground">
          「タスクを追加」から新しいタスクを作成してください。
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-lg">
      {pendingTasks.length > 0 && (
        <section aria-label="未完了のタスク" className="flex flex-col gap-md">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            未完了 ({pendingTasks.length})
          </h2>
          <div className="flex flex-col gap-md">
            {pendingTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={handleToggle}
                onEdit={onEdit}
                onDelete={handleDelete}
                toggling={togglingId === task.id}
                deleting={deletingId === task.id}
              />
            ))}
          </div>
        </section>
      )}

      {completedTasks.length > 0 && (
        <section aria-label="完了したタスク" className="flex flex-col gap-md">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            完了 ({completedTasks.length})
          </h2>
          <div className="flex flex-col gap-md">
            {completedTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={handleToggle}
                onEdit={onEdit}
                onDelete={handleDelete}
                toggling={togglingId === task.id}
                deleting={deletingId === task.id}
              />
            ))}
          </div>
        </section>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-sm border-t border-border pt-lg">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage <= 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            前へ
          </Button>
          <span className="text-sm text-muted-foreground">
            {currentPage} / {totalPages} ページ
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages}
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
          >
            次へ
          </Button>
        </div>
      )}
    </div>
  )
}
