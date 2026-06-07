import { NextResponse, type NextRequest } from 'next/server'

import { updateSession } from '@/lib/supabase/middleware'

const PROTECTED_PREFIX = '/dashboard'
const AUTH_ROUTES = ['/login']

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

export async function middleware(request: NextRequest) {
  const { supabase, supabaseResponse } = updateSession(request)
  const pathname = request.nextUrl.pathname

  const {
    data: { user },
  } = await supabase.auth.getUser()

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
