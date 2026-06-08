import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/supabase/users'

export const dynamic = 'force-dynamic'

type RootPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function buildOAuthCallbackPath(
  params: Record<string, string | string[] | undefined>,
): string | null {
  const code = params.code
  const error = params.error
  if (typeof code !== 'string' && typeof error !== 'string') {
    return null
  }

  const callbackParams = new URLSearchParams()
  if (typeof code === 'string') callbackParams.set('code', code)
  if (typeof error === 'string') callbackParams.set('error', error)

  const errorDescription = params.error_description
  if (typeof errorDescription === 'string') {
    callbackParams.set('error_description', errorDescription)
  }

  const redirectTo = params.redirect
  if (typeof redirectTo === 'string') {
    callbackParams.set('redirect', redirectTo)
  }

  return `/api/auth/google/callback?${callbackParams.toString()}`
}

export default async function RootPage({ searchParams }: RootPageProps) {
  const params = await searchParams
  const oauthCallbackPath = buildOAuthCallbackPath(params)
  if (oauthCallbackPath) {
    redirect(oauthCallbackPath)
  }

  const supabase = await createClient()
  const user = await getCurrentUser(supabase)

  redirect(user ? '/dashboard' : '/login')
}
