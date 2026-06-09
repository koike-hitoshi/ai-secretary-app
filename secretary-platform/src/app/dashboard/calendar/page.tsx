import { redirect } from 'next/navigation'
import { Suspense } from 'react'

import { CalendarPageClient } from '@/components/calendar/CalendarPageClient'
import { PageHeader } from '@/components/ui/PageHeader'
import { Spinner } from '@/components/ui/Spinner'
import {
  fetchCalendarItemsAction,
  getCalendarStatusAction,
} from '@/lib/calendar/actions'
import type { CalendarConnectionStatus } from '@/types/calendar'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/supabase/users'

export default async function CalendarPage() {
  const supabase = await createClient()
  const user = await getCurrentUser(supabase)

  if (!user) {
    redirect('/login?redirect=/dashboard/calendar')
  }

  const initialDateIso = new Date().toISOString()
  let initialStatus: CalendarConnectionStatus = {
    connected: false,
    lastSyncAt: null,
  }
  let initialItems: Awaited<
    ReturnType<typeof fetchCalendarItemsAction>
  >['items'] = []
  let initialError: string | null = null

  try {
    const [status, data] = await Promise.all([
      getCalendarStatusAction(),
      fetchCalendarItemsAction(initialDateIso, 'month'),
    ])
    initialStatus = status
    initialItems = data.items
  } catch (err) {
    initialError =
      err instanceof Error
        ? err.message
        : 'カレンダーの読み込みに失敗しました'
  }

  return (
    <>
      <PageHeader
        title="Googleカレンダー"
        description="Googleカレンダーと連携し、予定の追加・編集・削除とタスク期限の表示ができます。"
      />
      <Suspense
        fallback={
          <div className="flex justify-center py-2xl">
            <Spinner size="lg" label="カレンダーを読み込み中" />
          </div>
        }
      >
        <CalendarPageClient
          initialStatus={initialStatus}
          initialItems={initialItems}
          initialDateIso={initialDateIso}
          initialError={initialError}
        />
      </Suspense>
    </>
  )
}
