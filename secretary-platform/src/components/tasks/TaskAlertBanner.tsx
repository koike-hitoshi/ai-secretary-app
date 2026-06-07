'use client'

import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { formatDueDateLabel } from '@/lib/tasks/utils'
import { useTaskAlerts } from '@/hooks/tasks'

export function TaskAlertBanner() {
  const { alerts, dismissAlert } = useTaskAlerts()

  if (alerts.length === 0) return null

  const scrollToTask = (taskId: string) => {
    const element = document.getElementById(`task-${taskId}`)
    element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    element?.focus({ preventScroll: true })
  }

  return (
    <Alert
      type="warning"
      title={`期限が近いタスクが ${alerts.length} 件あります`}
      dismissible={false}
    >
      <ul className="mt-sm flex flex-col gap-sm">
        {alerts.map((task) => (
          <li
            key={task.id}
            className="flex flex-wrap items-center justify-between gap-sm rounded-lg bg-warning/5 px-sm py-xs"
          >
            <button
              type="button"
              onClick={() => scrollToTask(task.id)}
              className="text-left text-sm font-medium text-foreground underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {task.title}
              <span className="ml-sm font-normal text-muted-foreground">
                ({formatDueDateLabel(task.dueDate)})
              </span>
            </button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dismissAlert(task.id)}
            >
              確認済み
            </Button>
          </li>
        ))}
      </ul>
    </Alert>
  )
}
