import { NextResponse, type NextRequest } from 'next/server'

import { fetchCalendarItems } from '@/lib/calendar/calendarSync'
import { getValidAccessToken } from '@/lib/calendar/tokens'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUserOrThrow } from '@/lib/supabase/users'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const user = await getCurrentUserOrThrow(supabase)
    const body = (await request.json()) as { timeMin?: string; timeMax?: string }
    const { timeMin, timeMax } = body

    if (!timeMin || !timeMax) {
      return NextResponse.json(
        { error: 'timeMin と timeMax が必要です' },
        { status: 400 },
      )
    }

    const accessToken = await getValidAccessToken(supabase, user.id)
    if (!accessToken) {
      return NextResponse.json({ error: 'Googleカレンダーが未連携です' }, { status: 401 })
    }

    const { items, syncResult } = await fetchCalendarItems(
      supabase,
      user.id,
      accessToken,
      timeMin,
      timeMax,
    )

    return NextResponse.json({ items, syncResult })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '同期に失敗しました' },
      { status: 500 },
    )
  }
}
