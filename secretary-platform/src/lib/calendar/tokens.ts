import type { SupabaseClient } from '@supabase/supabase-js'

import {
  getGoogleOAuthConfig,
  GOOGLE_OAUTH_TOKEN_URL,
} from '@/lib/calendar/config'
import {
  isMissingRelationError,
  throwIfError,
  throwOnError,
} from '@/lib/supabase/errors'
import type { Database } from '@/types/database'

type Supabase = SupabaseClient<Database>

export type StoredCalendarTokens = {
  accessToken: string
  refreshToken: string | null
  expiresAt: string | null
  updatedAt: string
}

export async function getCalendarTokens(
  supabase: Supabase,
  userId: string,
): Promise<StoredCalendarTokens | null> {
  const { data, error } = await supabase
    .from('google_calendar_tokens')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    if (isMissingRelationError(error)) {
      return null
    }
    throwOnError({ data: null, error })
  }

  if (!data) return null

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: data.expires_at,
    updatedAt: data.updated_at,
  }
}

export async function saveCalendarTokens(
  supabase: Supabase,
  userId: string,
  tokens: {
    accessToken: string
    refreshToken?: string | null
    expiresIn?: number
  },
): Promise<void> {
  const expiresAt =
    tokens.expiresIn != null
      ? new Date(Date.now() + tokens.expiresIn * 1000).toISOString()
      : null

  const existing = await getCalendarTokens(supabase, userId)

  throwIfError(
    await supabase.from('google_calendar_tokens').upsert({
      user_id: userId,
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken ?? existing?.refreshToken ?? null,
      expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    }),
  )
}

export async function deleteCalendarTokens(
  supabase: Supabase,
  userId: string,
): Promise<void> {
  throwIfError(
    await supabase
      .from('google_calendar_tokens')
      .delete()
      .eq('user_id', userId),
  )
}

async function refreshAccessToken(refreshToken: string): Promise<{
  accessToken: string
  expiresIn: number
}> {
  const { clientId, clientSecret } = getGoogleOAuthConfig()

  const response = await fetch(GOOGLE_OAUTH_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  })

  const data = (await response.json()) as {
    access_token?: string
    expires_in?: number
    error?: string
    error_description?: string
  }

  if (!response.ok || !data.access_token) {
    throw new Error(
      data.error_description ?? data.error ?? 'トークンの更新に失敗しました',
    )
  }

  return {
    accessToken: data.access_token,
    expiresIn: data.expires_in ?? 3600,
  }
}

export async function getValidAccessToken(
  supabase: Supabase,
  userId: string,
): Promise<string | null> {
  try {
    const tokens = await getCalendarTokens(supabase, userId)
    if (!tokens) return null

    const isExpired =
      tokens.expiresAt != null &&
      new Date(tokens.expiresAt).getTime() <= Date.now() + 60_000

    if (!isExpired) {
      return tokens.accessToken
    }

    if (!tokens.refreshToken) {
      await deleteCalendarTokens(supabase, userId)
      return null
    }

    const refreshed = await refreshAccessToken(tokens.refreshToken)
    await saveCalendarTokens(supabase, userId, {
      accessToken: refreshed.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: refreshed.expiresIn,
    })

    return refreshed.accessToken
  } catch {
    try {
      await deleteCalendarTokens(supabase, userId)
    } catch {
      // ignore cleanup failures
    }
    return null
  }
}
