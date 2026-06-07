import { NextResponse, type NextRequest } from 'next/server'

import { CALENDAR_OAUTH_STATE_COOKIE } from '@/lib/calendar/config'
import { exchangeCodeForTokens } from '@/lib/calendar/googleCalendar'
import { saveCalendarTokens } from '@/lib/calendar/tokens'
import { createRouteHandlerClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/supabase/users'

export const dynamic = 'force-dynamic'

function loginRedirect(origin: string, error: string, description?: string) {
  const loginUrl = new URL('/login', origin)
  loginUrl.searchParams.set('error', error)
  if (description) {
    loginUrl.searchParams.set('error_description', description)
  }
  return NextResponse.redirect(loginUrl)
}

async function handleCalendarCallback(
  request: NextRequest,
  requestUrl: URL,
  code: string,
) {
  const calendarUrl = new URL('/dashboard/calendar', requestUrl.origin)
  const response = NextResponse.redirect(calendarUrl)
  const supabase = createRouteHandlerClient(request, response)
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

  const finalResponse = NextResponse.redirect(calendarUrl)
  response.cookies.getAll().forEach((cookie) => {
    finalResponse.cookies.set(cookie.name, cookie.value)
  })
  finalResponse.cookies.delete(CALENDAR_OAUTH_STATE_COOKIE)
  return finalResponse
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
    return loginRedirect(requestUrl.origin, 'exchange_failed', error.message)
  }

  return response
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const state = requestUrl.searchParams.get('state')
  const error = requestUrl.searchParams.get('error')
  const oauthDescription = requestUrl.searchParams.get('error_description')

  try {
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
      return loginRedirect(
        requestUrl.origin,
        error,
        oauthDescription ?? undefined,
      )
    }

    if (code) {
      return handleSupabaseCallback(request, requestUrl, code)
    }

    return loginRedirect(requestUrl.origin, 'auth_callback_error')
  } catch (err) {
    return loginRedirect(
      requestUrl.origin,
      'exchange_failed',
      err instanceof Error ? err.message : 'auth_callback_failed',
    )
  }
}
