import type { SupabaseClient } from '@supabase/supabase-js'

import { throwIfError, throwOnError } from '@/lib/supabase/errors'
import { mapTaskRow, toTaskInsert, toTaskUpdate } from '@/lib/supabase/mappers'
import type { Database } from '@/types/database'
import type { Task } from '@/types'

type Supabase = SupabaseClient<Database>

export async function listTasks(
  supabase: Supabase,
  userId: string,
): Promise<Task[]> {
  const rows = throwOnError(
    await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
  )

  return rows.map(mapTaskRow)
}

export async function getTask(
  supabase: Supabase,
  userId: string,
  taskId: string,
): Promise<Task | null> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .eq('id', taskId)
    .maybeSingle()

  if (error) {
    throwOnError({ data: null, error })
  }

  return data ? mapTaskRow(data) : null
}

export async function createTask(
  supabase: Supabase,
  userId: string,
  input: Pick<Task, 'title' | 'description' | 'dueDate' | 'priority'>,
): Promise<Task> {
  const row = throwOnError(
    await supabase
      .from('tasks')
      .insert(toTaskInsert(userId, { ...input, completed: false }))
      .select()
      .single(),
  )

  return mapTaskRow(row)
}

export async function updateTask(
  supabase: Supabase,
  userId: string,
  taskId: string,
  input: Partial<
    Pick<Task, 'title' | 'description' | 'dueDate' | 'priority' | 'completed'>
  >,
): Promise<Task> {
  const row = throwOnError(
    await supabase
      .from('tasks')
      .update(toTaskUpdate(input))
      .eq('user_id', userId)
      .eq('id', taskId)
      .select()
      .single(),
  )

  return mapTaskRow(row)
}

export async function deleteTask(
  supabase: Supabase,
  userId: string,
  taskId: string,
): Promise<void> {
  throwIfError(
    await supabase
      .from('tasks')
      .delete()
      .eq('user_id', userId)
      .eq('id', taskId),
  )
}

export async function listUpcomingTasks(
  supabase: Supabase,
  userId: string,
  daysAhead = 2,
): Promise<Task[]> {
  const today = new Date()
  const end = new Date(today)
  end.setDate(end.getDate() + daysAhead)
  const endDate = end.toISOString().slice(0, 10)

  const rows = throwOnError(
    await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('completed', false)
      .eq('alert_sent', false)
      .lte('due_date', endDate)
      .order('due_date', { ascending: true }),
  )

  return rows.map(mapTaskRow)
}

export async function markTaskAlertSent(
  supabase: Supabase,
  userId: string,
  taskId: string,
): Promise<void> {
  throwIfError(
    await supabase
      .from('tasks')
      .update({ alert_sent: true })
      .eq('user_id', userId)
      .eq('id', taskId),
  )
}
