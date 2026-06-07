import { createClient } from '@/lib/supabase/server'
import { getCurrentUser, getSession } from '@/lib/supabase/users'

export async function getServerUser() {
  const supabase = await createClient()
  return getCurrentUser(supabase)
}

export async function getServerSession() {
  const supabase = await createClient()
  return getSession(supabase)
}
