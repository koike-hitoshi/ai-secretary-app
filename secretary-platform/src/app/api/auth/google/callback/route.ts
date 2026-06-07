import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

import { CALENDAR_OAUTH_STATE_COOKIE } from '@/lib/calendar/config'
import { exchangeCodeForTokens } from '@/lib/calendar/googleCalendar'
import { saveCalendarTokens } from '@/lib/calendar/tokens'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/supabase/users'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const state = requestUrl.searchParams.get('state')
  const error = requestUrl.searchParams.get('error')
  const calendarUrl = new URL('/dashboard/calendar', requestUrl.origin)

  if (error) {
    calendarUrl.searchParams.set('error', error)
    return NextResponse.redirect(calendarUrl)
  }

  const cookieStore = await cookies()
  const savedState = cookieStore.get(CALENDAR_OAUTH_STATE_COOKIE)?.value
  cookieStore.delete(CALENDAR_OAUTH_STATE_COOKIE)

  if (!code || !state || !savedState || state !== savedState) {
    calendarUrl.searchParams.set('error', 'invalid_oauth_state')
    return NextResponse.redirect(calendarUrl)
  }

  const supabase = await createClient()
  const user = await getCurrentUser(supabase)

  if (!user) {
    const loginUrl = new URL('/login', requestUrl.origin)
    loginUrl.searchParams.set('redirect', '/dashboard/calendar')
    return NextResponse.redirect(loginUrl)
  }

  try {
    const tokens = await exchangeCodeForTokens(code)
    await saveCalendarTokens(supabase, user.id, tokens)
    calendarUrl.searchParams.set('connected', '1')
    return NextResponse.redirect(calendarUrl)
  } catch (err) {
    calendarUrl.searchParams.set(
      'error',
      err instanceof Error ? err.message : 'oauth_failed',
    )
    return NextResponse.redirect(calendarUrl)
  }
}
