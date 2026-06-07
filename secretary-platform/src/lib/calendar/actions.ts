'use server'

import { revalidatePath } from 'next/cache'

import { fetchCalendarItems } from '@/lib/calendar/calendarSync'
import {
  createGoogleEvent,
  deleteGoogleEvent,
  updateGoogleEvent,
} from '@/lib/calendar/googleCalendar'
import {
  deleteCalendarTokens,
  getCalendarTokens,
  getValidAccessToken,
} from '@/lib/calendar/tokens'
import { getRangeForView, toIsoRange } from '@/lib/calendar/utils'
import { createTask } from '@/lib/supabase/tasks'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUserOrThrow } from '@/lib/supabase/users'
import type {
  CalendarConnectionStatus,
  CalendarEventInput,
  CalendarItem,
  CalendarSyncResult,
  CalendarViewMode,
} from '@/types/calendar'

const CALENDAR_PATH = '/dashboard/calendar'

async function getAuthenticatedSupabase() {
  const supabase = await createClient()
  const user = await getCurrentUserOrThrow(supabase)
  return { supabase, userId: user.id }
}

export async function getCalendarStatusAction(): Promise<CalendarConnectionStatus> {
  const { supabase, userId } = await getAuthenticatedSupabase()
  const tokens = await getCalendarTokens(supabase, userId)

  return {
    connected: Boolean(tokens),
    lastSyncAt: tokens?.updatedAt ?? null,
  }
}

export async function fetchCalendarItemsAction(
  currentDateIso: string,
  viewMode: CalendarViewMode,
): Promise<{
  items: CalendarItem[]
  syncResult: CalendarSyncResult | null
  connected: boolean
}> {
  const { supabase, userId } = await getAuthenticatedSupabase()
  const currentDate = new Date(currentDateIso)
  const { start, end } = getRangeForView(currentDate, viewMode)
  const { timeMin, timeMax } = toIsoRange(start, end)
  const accessToken = await getValidAccessToken(supabase, userId)
  const tokens = await getCalendarTokens(supabase, userId)

  const { items, syncResult } = await fetchCalendarItems(
    supabase,
    userId,
    accessToken,
    timeMin,
    timeMax,
  )

  return {
    items,
    syncResult: tokens ? syncResult : null,
    connected: Boolean(tokens),
  }
}

export async function createCalendarEventAction(
  input: CalendarEventInput,
): Promise<CalendarItem> {
  const title = input.title.trim()
  if (!title) throw new Error('タイトルを入力してください')

  const { supabase, userId } = await getAuthenticatedSupabase()
  const accessToken = await getValidAccessToken(supabase, userId)

  if (!accessToken) {
    throw new Error('Googleカレンダーが未連携です')
  }

  const event = await createGoogleEvent(accessToken, { ...input, title })

  if (input.saveAsTask) {
    await createTask(supabase, userId, {
      title,
      description: input.description,
      dueDate: input.start.slice(0, 10),
      priority: 'medium',
    })
  }

  revalidatePath(CALENDAR_PATH)
  return event
}

export async function updateCalendarEventAction(
  eventId: string,
  input: Partial<CalendarEventInput>,
): Promise<CalendarItem> {
  const { supabase, userId } = await getAuthenticatedSupabase()
  const accessToken = await getValidAccessToken(supabase, userId)

  if (!accessToken) {
    throw new Error('Googleカレンダーが未連携です')
  }

  const event = await updateGoogleEvent(accessToken, eventId, input)
  revalidatePath(CALENDAR_PATH)
  return event
}

export async function deleteCalendarEventAction(eventId: string): Promise<void> {
  const { supabase, userId } = await getAuthenticatedSupabase()
  const accessToken = await getValidAccessToken(supabase, userId)

  if (!accessToken) {
    throw new Error('Googleカレンダーが未連携です')
  }

  await deleteGoogleEvent(accessToken, eventId)
  revalidatePath(CALENDAR_PATH)
}

export async function syncCalendarAction(
  currentDateIso: string,
  viewMode: CalendarViewMode,
): Promise<CalendarSyncResult> {
  const result = await fetchCalendarItemsAction(currentDateIso, viewMode)
  if (!result.syncResult) {
    throw new Error('Googleカレンダーが未連携です')
  }
  revalidatePath(CALENDAR_PATH)
  return result.syncResult
}

export async function disconnectCalendarAction(): Promise<void> {
  const { supabase, userId } = await getAuthenticatedSupabase()
  await deleteCalendarTokens(supabase, userId)
  revalidatePath(CALENDAR_PATH)
}
