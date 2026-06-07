'use client'

import { useCalendarContext } from '@/contexts/CalendarContext'

export function useCalendarSync() {
  const {
    connected,
    lastSyncAt,
    isSyncing,
    connect,
    sync,
    disconnect,
  } = useCalendarContext()

  return {
    connected,
    lastSyncAt,
    isSyncing,
    connect,
    sync,
    disconnect,
  }
}
