'use client'

import { useState, type FormEvent } from 'react'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import type { CalendarEvent, CalendarEventInput } from '@/types/calendar'

type EventFormProps = {
  event?: CalendarEvent | null
  defaultDate?: string
  connected: boolean
  onSubmit: (input: CalendarEventInput) => Promise<void>
  onCancel: () => void
}

function toDatetimeLocalValue(iso: string, allDay: boolean): string {
  if (allDay) return `${iso.slice(0, 10)}T09:00`
  const date = new Date(iso)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const h = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${d}T${h}:${min}`
}

function buildDefaultForm(defaultDate?: string): CalendarEventInput {
  const date = defaultDate ?? new Date().toISOString().slice(0, 10)
  return {
    title: '',
    description: '',
    location: '',
    start: `${date}T09:00:00`,
    end: `${date}T10:00:00`,
    allDay: false,
    saveAsTask: false,
  }
}

export function EventForm({
  event,
  defaultDate,
  connected,
  onSubmit,
  onCancel,
}: EventFormProps) {
  const [form, setForm] = useState<CalendarEventInput>(() =>
    event
      ? {
          title: event.title,
          description: event.description ?? '',
          location: event.location ?? '',
          start: event.start,
          end: event.end,
          allDay: event.allDay,
          saveAsTask: false,
        }
      : buildDefaultForm(defaultDate),
  )
  const [startLocal, setStartLocal] = useState(() =>
    event
      ? toDatetimeLocalValue(event.start, event.allDay)
      : `${(defaultDate ?? new Date().toISOString().slice(0, 10))}T09:00`,
  )
  const [endLocal, setEndLocal] = useState(() =>
    event
      ? toDatetimeLocalValue(event.end, event.allDay)
      : `${(defaultDate ?? new Date().toISOString().slice(0, 10))}T10:00`,
  )
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) {
      setError('タイトルを入力してください')
      return
    }
    if (!connected) {
      setError('Googleカレンダー連携が必要です')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const start = form.allDay
        ? startLocal.slice(0, 10)
        : new Date(startLocal).toISOString()
      const end = form.allDay
        ? endLocal.slice(0, 10)
        : new Date(endLocal).toISOString()

      await onSubmit({
        ...form,
        title: form.title.trim(),
        description: form.description?.trim() || undefined,
        location: form.location?.trim() || undefined,
        start,
        end,
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
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        placeholder="予定のタイトル"
      />

      <Textarea
        label="説明"
        value={form.description ?? ''}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        rows={3}
      />

      <Input
        label="場所"
        value={form.location ?? ''}
        onChange={(e) => setForm({ ...form, location: e.target.value })}
      />

      <label className="flex items-center gap-sm text-sm text-foreground">
        <input
          type="checkbox"
          checked={form.allDay ?? false}
          onChange={(e) => setForm({ ...form, allDay: e.target.checked })}
          className="h-4 w-4 rounded border-border"
        />
        終日
      </label>

      {form.allDay ? (
        <div className="grid gap-md sm:grid-cols-2">
          <Input
            label="開始日"
            type="date"
            value={startLocal.slice(0, 10)}
            onChange={(e) => setStartLocal(`${e.target.value}T00:00`)}
          />
          <Input
            label="終了日"
            type="date"
            value={endLocal.slice(0, 10)}
            onChange={(e) => setEndLocal(`${e.target.value}T00:00`)}
          />
        </div>
      ) : (
        <div className="grid gap-md sm:grid-cols-2">
          <Input
            label="開始"
            type="datetime-local"
            value={startLocal}
            onChange={(e) => setStartLocal(e.target.value)}
          />
          <Input
            label="終了"
            type="datetime-local"
            value={endLocal}
            onChange={(e) => setEndLocal(e.target.value)}
          />
        </div>
      )}

      {!event && (
        <label className="flex items-center gap-sm text-sm text-foreground">
          <input
            type="checkbox"
            checked={form.saveAsTask ?? false}
            onChange={(e) => setForm({ ...form, saveAsTask: e.target.checked })}
            className="h-4 w-4 rounded border-border"
          />
          タスクとしても保存する
        </label>
      )}

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="flex flex-wrap justify-end gap-sm border-t border-border pt-lg">
        <Button type="button" variant="outline" onClick={onCancel}>
          キャンセル
        </Button>
        <Button type="submit" loading={loading} disabled={!connected}>
          {event ? '更新する' : '作成する'}
        </Button>
      </div>
    </form>
  )
}
