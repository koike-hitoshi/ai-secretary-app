import { NextResponse, type NextRequest } from 'next/server'

import {
  deleteGoogleEvent,
  updateGoogleEvent,
} from '@/lib/calendar/googleCalendar'
import { getValidAccessToken } from '@/lib/calendar/tokens'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUserOrThrow } from '@/lib/supabase/users'
import type { CalendarEventInput } from '@/types/calendar'

type RouteContext = { params: Promise<{ id: string }> }

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const supabase = await createClient()
    const user = await getCurrentUserOrThrow(supabase)
    const accessToken = await getValidAccessToken(supabase, user.id)

    if (!accessToken) {
      return NextResponse.json({ error: 'Googleカレンダーが未連携です' }, { status: 401 })
    }

    const input = (await request.json()) as Partial<CalendarEventInput>
    const event = await updateGoogleEvent(accessToken, id, input)
    return NextResponse.json({ event })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '更新に失敗しました' },
      { status: 500 },
    )
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const supabase = await createClient()
    const user = await getCurrentUserOrThrow(supabase)
    const accessToken = await getValidAccessToken(supabase, user.id)

    if (!accessToken) {
      return NextResponse.json({ error: 'Googleカレンダーが未連携です' }, { status: 401 })
    }

    await deleteGoogleEvent(accessToken, id)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '削除に失敗しました' },
      { status: 500 },
    )
  }
}
