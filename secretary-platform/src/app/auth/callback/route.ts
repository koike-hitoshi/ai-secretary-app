import { NextResponse, type NextRequest } from 'next/server'

import { createRouteHandlerClient } from '@/lib/supabase/server'

/** 旧コールバック URL 互換（新規は /api/auth/google/callback） */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const redirect = requestUrl.searchParams.get('redirect') ?? '/dashboard'
  const origin = requestUrl.origin

  const oauthError = requestUrl.searchParams.get('error')
  const oauthDescription = requestUrl.searchParams.get('error_description')

  if (oauthError) {
    const loginUrl = new URL('/login', origin)
    loginUrl.searchParams.set('error', oauthError)
    if (oauthDescription) {
      loginUrl.searchParams.set('error_description', oauthDescription)
    }
    return NextResponse.redirect(loginUrl)
  }

  if (!code) {
    const fallback = new URL('/login', origin)
    fallback.searchParams.set('error', 'auth_callback_error')
    return NextResponse.redirect(fallback)
  }

  const supabaseResponse = NextResponse.redirect(
    `${origin}${redirect.startsWith('/') ? redirect : '/dashboard'}`,
  )

  const supabase = createRouteHandlerClient(request, supabaseResponse)
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    const loginUrl = new URL('/login', origin)
    loginUrl.searchParams.set('error', 'exchange_failed')
    loginUrl.searchParams.set('error_description', error.message)
    return NextResponse.redirect(loginUrl)
  }

  return supabaseResponse
}
