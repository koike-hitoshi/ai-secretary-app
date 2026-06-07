import { createClient } from '@/lib/supabase/client'
import { getCurrentUser } from '@/lib/supabase/users'

export async function signInWithGoogle(redirectTo = '/dashboard') {
  const supabase = createClient()
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    (typeof window !== 'undefined' ? window.location.origin : '')

  const callbackUrl = new URL('/auth/callback', appUrl)
  callbackUrl.searchParams.set('redirect', redirectTo)

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: callbackUrl.toString(),
    },
  })

  if (error) {
    throw error
  }
}

export async function signOut() {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    throw error
  }
}

export async function getSession() {
  const supabase = createClient()
  const { data, error } = await supabase.auth.getSession()

  if (error) {
    throw error
  }

  return data.session
}

export async function getUser() {
  const supabase = createClient()
  return getCurrentUser(supabase)
}
