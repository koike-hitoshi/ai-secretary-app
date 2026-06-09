import { NextResponse, type NextRequest } from 'next/server'
import crypto from 'node:crypto'

import { buildGoogleAuthUrl } from '@/lib/calendar/googleCalendar'
import { CALENDAR_OAUTH_STATE_COOKIE } from '@/lib/calendar/config'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/supabase/users'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const user = await getCurrentUser(supabase)

  if (!user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', '/dashboard/calendar')
    return NextResponse.redirect(loginUrl)
  }

  const origin = new URL(request.url).origin
  const state = crypto.randomBytes(24).toString('hex')
  const response = NextResponse.redirect(buildGoogleAuthUrl(state, origin))

  response.cookies.set(CALENDAR_OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 600,
  })

  return response
}
