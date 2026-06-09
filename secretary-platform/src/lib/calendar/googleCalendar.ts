import {
  getGoogleOAuthConfig,
  GOOGLE_CALENDAR_API_BASE,
  GOOGLE_CALENDAR_SCOPE,
  GOOGLE_OAUTH_AUTH_URL,
  GOOGLE_OAUTH_TOKEN_URL,
} from '@/lib/calendar/config'
import type { CalendarEvent, CalendarEventInput } from '@/types/calendar'

type GoogleTokenResponse = {
  access_token: string
  refresh_token?: string
  expires_in: number
  error?: string
  error_description?: string
}

type GoogleEventItem = {
  id: string
  summary?: string
  description?: string
  location?: string
  htmlLink?: string
  start?: { dateTime?: string; date?: string }
  end?: { dateTime?: string; date?: string }
}

type GoogleEventsResponse = {
  items?: GoogleEventItem[]
  error?: { message?: string }
}

const TIMEZONE = 'Asia/Tokyo'

export function buildGoogleAuthUrl(state: string, origin?: string): string {
  const { clientId, redirectUri } = getGoogleOAuthConfig(origin)

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: GOOGLE_CALENDAR_SCOPE,
    access_type: 'offline',
    prompt: 'consent',
    state,
  })

  return `${GOOGLE_OAUTH_AUTH_URL}?${params.toString()}`
}

export async function exchangeCodeForTokens(
  code: string,
  origin?: string,
): Promise<{
  accessToken: string
  refreshToken: string | null
  expiresIn: number
}> {
  const { clientId, clientSecret, redirectUri } = getGoogleOAuthConfig(origin)

  const response = await fetch(GOOGLE_OAUTH_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  })

  const data = (await response.json()) as GoogleTokenResponse

  if (!response.ok || !data.access_token) {
    throw new Error(
      data.error_description ?? data.error ?? 'Google 認証に失敗しました',
    )
  }

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? null,
    expiresIn: data.expires_in,
  }
}

function mapGoogleEvent(item: GoogleEventItem): CalendarEvent {
  const allDay = Boolean(item.start?.date && !item.start?.dateTime)
  const start = item.start?.dateTime ?? item.start?.date ?? ''
  const end = item.end?.dateTime ?? item.end?.date ?? start

  return {
    id: item.id,
    title: item.summary ?? '（無題）',
    description: item.description,
    location: item.location,
    start,
    end,
    allDay,
    htmlLink: item.htmlLink,
    source: 'google',
  }
}

function toGoogleEventBody(input: CalendarEventInput) {
  if (input.allDay) {
    const startDate = input.start.slice(0, 10)
    const endDate = input.end.slice(0, 10)
    return {
      summary: input.title,
      description: input.description,
      location: input.location,
      start: { date: startDate, timeZone: TIMEZONE },
      end: { date: endDate, timeZone: TIMEZONE },
    }
  }

  return {
    summary: input.title,
    description: input.description,
    location: input.location,
    start: { dateTime: input.start, timeZone: TIMEZONE },
    end: { dateTime: input.end, timeZone: TIMEZONE },
  }
}

export async function listGoogleEvents(
  accessToken: string,
  timeMin: string,
  timeMax: string,
): Promise<CalendarEvent[]> {
  const params = new URLSearchParams({
    timeMin,
    timeMax,
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '250',
  })

  const response = await fetch(
    `${GOOGLE_CALENDAR_API_BASE}/calendars/primary/events?${params.toString()}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: 'no-store',
    },
  )

  const data = (await response.json()) as GoogleEventsResponse

  if (!response.ok) {
    throw new Error(data.error?.message ?? 'イベントの取得に失敗しました')
  }

  return (data.items ?? []).map(mapGoogleEvent)
}

export async function createGoogleEvent(
  accessToken: string,
  input: CalendarEventInput,
): Promise<CalendarEvent> {
  const response = await fetch(
    `${GOOGLE_CALENDAR_API_BASE}/calendars/primary/events`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(toGoogleEventBody(input)),
    },
  )

  const data = (await response.json()) as GoogleEventItem & {
    error?: { message?: string }
  }

  if (!response.ok) {
    throw new Error(data.error?.message ?? 'イベントの作成に失敗しました')
  }

  return mapGoogleEvent(data)
}

export async function updateGoogleEvent(
  accessToken: string,
  eventId: string,
  input: Partial<CalendarEventInput>,
): Promise<CalendarEvent> {
  const body: Record<string, unknown> = {}

  if (input.title !== undefined) body.summary = input.title
  if (input.description !== undefined) body.description = input.description
  if (input.location !== undefined) body.location = input.location

  if (input.start !== undefined && input.end !== undefined) {
    Object.assign(body, toGoogleEventBody(input as CalendarEventInput))
  }

  const response = await fetch(
    `${GOOGLE_CALENDAR_API_BASE}/calendars/primary/events/${encodeURIComponent(eventId)}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    },
  )

  const data = (await response.json()) as GoogleEventItem & {
    error?: { message?: string }
  }

  if (!response.ok) {
    throw new Error(data.error?.message ?? 'イベントの更新に失敗しました')
  }

  return mapGoogleEvent(data)
}

export async function deleteGoogleEvent(
  accessToken: string,
  eventId: string,
): Promise<void> {
  const response = await fetch(
    `${GOOGLE_CALENDAR_API_BASE}/calendars/primary/events/${encodeURIComponent(eventId)}`,
    {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  )

  if (!response.ok && response.status !== 404) {
    const data = (await response.json()) as { error?: { message?: string } }
    throw new Error(data.error?.message ?? 'イベントの削除に失敗しました')
  }
}
