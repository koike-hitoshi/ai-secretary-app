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

type CookieStore = Awaited<ReturnType<typeof cookies>>

function createServerClientWithCookieStore(cookieStore: CookieStore) {
  const { url, key } = getSupabaseEnv()

  return createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options)
        })
      },
    },
  })
}

/**
 * Route Handler 用 Supabase クライアント（コールバック等）。
 * PKCE verifier は request.cookies から読み、session cookie は response に書き込む。
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

/**
 * OAuth 開始用。cookies() 経由で PKCE verifier を Route Handler レスポンスに載せる。
 * NextResponse.next() は Route Handler では使わない（本番で 500 の原因になる）。
 */
export async function createOAuthStartClient() {
  const cookieStore = await cookies()
  return createServerClientWithCookieStore(cookieStore)
}

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClientWithCookieStore(cookieStore)
}
