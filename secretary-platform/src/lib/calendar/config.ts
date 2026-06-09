export const GOOGLE_CALENDAR_SCOPE =
  'https://www.googleapis.com/auth/calendar.events'

export const GOOGLE_OAUTH_AUTH_URL =
  'https://accounts.google.com/o/oauth2/v2/auth'

export const GOOGLE_OAUTH_TOKEN_URL = 'https://oauth2.googleapis.com/token'

export const GOOGLE_CALENDAR_API_BASE =
  'https://www.googleapis.com/calendar/v3'

export const CALENDAR_OAUTH_STATE_COOKIE = 'calendar_oauth_state'

export function resolveGoogleRedirectUri(origin?: string): string {
  return (
    process.env.GOOGLE_REDIRECT_URI ??
    `${origin ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/auth/google/callback`
  )
}

export function getGoogleOAuthConfig(origin?: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const redirectUri = resolveGoogleRedirectUri(origin)

  if (!clientId || !clientSecret) {
    throw new Error(
      'GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET が未設定です。環境変数を確認してください。',
    )
  }

  return { clientId, clientSecret, redirectUri }
}
