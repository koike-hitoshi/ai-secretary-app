'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import type { TranscribeResponse, TranscriptionStatus } from '@/types/minutes'

type StatusResponse = {
  minutesId: string
  transcriptionId: string
  status: TranscriptionStatus
  progress: number
  result?: string
  error?: string
}

const POLL_INTERVAL_MS = 3000
const MAX_POLL_ATTEMPTS = 200
const STATUS_FETCH_TIMEOUT_MS = 90_000
const PROCESSING_STORAGE_KEY = 'minutes-processing-id'

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function isAbortError(err: unknown): boolean {
  return err instanceof DOMException && err.name === 'AbortError'
}

export function useTranscription() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [minutesId, setMinutesId] = useState<string | null>(null)
  const [status, setStatus] = useState<TranscriptionStatus>('pending')
  const [progress, setProgress] = useState(0)
  const [transcript, setTranscript] = useState<string | null>(null)
  const pollingRef = useRef(false)
  const activeIdRef = useRef<string | null>(null)
  const pollGenerationRef = useRef(0)
  const abortRef = useRef<AbortController | null>(null)
  const hydratedRef = useRef(false)

  const clearProcessingStorage = useCallback(() => {
    try {
      sessionStorage.removeItem(PROCESSING_STORAGE_KEY)
    } catch {
      // sessionStorage unavailable
    }
  }, [])

  const saveProcessingStorage = useCallback((id: string) => {
    try {
      sessionStorage.setItem(PROCESSING_STORAGE_KEY, id)
    } catch {
      // sessionStorage unavailable
    }
  }, [])

  const stopPolling = useCallback(() => {
    pollingRef.current = false
    activeIdRef.current = null
    pollGenerationRef.current += 1
    abortRef.current?.abort()
    abortRef.current = null
  }, [])

  const pollStatus = useCallback(async (id: string) => {
    abortRef.current?.abort()

    const controller = new AbortController()
    abortRef.current = controller
    const timeoutId = window.setTimeout(
      () => controller.abort(),
      STATUS_FETCH_TIMEOUT_MS,
    )

    let response: Response
    try {
      response = await fetch(`/api/documents/transcribe/${id}/status`, {
        cache: 'no-store',
        signal: controller.signal,
      })
    } catch (err) {
      if (isAbortError(err)) {
        throw new Error(
          '進捗確認がタイムアウトしました。「進捗を再確認」を押すか、一覧から詳細を開いてください。',
        )
      }
      throw err
    } finally {
      window.clearTimeout(timeoutId)
      if (abortRef.current === controller) {
        abortRef.current = null
      }
    }

    const payload = (await response.json()) as StatusResponse & {
      error?: string
    }

    if (!response.ok) {
      throw new Error(payload.error ?? 'ステータス取得に失敗しました')
    }

    setStatus(payload.status)
    setProgress(payload.progress)

    if (payload.status === 'completed') {
      if (payload.result) {
        setTranscript(payload.result)
      }
      clearProcessingStorage()
      stopPolling()
      return payload
    }

    if (payload.status === 'failed') {
      clearProcessingStorage()
      stopPolling()
      throw new Error(payload.error ?? '文字起こしに失敗しました')
    }

    return payload
  }, [clearProcessingStorage, stopPolling])

  const runPollLoop = useCallback(
    async (id: string) => {
      const generation = pollGenerationRef.current + 1
      pollGenerationRef.current = generation
      pollingRef.current = true
      activeIdRef.current = id

      try {
        for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt += 1) {
          if (
            !pollingRef.current ||
            activeIdRef.current !== id ||
            pollGenerationRef.current !== generation
          ) {
            return
          }

          const payload = await pollStatus(id)

          if (payload.status === 'completed' || payload.status === 'failed') {
            return
          }

          const visualProgress = Math.min(
            90,
            Math.max(payload.progress, 55 + attempt),
          )
          setProgress(visualProgress)

          await sleep(POLL_INTERVAL_MS)
        }

        stopPolling()
        setError(
          '文字起こしがタイムアウトしました。しばらく待ってから「進捗を再確認」を押すか、一覧の「詳細」から確認してください。',
        )
      } catch (err) {
        if (
          !pollingRef.current ||
          activeIdRef.current !== id ||
          pollGenerationRef.current !== generation
        ) {
          return
        }

        const message =
          err instanceof Error ? err.message : '文字起こしに失敗しました'
        setError(message)
        stopPolling()
      }
    },
    [pollStatus, stopPolling],
  )

  const startTranscription = useCallback(
    async (uploadId: string, meetingTitle?: string) => {
      setLoading(true)
      setError(null)
      setTranscript(null)
      setProgress(0)
      setStatus('pending')
      stopPolling()

      try {
        const response = await fetch('/api/documents/transcribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uploadId, meetingTitle }),
        })

        const payload = (await response.json()) as TranscribeResponse & {
          error?: string
        }

        if (!response.ok) {
          throw new Error(payload.error ?? '文字起こしの開始に失敗しました')
        }

        setMinutesId(payload.minutesId)
        setStatus(payload.status)
        setProgress(payload.progress)
        saveProcessingStorage(payload.minutesId)
        void runPollLoop(payload.minutesId)

        return payload
      } catch (err) {
        const message =
          err instanceof Error ? err.message : '文字起こしの開始に失敗しました'
        setError(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [runPollLoop, saveProcessingStorage, stopPolling],
  )

  const resumePolling = useCallback(
    async (id: string) => {
      stopPolling()
      setError(null)
      setMinutesId(id)

      try {
        const payload = await pollStatus(id)
        if (payload.status !== 'completed' && payload.status !== 'failed') {
          void runPollLoop(id)
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : '進捗の再確認に失敗しました'
        setError(message)
      }
    },
    [pollStatus, runPollLoop, stopPolling],
  )

  const generateMinutes = useCallback(async (id: string, text?: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/documents/minutes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          minutesId: id,
          transcriptionText: text,
        }),
      })

      const payload = (await response.json()) as { error?: string }
      if (!response.ok) {
        throw new Error(payload.error ?? '議事録の生成に失敗しました')
      }

      return payload
    } catch (err) {
      const message =
        err instanceof Error ? err.message : '議事録の生成に失敗しました'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => () => stopPolling(), [stopPolling])

  useEffect(() => {
    if (hydratedRef.current) return
    hydratedRef.current = true

    let storedId: string | null = null
    try {
      storedId = sessionStorage.getItem(PROCESSING_STORAGE_KEY)
    } catch {
      storedId = null
    }

    if (!storedId) return

    const timer = window.setTimeout(() => {
      void resumePolling(storedId)
    }, 0)

    return () => window.clearTimeout(timer)
  }, [resumePolling])

  const reset = useCallback(() => {
    stopPolling()
    clearProcessingStorage()
    setMinutesId(null)
    setStatus('pending')
    setProgress(0)
    setTranscript(null)
    setError(null)
  }, [clearProcessingStorage, stopPolling])

  return {
    startTranscription,
    generateMinutes,
    pollStatus,
    resumePolling,
    loading,
    error,
    minutesId,
    status,
    progress,
    transcript,
    reset,
    setError,
  }
}
