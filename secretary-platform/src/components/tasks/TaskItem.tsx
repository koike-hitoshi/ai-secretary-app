'use client'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { formatDueDateLabel, isDueOverdue, isDueSoon } from '@/lib/tasks/utils'
import type { Task } from '@/types'
import { PRIORITY_LABELS } from '@/types/task'
import { cn } from '@/lib/utils'

const priorityVariant = {
  high: 'destructive',
  medium: 'warning',
  low: 'secondary',
} as const

type TaskItemProps = {
  task: Task
  onToggle: (id: string) => void
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  toggling?: boolean
  deleting?: boolean
}

export function TaskItem({
  task,
  onToggle,
  onEdit,
  onDelete,
  toggling = false,
  deleting = false,
}: TaskItemProps) {
  const overdue = !task.completed && isDueOverdue(task.dueDate)
  const dueSoon = !task.completed && isDueSoon(task.dueDate)

  return (
    <Card
      id={`task-${task.id}`}
      className={cn(
        'transition-opacity duration-fast',
        task.completed && 'opacity-70',
        deleting && 'pointer-events-none opacity-40',
      )}
    >
      <div className="flex items-start gap-md">
        <input
          type="checkbox"
          checked={task.completed}
          disabled={toggling || deleting}
          onChange={() => onToggle(task.id)}
          aria-label={`${task.title} を${task.completed ? '未完了' : '完了'}にする`}
          className="mt-xs h-5 w-5 shrink-0 rounded border-border text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-sm">
            <h3
              className={cn(
                'text-base font-medium text-foreground',
                task.completed && 'line-through text-muted-foreground',
              )}
            >
              {task.title}
            </h3>
            <Badge variant={priorityVariant[task.priority]} size="sm">
              {PRIORITY_LABELS[task.priority]}
            </Badge>
          </div>

          {task.description && (
            <p className="mt-xs text-sm text-muted-foreground">{task.description}</p>
          )}

          <div className="mt-sm flex flex-wrap items-center gap-sm text-sm">
            <span
              className={cn(
                'rounded-md px-sm py-xs',
                overdue
                  ? 'bg-destructive/10 text-destructive'
                  : dueSoon
                    ? 'bg-warning/10 text-warning'
                    : 'bg-secondary text-secondary-foreground',
              )}
            >
              {formatDueDateLabel(task.dueDate)}
            </span>
            {task.completed && (
              <span className="text-muted-foreground">完了済み</span>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-xs">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(task)}
            disabled={deleting}
          >
            編集
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(task.id)}
            loading={deleting}
          >
            削除
          </Button>
        </div>
      </div>
    </Card>
  )
}
