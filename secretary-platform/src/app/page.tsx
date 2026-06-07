import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/supabase/users'

export default async function RootPage() {
  const supabase = await createClient()
  const user = await getCurrentUser(supabase)

  redirect(user ? '/dashboard' : '/login')
}
