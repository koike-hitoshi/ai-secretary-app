import { createClient } from '@/lib/supabase/client'
import { getCurrentUser } from '@/lib/supabase/users'

export async function signInWithGoogle(redirectTo = '/dashboard') {
  const params = new URLSearchParams({ redirect: redirectTo })
  window.location.assign(`/api/auth/google?${params.toString()}`)
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
