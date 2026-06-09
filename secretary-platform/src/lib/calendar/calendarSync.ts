import { listTasks } from '@/lib/supabase/tasks'
import { taskToCalendarItem } from '@/lib/calendar/utils'
import { listGoogleEvents } from '@/lib/calendar/googleCalendar'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import type { CalendarItem, CalendarSyncResult } from '@/types/calendar'

type Supabase = SupabaseClient<Database>

export async function fetchCalendarItems(
  supabase: Supabase,
  userId: string,
  accessToken: string | null,
  timeMin: string,
  timeMax: string,
): Promise<{ items: CalendarItem[]; syncResult: CalendarSyncResult }> {
  const tasks = await listTasks(supabase, userId)
  const taskItems = tasks
    .map(taskToCalendarItem)
    .filter((item): item is NonNullable<typeof item> => item != null)
    .filter((item) => item.dueDate >= timeMin.slice(0, 10) && item.dueDate <= timeMax.slice(0, 10))

  let events: CalendarItem[] = []

  if (accessToken) {
    try {
      events = await listGoogleEvents(accessToken, timeMin, timeMax)
    } catch {
      events = []
    }
  }

  const syncedAt = new Date().toISOString()

  return {
    items: [...events, ...taskItems],
    syncResult: {
      eventCount: events.length,
      taskCount: taskItems.length,
      syncedAt,
    },
  }
}
