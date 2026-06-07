'use client'

import { useMemo } from 'react'

import { useTaskContext } from '@/contexts/TaskContext'
import type { TaskInput } from '@/types/task'

export function useTask(taskId: string | null) {
  const { tasks, updateTask, deleteTask, toggleTaskStatus } = useTaskContext()

  const task = useMemo(
    () => (taskId ? tasks.find((item) => item.id === taskId) ?? null : null),
    [tasks, taskId],
  )

  return {
    task,
    updateTask: (input: Partial<TaskInput>) =>
      taskId ? updateTask(taskId, input) : Promise.resolve(),
    deleteTask: () => (taskId ? deleteTask(taskId) : Promise.resolve()),
    toggleTaskStatus: () =>
      taskId ? toggleTaskStatus(taskId) : Promise.resolve(),
  }
}
