import { redirect } from 'next/navigation'
import { Suspense } from 'react'

import { CalendarPageClient } from '@/components/calendar/CalendarPageClient'
import { PageHeader } from '@/components/ui/PageHeader'
import { Spinner } from '@/components/ui/Spinner'
import {
  fetchCalendarItemsAction,
  getCalendarStatusAction,
} from '@/lib/calendar/actions'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/supabase/users'

export default async function CalendarPage() {
  const supabase = await createClient()
  const user = await getCurrentUser(supabase)

  if (!user) {
    redirect('/login?redirect=/dashboard/calendar')
  }

  const [status, data] = await Promise.all([
    getCalendarStatusAction(),
    fetchCalendarItemsAction(new Date().toISOString(), 'month'),
  ])

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
          initialStatus={status}
          initialItems={data.items}
          initialDateIso={new Date().toISOString()}
        />
      </Suspense>
    </>
  )
}
