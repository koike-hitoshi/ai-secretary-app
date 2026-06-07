import type { Tables, TablesInsert } from '@/types/database'
import type { Task, TaskPriority } from '@/types'

type TaskRow = Tables<'tasks'>

export function mapTaskRow(row: TaskRow): Task {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    description: row.description ?? undefined,
    dueDate: row.due_date ?? undefined,
    priority: row.priority as TaskPriority,
    completed: row.completed,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function toTaskInsert(
  userId: string,
  input: Pick<Task, 'title' | 'description' | 'dueDate' | 'priority' | 'completed'>,
): TablesInsert<'tasks'> {
  return {
    user_id: userId,
    title: input.title,
    description: input.description ?? null,
    due_date: input.dueDate ?? null,
    priority: input.priority,
    completed: input.completed ?? false,
  }
}

export function toTaskUpdate(
  input: Partial<
    Pick<Task, 'title' | 'description' | 'dueDate' | 'priority' | 'completed'>
  >,
): Partial<TablesInsert<'tasks'>> {
  return {
    ...(input.title !== undefined ? { title: input.title } : {}),
    ...(input.description !== undefined
      ? { description: input.description ?? null }
      : {}),
    ...(input.dueDate !== undefined ? { due_date: input.dueDate ?? null } : {}),
    ...(input.priority !== undefined ? { priority: input.priority } : {}),
    ...(input.completed !== undefined ? { completed: input.completed } : {}),
  }
}
