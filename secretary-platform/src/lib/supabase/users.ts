import type { SupabaseClient, User } from '@supabase/supabase-js'

import { throwOnError } from '@/lib/supabase/errors'
import type { Database, Json } from '@/types/database'

export type AppUser = {
  id: string
  email: string
  name: string | null
  avatarUrl: string | null
}

type Supabase = SupabaseClient<Database>

export function mapUser(user: User): AppUser {
  return {
    id: user.id,
    email: user.email ?? '',
    name:
      (user.user_metadata?.full_name as string | undefined) ??
      (user.user_metadata?.name as string | undefined) ??
      null,
    avatarUrl:
      (user.user_metadata?.avatar_url as string | undefined) ??
      (user.user_metadata?.picture as string | undefined) ??
      null,
  }
}

export async function getCurrentUser(supabase: Supabase): Promise<AppUser | null> {
  const { data, error } = await supabase.auth.getUser()

  if (error || !data.user) {
    return null
  }

  return mapUser(data.user)
}

export async function getCurrentUserOrThrow(supabase: Supabase): Promise<AppUser> {
  const user = await getCurrentUser(supabase)

  if (!user) {
    throw new Error('Not authenticated')
  }

  return user
}

export async function getSession(supabase: Supabase) {
  const { data, error } = await supabase.auth.getSession()

  if (error) {
    throw error
  }

  return data.session
}

export async function signOut(supabase: Supabase) {
  const { error } = await supabase.auth.signOut()

  if (error) {
    throw error
  }
}

export async function upsertWritingStyleProfile(
  supabase: Supabase,
  userId: string,
  input: {
    toneDescription?: string | null
    sampleExcerpts?: Json
    analyzedAt?: string | null
  },
) {
  return throwOnError(
    await supabase
      .from('writing_style_profiles')
      .upsert(
        {
          user_id: userId,
          tone_description: input.toneDescription ?? null,
          sample_excerpts: input.sampleExcerpts ?? [],
          analyzed_at: input.analyzedAt ?? null,
        },
        { onConflict: 'user_id' },
      )
      .select()
      .single(),
  )
}

export async function getWritingStyleProfile(
  supabase: Supabase,
  userId: string,
) {
  const { data, error } = await supabase
    .from('writing_style_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    throwOnError({ data: null, error })
  }

  return data
}
