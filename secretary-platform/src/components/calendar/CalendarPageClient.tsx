'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'

import { CalendarHeader } from '@/components/calendar/CalendarHeader'
import { CalendarSync } from '@/components/calendar/CalendarSync'
import { CalendarView } from '@/components/calendar/CalendarView'
import { EventForm } from '@/components/calendar/EventForm'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import {
  CalendarProvider,
  isCalendarEvent,
  useCalendarContext,
} from '@/contexts/CalendarContext'
import type {
  CalendarConnectionStatus,
  CalendarEvent,
  CalendarItem,
} from '@/types/calendar'

type CalendarPageClientProps = {
  initialStatus: CalendarConnectionStatus
  initialItems: CalendarItem[]
  initialDateIso: string
  initialError?: string | null
}

function CalendarPageContent() {
  const searchParams = useSearchParams()
  const {
    connected,
    error,
    clearError,
    createEvent,
    updateEvent,
    deleteEvent,
  } = useCalendarContext()

  const [modalOpen, setModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [defaultDate, setDefaultDate] = useState<string | undefined>()
  const [dismissedBanner, setDismissedBanner] = useState(false)

  const connectedParam = searchParams.get('connected')
  const oauthError = searchParams.get('error')

  const banner = dismissedBanner
    ? null
    : connectedParam === '1'
      ? 'Googleカレンダーとの連携が完了しました'
      : oauthError
        ? `連携エラー: ${oauthError}`
        : null

  const openCreateModal = (dateKey?: string) => {
    setSelectedEvent(null)
    setDefaultDate(dateKey)
    setModalOpen(true)
  }

  const openEditModal = (item: CalendarItem) => {
    if (!isCalendarEvent(item)) return
    setSelectedEvent(item)
    setDefaultDate(undefined)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setSelectedEvent(null)
    setDefaultDate(undefined)
  }

  const handleSubmit = async (
    input: Parameters<typeof createEvent>[0],
  ) => {
    if (selectedEvent) {
      await updateEvent(selectedEvent.id, input)
    } else {
      await createEvent(input)
    }
    closeModal()
  }

  const handleDelete = async () => {
    if (!selectedEvent) return
    if (!window.confirm('この予定を削除しますか？')) return
    await deleteEvent(selectedEvent.id)
    closeModal()
  }

  return (
    <div className="flex flex-col gap-lg px-xl py-lg">
      <div className="flex flex-wrap items-center justify-between gap-sm">
        <p className="text-sm text-muted-foreground">
          Googleカレンダーの予定とタスク期限を一つのビューで確認できます。
        </p>
        <Button onClick={() => openCreateModal()} disabled={!connected}>
          予定を追加
        </Button>
      </div>

      {banner && (
        <Alert type="success" dismissible onDismiss={() => setDismissedBanner(true)}>
          {banner}
        </Alert>
      )}

      {error && (
        <Alert type="error" title="カレンダー連携エラー" dismissible onDismiss={clearError}>
          {error}
          {(error.includes('GOOGLE_CLIENT_ID') ||
            error.includes('google_calendar_tokens') ||
            error.includes('PGRST205')) && (
            <ul className="mt-sm list-disc space-y-xs pl-md text-sm">
              <li>
                Vercel の環境変数に <code>GOOGLE_CLIENT_ID</code> と{' '}
                <code>GOOGLE_CLIENT_SECRET</code> を設定してください
              </li>
              <li>
                <code>NEXT_PUBLIC_APP_URL</code> を本番 URL（例:{' '}
                https://ai-secretary-app-pearl.vercel.app）に合わせてください
              </li>
              <li>
                Google Cloud Console の Redirect URI に本番の{' '}
                <code>/api/auth/google/callback</code> を追加してください
              </li>
              <li>
                Supabase で <code>google_calendar_tokens</code> テーブルが未作成の場合は{' '}
                <code>npm run db:migrate</code> を実行してください
              </li>
            </ul>
          )}
        </Alert>
      )}

      <CalendarSync />
      <CalendarHeader />
      <CalendarView
        onSelectItem={openEditModal}
        onSelectDate={(dateKey) => openCreateModal(dateKey)}
      />

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={selectedEvent ? '予定を編集' : '予定を追加'}
        description={
          selectedEvent
            ? 'Googleカレンダーの予定を更新します'
            : '新しい予定をGoogleカレンダーに作成します'
        }
      >
        <EventForm
          key={selectedEvent?.id ?? defaultDate ?? 'new'}
          event={selectedEvent}
          defaultDate={defaultDate}
          connected={connected}
          onSubmit={handleSubmit}
          onCancel={closeModal}
        />
        {selectedEvent && (
          <div className="mt-md flex justify-start border-t border-border pt-md">
            <Button variant="destructive" onClick={() => void handleDelete()}>
              予定を削除
            </Button>
          </div>
        )}
      </Modal>
    </div>
  )
}

export function CalendarPageClient(props: CalendarPageClientProps) {
  return (
    <CalendarProvider {...props}>
      <CalendarPageContent />
    </CalendarProvider>
  )
}
