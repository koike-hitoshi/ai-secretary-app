import { NextResponse, type NextRequest } from 'next/server'

import { CALENDAR_OAUTH_STATE_COOKIE } from '@/lib/calendar/config'
import { exchangeCodeForTokens } from '@/lib/calendar/googleCalendar'
import { saveCalendarTokens } from '@/lib/calendar/tokens'
import { createRouteHandlerClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/supabase/users'

async function handleCalendarCallback(
  request: NextRequest,
  requestUrl: URL,
  code: string,
) {
  const calendarUrl = new URL('/dashboard/calendar', requestUrl.origin)
  const cookieResponse = NextResponse.next({ request })
  const supabase = createRouteHandlerClient(request, cookieResponse)
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
  } catch (err) {
    calendarUrl.searchParams.set(
      'error',
      err instanceof Error ? err.message : 'oauth_failed',
    )
  }

  const response = NextResponse.redirect(calendarUrl)
  cookieResponse.cookies.getAll().forEach((cookie) => {
    response.cookies.set(cookie.name, cookie.value)
  })
  response.cookies.delete(CALENDAR_OAUTH_STATE_COOKIE)
  return response
}

async function handleSupabaseCallback(
  request: NextRequest,
  requestUrl: URL,
  code: string,
) {
  const redirect = requestUrl.searchParams.get('redirect') ?? '/dashboard'
  const destination = `${requestUrl.origin}${
    redirect.startsWith('/') ? redirect : '/dashboard'
  }`

  const response = NextResponse.redirect(destination)
  const supabase = createRouteHandlerClient(request, response)
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    const loginUrl = new URL('/login', requestUrl.origin)
    loginUrl.searchParams.set('error', 'exchange_failed')
    loginUrl.searchParams.set('error_description', error.message)
    return NextResponse.redirect(loginUrl)
  }

  return response
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const state = requestUrl.searchParams.get('state')
  const error = requestUrl.searchParams.get('error')
  const oauthDescription = requestUrl.searchParams.get('error_description')

  const savedCalendarState = request.cookies.get(CALENDAR_OAUTH_STATE_COOKIE)?.value
  const isCalendarOAuth =
    Boolean(code && state && savedCalendarState && state === savedCalendarState)

  if (isCalendarOAuth) {
    if (error) {
      const calendarUrl = new URL('/dashboard/calendar', requestUrl.origin)
      calendarUrl.searchParams.set('error', error)
      const response = NextResponse.redirect(calendarUrl)
      response.cookies.delete(CALENDAR_OAUTH_STATE_COOKIE)
      return response
    }

    return handleCalendarCallback(request, requestUrl, code!)
  }

  if (state && savedCalendarState && state !== savedCalendarState) {
    const calendarUrl = new URL('/dashboard/calendar', requestUrl.origin)
    calendarUrl.searchParams.set('error', 'invalid_oauth_state')
    const response = NextResponse.redirect(calendarUrl)
    response.cookies.delete(CALENDAR_OAUTH_STATE_COOKIE)
    return response
  }

  if (error) {
    const loginUrl = new URL('/login', requestUrl.origin)
    loginUrl.searchParams.set('error', error)
    if (oauthDescription) {
      loginUrl.searchParams.set('error_description', oauthDescription)
    }
    return NextResponse.redirect(loginUrl)
  }

  if (code) {
    return handleSupabaseCallback(request, requestUrl, code)
  }

  const loginUrl = new URL('/login', requestUrl.origin)
  loginUrl.searchParams.set('error', 'auth_callback_error')
  return NextResponse.redirect(loginUrl)
}
