'use client'

import { useCallback, useState } from 'react'

import type { MinutesListItem, MinutesRecord } from '@/types/minutes'

export function useMinutes(initialItems: MinutesListItem[] = []) {
  const [items, setItems] = useState<MinutesListItem[]>(initialItems)
  const [record, setRecord] = useState<MinutesRecord | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchList = useCallback(async (page = 1, search = '') => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' })
      if (search) params.set('q', search)

      const response = await fetch(`/api/documents/minutes?${params}`)
      const payload = (await response.json()) as {
        items: MinutesListItem[]
        error?: string
      }

      if (!response.ok) {
        throw new Error(payload.error ?? '一覧の取得に失敗しました')
      }

      setItems(payload.items)
      return payload
    } catch (err) {
      const message =
        err instanceof Error ? err.message : '一覧の取得に失敗しました'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchOne = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/documents/minutes/${id}`)
      const payload = (await response.json()) as {
        record: MinutesRecord
        error?: string
      }

      if (!response.ok) {
        throw new Error(payload.error ?? '取得に失敗しました')
      }

      setRecord(payload.record)
      return payload.record
    } catch (err) {
      const message = err instanceof Error ? err.message : '取得に失敗しました'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const update = useCallback(
    async (
      id: string,
      input: {
        title?: string
        discussed?: string
        decisions?: string
        nextActions?: string
        transcript?: string
      },
    ) => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/documents/minutes/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        })

        const payload = (await response.json()) as {
          record: MinutesRecord
          error?: string
        }

        if (!response.ok) {
          throw new Error(payload.error ?? '更新に失敗しました')
        }

        setRecord(payload.record)
        setItems((current) =>
          current.map((item) =>
            item.id === id
              ? {
                  ...item,
                  title: payload.record.title,
                  updatedAt: payload.record.updatedAt,
                  hasSummary: Boolean(
                    payload.record.discussed || payload.record.decisions,
                  ),
                }
              : item,
          ),
        )

        return payload.record
      } catch (err) {
        const message = err instanceof Error ? err.message : '更新に失敗しました'
        setError(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  const remove = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/documents/minutes/${id}`, {
        method: 'DELETE',
      })
      const payload = (await response.json()) as { error?: string }

      if (!response.ok) {
        throw new Error(payload.error ?? '削除に失敗しました')
      }

      setItems((current) => current.filter((item) => item.id !== id))
      setRecord((current) => (current?.id === id ? null : current))
    } catch (err) {
      const message = err instanceof Error ? err.message : '削除に失敗しました'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const prependItem = useCallback((item: MinutesListItem) => {
    setItems((current) => [item, ...current])
  }, [])

  return {
    items,
    record,
    loading,
    error,
    fetchList,
    fetchOne,
    update,
    remove,
    prependItem,
    setRecord,
    setError,
  }
}
