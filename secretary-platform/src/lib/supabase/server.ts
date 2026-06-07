import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

import type { Database } from '@/types/database'

function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY が未設定です。',
    )
  }

  return { url, key }
}

/**
 * Route Handler 用 Supabase クライアント。
 * PKCE code verifier は request.cookies から読み、session cookie は response のみに書き込む。
 * （request.cookies.set は Route Handler では ReadonlyRequestCookiesError になる）
 */
export function createRouteHandlerClient(
  request: NextRequest,
  response: NextResponse,
) {
  const { url, key } = getSupabaseEnv()

  return createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options)
        })
      },
    },
  })
}

/** setAll で蓄積した cookie を別レスポンスへ引き継ぐ（OAuth 開始 → 外部リダイレクト用） */
export function redirectWithCookieHeaders(
  url: string | URL,
  source: NextResponse,
): NextResponse {
  return NextResponse.redirect(url, { headers: source.headers })
}

/**
 * OAuth 開始用。PKCE code verifier を response の Set-Cookie に保存する。
 */
export function createOAuthStartClient(
  request: NextRequest,
  response: NextResponse,
) {
  const { url, key } = getSupabaseEnv()

  return createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options)
        })
      },
    },
  })
}

export async function createClient() {
  const cookieStore = await cookies()
  const { url, key } = getSupabaseEnv()

  return createServerClient<Database>(url, key, {
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
  })
}
