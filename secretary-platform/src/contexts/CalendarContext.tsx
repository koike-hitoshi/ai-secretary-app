'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

import {
  createCalendarEventAction,
  deleteCalendarEventAction,
  disconnectCalendarAction,
  fetchCalendarItemsAction,
  syncCalendarAction,
  updateCalendarEventAction,
} from '@/lib/calendar/actions'
import { groupItemsByDate } from '@/lib/calendar/utils'
import type {
  CalendarConnectionStatus,
  CalendarEvent,
  CalendarEventInput,
  CalendarItem,
  CalendarSyncResult,
  CalendarViewMode,
} from '@/types/calendar'

type CalendarContextValue = {
  currentDate: Date
  viewMode: CalendarViewMode
  items: CalendarItem[]
  itemsByDate: Record<string, CalendarItem[]>
  connected: boolean
  lastSyncAt: string | null
  isLoading: boolean
  isSyncing: boolean
  error: string | null
  clearError: () => void
  setCurrentDate: (date: Date) => void
  setViewMode: (mode: CalendarViewMode) => void
  goToToday: () => void
  goToPrevious: () => void
  goToNext: () => void
  refresh: () => Promise<void>
  sync: () => Promise<CalendarSyncResult | null>
  connect: () => void
  disconnect: () => Promise<void>
  createEvent: (input: CalendarEventInput) => Promise<CalendarItem>
  updateEvent: (
    eventId: string,
    input: Partial<CalendarEventInput>,
  ) => Promise<CalendarItem>
  deleteEvent: (eventId: string) => Promise<void>
}

const CalendarContext = createContext<CalendarContextValue | null>(null)

type CalendarProviderProps = {
  initialStatus: CalendarConnectionStatus
  initialItems: CalendarItem[]
  initialDateIso: string
  children: ReactNode
}

function shiftDate(date: Date, viewMode: CalendarViewMode, direction: -1 | 1): Date {
  const next = new Date(date)
  if (viewMode === 'day') {
    next.setDate(next.getDate() + direction)
    return next
  }
  if (viewMode === 'week') {
    next.setDate(next.getDate() + direction * 7)
    return next
  }
  return new Date(next.getFullYear(), next.getMonth() + direction, 1)
}

export function CalendarProvider({
  initialStatus,
  initialItems,
  initialDateIso,
  children,
}: CalendarProviderProps) {
  const [currentDate, setCurrentDate] = useState(() => new Date(initialDateIso))
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month')
  const [items, setItems] = useState(initialItems)
  const [connected, setConnected] = useState(initialStatus.connected)
  const [lastSyncAt, setLastSyncAt] = useState(initialStatus.lastSyncAt)
  const [isLoading, setIsLoading] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const skipInitialRefresh = useRef(true)

  const itemsByDate = useMemo(() => groupItemsByDate(items), [items])

  const clearError = useCallback(() => setError(null), [])

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await fetchCalendarItemsAction(
        currentDate.toISOString(),
        viewMode,
      )
      setItems(result.items)
      setConnected(result.connected)
      if (result.syncResult) {
        setLastSyncAt(result.syncResult.syncedAt)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'カレンダーの取得に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }, [currentDate, viewMode])

  useEffect(() => {
    if (skipInitialRefresh.current) {
      skipInitialRefresh.current = false
      return
    }
    void refresh()
  }, [currentDate, viewMode, refresh])

  const sync = useCallback(async () => {
    setIsSyncing(true)
    setError(null)
    try {
      const result = await syncCalendarAction(
        currentDate.toISOString(),
        viewMode,
      )
      setLastSyncAt(result.syncedAt)
      await refresh()
      return result
    } catch (err) {
      const message =
        err instanceof Error ? err.message : '同期に失敗しました'
      setError(message)
      throw err
    } finally {
      setIsSyncing(false)
    }
  }, [currentDate, viewMode, refresh])

  const connect = useCallback(() => {
    window.location.href = '/api/calendar/auth'
  }, [])

  const disconnect = useCallback(async () => {
    setError(null)
    await disconnectCalendarAction()
    setConnected(false)
    setLastSyncAt(null)
    await refresh()
  }, [refresh])

  const createEvent = useCallback(
    async (input: CalendarEventInput) => {
      setError(null)
      const created = await createCalendarEventAction(input)
      await refresh()
      return created
    },
    [refresh],
  )

  const updateEvent = useCallback(
    async (eventId: string, input: Partial<CalendarEventInput>) => {
      setError(null)
      const updated = await updateCalendarEventAction(eventId, input)
      await refresh()
      return updated
    },
    [refresh],
  )

  const deleteEvent = useCallback(
    async (eventId: string) => {
      setError(null)
      await deleteCalendarEventAction(eventId)
      await refresh()
    },
    [refresh],
  )

  const goToToday = useCallback(() => setCurrentDate(new Date()), [])
  const goToPrevious = useCallback(
    () => setCurrentDate((date) => shiftDate(date, viewMode, -1)),
    [viewMode],
  )
  const goToNext = useCallback(
    () => setCurrentDate((date) => shiftDate(date, viewMode, 1)),
    [viewMode],
  )

  const value = useMemo(
    () => ({
      currentDate,
      viewMode,
      items,
      itemsByDate,
      connected,
      lastSyncAt,
      isLoading,
      isSyncing,
      error,
      clearError,
      setCurrentDate,
      setViewMode,
      goToToday,
      goToPrevious,
      goToNext,
      refresh,
      sync,
      connect,
      disconnect,
      createEvent,
      updateEvent,
      deleteEvent,
    }),
    [
      currentDate,
      viewMode,
      items,
      itemsByDate,
      connected,
      lastSyncAt,
      isLoading,
      isSyncing,
      error,
      clearError,
      goToToday,
      goToPrevious,
      goToNext,
      refresh,
      sync,
      connect,
      disconnect,
      createEvent,
      updateEvent,
      deleteEvent,
    ],
  )

  return (
    <CalendarContext.Provider value={value}>{children}</CalendarContext.Provider>
  )
}

export function useCalendarContext() {
  const context = useContext(CalendarContext)
  if (!context) {
    throw new Error('useCalendarContext must be used within CalendarProvider')
  }
  return context
}

export function isCalendarEvent(item: CalendarItem): item is CalendarEvent {
  return item.source === 'google'
}
