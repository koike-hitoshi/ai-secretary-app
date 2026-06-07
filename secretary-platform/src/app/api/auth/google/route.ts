import { NextResponse, type NextRequest } from 'next/server'

import {
  createOAuthStartClient,
  redirectWithCookieHeaders,
} from '@/lib/supabase/server'

/**
 * Google ログイン開始（サーバー側 OAuth）。
 * PKCE code verifier を Set-Cookie で保存してから Google へリダイレクトする。
 */
export async function GET(request: NextRequest) {
  const redirectTo = request.nextUrl.searchParams.get('redirect') ?? '/dashboard'
  const callbackUrl = new URL('/api/auth/google/callback', request.nextUrl.origin)
  callbackUrl.searchParams.set('redirect', redirectTo)

  try {
    const cookieResponse = NextResponse.next({ request })
    const supabase = createOAuthStartClient(request, cookieResponse)

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: callbackUrl.toString(),
        skipBrowserRedirect: true,
      },
    })

    if (error || !data.url) {
      const loginUrl = new URL('/login', request.nextUrl.origin)
      loginUrl.searchParams.set('error', 'oauth_start_failed')
      if (error?.message) {
        loginUrl.searchParams.set('error_description', error.message)
      }
      return NextResponse.redirect(loginUrl)
    }

    return redirectWithCookieHeaders(data.url, cookieResponse)
  } catch (err) {
    const loginUrl = new URL('/login', request.nextUrl.origin)
    loginUrl.searchParams.set('error', 'oauth_start_failed')
    loginUrl.searchParams.set(
      'error_description',
      err instanceof Error ? err.message : 'OAuth start failed',
    )
    return NextResponse.redirect(loginUrl)
  }
}
