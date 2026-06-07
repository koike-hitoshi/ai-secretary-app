import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

import type { Database } from '@/types/database'

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

  const cookieStore = await cookies()
  const supabaseResponse = NextResponse.redirect(
    `${origin}${redirect.startsWith('/') ? redirect : '/dashboard'}`,
  )

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    },
  )

  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    const loginUrl = new URL('/login', origin)
    loginUrl.searchParams.set('error', 'exchange_failed')
    loginUrl.searchParams.set('error_description', error.message)
    return NextResponse.redirect(loginUrl)
  }

  return supabaseResponse
}
