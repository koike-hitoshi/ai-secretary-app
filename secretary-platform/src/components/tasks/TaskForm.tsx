'use client'

import { useState, type FormEvent } from 'react'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import type { Task, TaskPriority } from '@/types'
import { PRIORITY_LABELS, type TaskInput } from '@/types/task'

const PRIORITY_OPTIONS = [
  { value: 'high', label: PRIORITY_LABELS.high },
  { value: 'medium', label: PRIORITY_LABELS.medium },
  { value: 'low', label: PRIORITY_LABELS.low },
]

type TaskFormProps = {
  task?: Task | null
  onSubmit: (input: TaskInput) => Promise<void>
  onCancel: () => void
}

const emptyForm: TaskInput = {
  title: '',
  description: '',
  dueDate: '',
  priority: 'medium',
}

export function TaskForm({ task, onSubmit, onCancel }: TaskFormProps) {
  const [form, setForm] = useState<TaskInput>(() =>
    task
      ? {
          title: task.title,
          description: task.description ?? '',
          dueDate: task.dueDate ?? '',
          priority: task.priority,
        }
      : emptyForm,
  )
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!form.title.trim()) {
      setError('タイトルを入力してください')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await onSubmit({
        title: form.title.trim(),
        description: form.description?.trim() || undefined,
        dueDate: form.dueDate || undefined,
        priority: form.priority,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-lg">
      <Input
        label="タイトル"
        required
        value={form.title}
        onChange={(event) => setForm({ ...form, title: event.target.value })}
        placeholder="タスクのタイトル"
        error={error && !form.title.trim() ? error : undefined}
      />

      <Textarea
        label="説明"
        value={form.description ?? ''}
        onChange={(event) =>
          setForm({ ...form, description: event.target.value })
        }
        placeholder="詳細やメモ（任意）"
        rows={3}
      />

      <div className="grid gap-md sm:grid-cols-2">
        <Select
          label="優先度"
          options={PRIORITY_OPTIONS}
          value={form.priority}
          onChange={(value) =>
            setForm({ ...form, priority: value as TaskPriority })
          }
        />
        <Input
          label="期限"
          type="date"
          value={form.dueDate ?? ''}
          onChange={(event) =>
            setForm({ ...form, dueDate: event.target.value })
          }
          hint="任意。期限2日前にアラート表示されます"
        />
      </div>

      {error && form.title.trim() && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="flex flex-wrap justify-end gap-sm border-t border-border pt-lg">
        <Button type="button" variant="outline" onClick={onCancel}>
          キャンセル
        </Button>
        <Button type="submit" loading={loading}>
          {task ? '更新する' : '追加する'}
        </Button>
      </div>
    </form>
  )
}
