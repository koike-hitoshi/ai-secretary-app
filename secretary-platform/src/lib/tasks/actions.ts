'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase/server'
import {
  createTask,
  deleteTask,
  listTasks,
  listUpcomingTasks,
  markTaskAlertSent,
  updateTask,
} from '@/lib/supabase/tasks'
import { getCurrentUserOrThrow } from '@/lib/supabase/users'
import type { TaskInput } from '@/types/task'
import type { Task } from '@/types'

const TASKS_PATH = '/dashboard/tasks'

async function getAuthenticatedSupabase() {
  const supabase = await createClient()
  const user = await getCurrentUserOrThrow(supabase)
  return { supabase, userId: user.id }
}

export async function fetchTasksAction(): Promise<Task[]> {
  const { supabase, userId } = await getAuthenticatedSupabase()
  return listTasks(supabase, userId)
}

export async function fetchTaskAlertsAction(): Promise<Task[]> {
  const { supabase, userId } = await getAuthenticatedSupabase()
  return listUpcomingTasks(supabase, userId, 2)
}

export async function createTaskAction(input: TaskInput): Promise<Task> {
  const title = input.title.trim()
  if (!title) {
    throw new Error('タイトルを入力してください')
  }

  const { supabase, userId } = await getAuthenticatedSupabase()
  const task = await createTask(supabase, userId, {
    title,
    description: input.description?.trim() || undefined,
    dueDate: input.dueDate || undefined,
    priority: input.priority,
  })

  revalidatePath(TASKS_PATH)
  return task
}

export async function updateTaskAction(
  taskId: string,
  input: Partial<TaskInput & { completed: boolean }>,
): Promise<Task> {
  if (input.title !== undefined && !input.title.trim()) {
    throw new Error('タイトルを入力してください')
  }

  const { supabase, userId } = await getAuthenticatedSupabase()
  const task = await updateTask(supabase, userId, taskId, {
    ...(input.title !== undefined ? { title: input.title.trim() } : {}),
    ...(input.description !== undefined
      ? { description: input.description.trim() || undefined }
      : {}),
    ...(input.dueDate !== undefined ? { dueDate: input.dueDate || undefined } : {}),
    ...(input.priority !== undefined ? { priority: input.priority } : {}),
    ...(input.completed !== undefined ? { completed: input.completed } : {}),
  })

  revalidatePath(TASKS_PATH)
  return task
}

export async function deleteTaskAction(taskId: string): Promise<void> {
  const { supabase, userId } = await getAuthenticatedSupabase()
  await deleteTask(supabase, userId, taskId)
  revalidatePath(TASKS_PATH)
}

export async function toggleTaskStatusAction(
  taskId: string,
  completed: boolean,
): Promise<Task> {
  return updateTaskAction(taskId, { completed })
}

export async function dismissTaskAlertAction(taskId: string): Promise<void> {
  const { supabase, userId } = await getAuthenticatedSupabase()
  await markTaskAlertSent(supabase, userId, taskId)
  revalidatePath(TASKS_PATH)
}
