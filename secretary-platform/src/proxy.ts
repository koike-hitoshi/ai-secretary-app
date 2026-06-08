import { NextResponse, type NextRequest } from 'next/server'

import { updateSession } from '@/lib/supabase/middleware'

const PROTECTED_PREFIX = '/dashboard'
const AUTH_ROUTES = ['/login']
const OAUTH_CALLBACK_PATH = '/api/auth/google/callback'
const LEGACY_OAUTH_CALLBACK_PATH = '/auth/callback'

function isOAuthReturn(url: URL): boolean {
  return url.searchParams.has('code') || url.searchParams.has('error')
}

function forwardToOAuthCallback(
  request: NextRequest,
  sessionResponse: NextResponse,
): NextResponse {
  const url = request.nextUrl.clone()
  url.pathname = OAUTH_CALLBACK_PATH
  return redirectWithSessionCookies(url, sessionResponse)
}

function redirectWithSessionCookies(
  url: URL,
  sessionResponse: NextResponse,
): NextResponse {
  const response = NextResponse.redirect(url)
  sessionResponse.cookies.getAll().forEach((cookie) => {
    response.cookies.set(cookie.name, cookie.value)
  })
  return response
}

export async function proxy(request: NextRequest) {
  const { supabase, supabaseResponse } = updateSession(request)
  const pathname = request.nextUrl.pathname

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Supabase が Site URL（/ 等）へ code を付けて戻す場合、コールバックへ転送
  if (
    isOAuthReturn(request.nextUrl) &&
    pathname !== OAUTH_CALLBACK_PATH &&
    pathname !== LEGACY_OAUTH_CALLBACK_PATH
  ) {
    return forwardToOAuthCallback(request, supabaseResponse)
  }

  // ルートは常にログイン or ダッシュボードへ（旧トップの静的キャッシュを回避）
  if (pathname === '/') {
    const target = user ? '/dashboard' : '/login'
    const url = request.nextUrl.clone()
    url.pathname = target
    url.search = ''
    return redirectWithSessionCookies(url, supabaseResponse)
  }

  const isProtected = pathname.startsWith(PROTECTED_PREFIX)
  const isAuthRoute = AUTH_ROUTES.includes(pathname)

  if (!user && isProtected) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('redirect', pathname)
    return redirectWithSessionCookies(loginUrl, supabaseResponse)
  }

  if (user && isAuthRoute) {
    const dashboardUrl = request.nextUrl.clone()
    dashboardUrl.pathname = '/dashboard'
    dashboardUrl.search = ''
    return redirectWithSessionCookies(dashboardUrl, supabaseResponse)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
