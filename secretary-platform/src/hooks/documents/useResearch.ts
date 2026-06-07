'use client'

import { useCallback, useState } from 'react'

import type { ResearchRecord } from '@/types/research'

export function useResearch() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ResearchRecord | null>(null)

  const execute = useCallback(async (theme: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/documents/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme }),
      })

      const payload = (await response.json()) as {
        record?: ResearchRecord
        error?: string
      }

      if (!response.ok) {
        throw new Error(payload.error ?? 'リサーチに失敗しました')
      }

      if (!payload.record) {
        throw new Error('リサーチ結果が取得できませんでした')
      }

      setResult(payload.record)
      return payload.record
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'リサーチに失敗しました'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const clearResult = useCallback(() => {
    setResult(null)
    setError(null)
  }, [])

  return {
    execute,
    loading,
    error,
    result,
    clearResult,
    setError,
  }
}
