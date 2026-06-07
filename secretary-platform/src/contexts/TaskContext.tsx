'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import {
  createTaskAction,
  deleteTaskAction,
  dismissTaskAlertAction,
  fetchTaskAlertsAction,
  fetchTasksAction,
  toggleTaskStatusAction,
  updateTaskAction,
} from '@/lib/tasks/actions'
import { applyTaskQuery } from '@/lib/tasks/utils'
import type { Task } from '@/types'
import {
  DEFAULT_TASK_FILTERS,
  DEFAULT_TASK_SORT,
  type TaskFilters,
  type TaskInput,
  type TaskSort,
} from '@/types/task'

type TaskContextValue = {
  tasks: Task[]
  alerts: Task[]
  filteredTasks: Task[]
  filters: TaskFilters
  sort: TaskSort
  isLoading: boolean
  error: string | null
  clearError: () => void
  setFilters: (filters: TaskFilters) => void
  setSort: (sort: TaskSort) => void
  clearFilters: () => void
  createTask: (input: TaskInput) => Promise<void>
  updateTask: (id: string, input: Partial<TaskInput>) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  toggleTaskStatus: (id: string) => Promise<void>
  dismissAlert: (id: string) => Promise<void>
  refreshTasks: () => Promise<void>
}

const TaskContext = createContext<TaskContextValue | null>(null)

type TaskProviderProps = {
  initialTasks: Task[]
  initialAlerts: Task[]
  children: ReactNode
}

export function TaskProvider({
  initialTasks,
  initialAlerts,
  children,
}: TaskProviderProps) {
  const [tasks, setTasks] = useState(initialTasks)
  const [alerts, setAlerts] = useState(initialAlerts)
  const [filters, setFilters] = useState<TaskFilters>(DEFAULT_TASK_FILTERS)
  const [sort, setSort] = useState<TaskSort>(DEFAULT_TASK_SORT)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const filteredTasks = useMemo(
    () => applyTaskQuery(tasks, filters, sort),
    [tasks, filters, sort],
  )

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_TASK_FILTERS)
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const refreshTasks = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [nextTasks, nextAlerts] = await Promise.all([
        fetchTasksAction(),
        fetchTaskAlertsAction(),
      ])
      setTasks(nextTasks)
      setAlerts(nextAlerts)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'タスクの取得に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createTask = useCallback(async (input: TaskInput) => {
    setError(null)
    const optimisticId = `optimistic-${Date.now()}`
    const now = new Date().toISOString()
    const optimistic: Task = {
      id: optimisticId,
      userId: '',
      title: input.title.trim(),
      description: input.description,
      dueDate: input.dueDate,
      priority: input.priority,
      completed: false,
      createdAt: now,
      updatedAt: now,
    }

    setTasks((prev) => [optimistic, ...prev])

    try {
      const created = await createTaskAction(input)
      setTasks((prev) =>
        prev.map((task) => (task.id === optimisticId ? created : task)),
      )
      const nextAlerts = await fetchTaskAlertsAction()
      setAlerts(nextAlerts)
    } catch (err) {
      setTasks((prev) => prev.filter((task) => task.id !== optimisticId))
      const message =
        err instanceof Error ? err.message : 'タスクの作成に失敗しました'
      setError(message)
      throw err
    }
  }, [])

  const updateTask = useCallback(async (id: string, input: Partial<TaskInput>) => {
    setError(null)
    const previous = tasks.find((task) => task.id === id)
    if (!previous) return

    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? {
              ...task,
              ...input,
              title: input.title?.trim() ?? task.title,
              updatedAt: new Date().toISOString(),
            }
          : task,
      ),
    )

    try {
      const updated = await updateTaskAction(id, input)
      setTasks((prev) =>
        prev.map((task) => (task.id === id ? updated : task)),
      )
      const nextAlerts = await fetchTaskAlertsAction()
      setAlerts(nextAlerts)
    } catch (err) {
      setTasks((prev) =>
        prev.map((task) => (task.id === id ? previous : task)),
      )
      const message =
        err instanceof Error ? err.message : 'タスクの更新に失敗しました'
      setError(message)
      throw err
    }
  }, [tasks])

  const deleteTask = useCallback(async (id: string) => {
    setError(null)
    const previous = tasks
    setTasks((prev) => prev.filter((task) => task.id !== id))
    setAlerts((prev) => prev.filter((task) => task.id !== id))

    try {
      await deleteTaskAction(id)
    } catch (err) {
      setTasks(previous)
      const message =
        err instanceof Error ? err.message : 'タスクの削除に失敗しました'
      setError(message)
      throw err
    }
  }, [tasks])

  const toggleTaskStatus = useCallback(async (id: string) => {
    const task = tasks.find((item) => item.id === id)
    if (!task) return

    setError(null)
    const nextCompleted = !task.completed

    setTasks((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: nextCompleted } : item,
      ),
    )

    try {
      const updated = await toggleTaskStatusAction(id, nextCompleted)
      setTasks((prev) =>
        prev.map((item) => (item.id === id ? updated : item)),
      )
      const nextAlerts = await fetchTaskAlertsAction()
      setAlerts(nextAlerts)
    } catch (err) {
      setTasks((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, completed: task.completed } : item,
        ),
      )
      const message =
        err instanceof Error ? err.message : 'ステータスの更新に失敗しました'
      setError(message)
      throw err
    }
  }, [tasks])

  const dismissAlert = useCallback(async (id: string) => {
    setAlerts((prev) => prev.filter((task) => task.id !== id))

    try {
      await dismissTaskAlertAction(id)
    } catch (err) {
      const nextAlerts = await fetchTaskAlertsAction()
      setAlerts(nextAlerts)
      const message =
        err instanceof Error ? err.message : 'アラートの更新に失敗しました'
      setError(message)
      throw err
    }
  }, [])

  const value = useMemo(
    () => ({
      tasks,
      alerts,
      filteredTasks,
      filters,
      sort,
      isLoading,
      error,
      clearError,
      setFilters,
      setSort,
      clearFilters,
      createTask,
      updateTask,
      deleteTask,
      toggleTaskStatus,
      dismissAlert,
      refreshTasks,
    }),
    [
      tasks,
      alerts,
      filteredTasks,
      filters,
      sort,
      isLoading,
      error,
      clearError,
      clearFilters,
      createTask,
      updateTask,
      deleteTask,
      toggleTaskStatus,
      dismissAlert,
      refreshTasks,
    ],
  )

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>
}

export function useTaskContext() {
  const context = useContext(TaskContext)
  if (!context) {
    throw new Error('useTaskContext must be used within TaskProvider')
  }
  return context
}
