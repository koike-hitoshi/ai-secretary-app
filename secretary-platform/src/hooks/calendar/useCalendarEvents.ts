'use client'

import { useMemo } from 'react'

import { useCalendarContext } from '@/contexts/CalendarContext'

export function useCalendarEvents() {
  const { items, itemsByDate, isLoading, refresh } = useCalendarContext()

  return useMemo(
    () => ({
      items,
      itemsByDate,
      isLoading,
      refresh,
    }),
    [items, itemsByDate, isLoading, refresh],
  )
}
