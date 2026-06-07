'use client'

import { useCallback, useMemo, useState } from 'react'

import type { ProofreadHistoryItem } from '@/types/document'

type HistoryResponse = {
  items: ProofreadHistoryItem[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export function useProofreadHistory(initialItems: ProofreadHistoryItem[] = []) {
  const [items, setItems] = useState<ProofreadHistoryItem[]>(initialItems)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchHistory = useCallback(async (nextPage = 1) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/documents/proofread/history?page=${nextPage}&limit=20`,
      )
      const payload = (await response.json()) as HistoryResponse & {
        error?: string
      }

      if (!response.ok) {
        throw new Error(payload.error ?? '履歴の取得に失敗しました')
      }

      setItems(payload.items)
      setPage(payload.page)
      setTotalPages(payload.totalPages)
      return payload
    } catch (err) {
      const message =
        err instanceof Error ? err.message : '履歴の取得に失敗しました'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return items

    return items.filter(
      (item) =>
        item.original.toLowerCase().includes(query) ||
        (item.corrected?.toLowerCase().includes(query) ?? false),
    )
  }, [items, search])

  const prependItem = useCallback((item: ProofreadHistoryItem) => {
    setItems((current) => [item, ...current])
  }, [])

  const deleteItem = useCallback(
    async (id: string) => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/documents/proofread/history/${id}`, {
          method: 'DELETE',
        })
        const payload = (await response.json()) as { error?: string }

        if (!response.ok) {
          throw new Error(payload.error ?? '削除に失敗しました')
        }

        setItems((current) => current.filter((item) => item.id !== id))
      } catch (err) {
        const message =
          err instanceof Error ? err.message : '削除に失敗しました'
        setError(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  return {
    items: filteredItems,
    search,
    setSearch,
    loading,
    error,
    page,
    totalPages,
    fetchHistory,
    prependItem,
    deleteItem,
    setError,
  }
}
