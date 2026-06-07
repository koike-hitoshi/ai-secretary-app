import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

import type { Database } from '@/types/database'

/**
 * Route Handler 用 Supabase クライアント。
 * PKCE code verifier は request.cookies から読み、session cookie は response に書き込む。
 */
export function createRouteHandlerClient(
  request: NextRequest,
  response: NextResponse,
) {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    },
  )
}

/** setAll で蓄積した cookie を別レスポンスへ引き継ぐ（OAuth 開始 → 外部リダイレクト用） */
export function redirectWithCookieHeaders(
  url: string | URL,
  source: NextResponse,
): NextResponse {
  return NextResponse.redirect(url, { headers: source.headers })
}

/**
 * OAuth 開始用。signInWithOAuth の setAll ごとに response を再生成する
 * （middleware と同じパターン。PKCE verifier を確実に Set-Cookie する）。
 */
export function createOAuthStartClient(
  request: NextRequest,
  onResponse: (response: NextResponse) => void,
) {
  let response = NextResponse.next({ request })
  onResponse(response)

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
          onResponse(response)
        },
      },
    },
  )
}

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // Server Components cannot set cookies; middleware handles refresh.
          }
        },
      },
    },
  )
}
