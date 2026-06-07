import { NextResponse, type NextRequest } from 'next/server'

import { fetchCalendarItems } from '@/lib/calendar/calendarSync'
import { createGoogleEvent } from '@/lib/calendar/googleCalendar'
import { getValidAccessToken } from '@/lib/calendar/tokens'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUserOrThrow } from '@/lib/supabase/users'
import type { CalendarEventInput } from '@/types/calendar'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const user = await getCurrentUserOrThrow(supabase)
    const { searchParams } = new URL(request.url)
    const timeMin = searchParams.get('timeMin')
    const timeMax = searchParams.get('timeMax')

    if (!timeMin || !timeMax) {
      return NextResponse.json(
        { error: 'timeMin と timeMax が必要です' },
        { status: 400 },
      )
    }

    const accessToken = await getValidAccessToken(supabase, user.id)
    const { items, syncResult } = await fetchCalendarItems(
      supabase,
      user.id,
      accessToken,
      timeMin,
      timeMax,
    )

    return NextResponse.json({ items, syncResult, connected: Boolean(accessToken) })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '取得に失敗しました' },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const user = await getCurrentUserOrThrow(supabase)
    const accessToken = await getValidAccessToken(supabase, user.id)

    if (!accessToken) {
      return NextResponse.json({ error: 'Googleカレンダーが未連携です' }, { status: 401 })
    }

    const input = (await request.json()) as CalendarEventInput
    const event = await createGoogleEvent(accessToken, input)
    return NextResponse.json({ event }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '作成に失敗しました' },
      { status: 500 },
    )
  }
}
