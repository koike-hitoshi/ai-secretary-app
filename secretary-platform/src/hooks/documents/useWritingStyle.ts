'use client'

import { useCallback, useState } from 'react'

import type { WritingStyleProfile } from '@/types/document'

export function useWritingStyle(initialProfile: WritingStyleProfile | null = null) {
  const [profile, setProfile] = useState<WritingStyleProfile | null>(initialProfile)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/documents/writing-style')
      const payload = (await response.json()) as {
        profile: WritingStyleProfile | null
        error?: string
      }

      if (!response.ok) {
        throw new Error(payload.error ?? '文体情報の取得に失敗しました')
      }

      setProfile(payload.profile)
      return payload.profile
    } catch (err) {
      const message =
        err instanceof Error ? err.message : '文体情報の取得に失敗しました'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const analyzeStyle = useCallback(async (samples: string[]) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/documents/writing-style/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ samples }),
      })

      const payload = (await response.json()) as {
        profile: WritingStyleProfile
        error?: string
      }

      if (!response.ok) {
        throw new Error(payload.error ?? '文体分析に失敗しました')
      }

      setProfile(payload.profile)
      return payload.profile
    } catch (err) {
      const message =
        err instanceof Error ? err.message : '文体分析に失敗しました'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    profile,
    loading,
    error,
    fetchProfile,
    analyzeStyle,
    setProfile,
    setError,
  }
}
