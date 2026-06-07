'use client'

import { useCallback, useState } from 'react'

import type { UploadResponse } from '@/types/minutes'

export function useAudioUpload() {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [uploadResult, setUploadResult] = useState<UploadResponse | null>(null)

  const upload = useCallback(async (file: File) => {
    setUploading(true)
    setProgress(0)
    setError(null)

    try {
      setProgress(20)
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      })

      setProgress(80)
      const payload = (await response.json()) as UploadResponse & {
        error?: string
      }

      if (!response.ok) {
        throw new Error(payload.error ?? 'アップロードに失敗しました')
      }

      setProgress(100)
      setUploadResult(payload)
      return payload
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'アップロードに失敗しました'
      setError(message)
      throw err
    } finally {
      setUploading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setUploadResult(null)
    setProgress(0)
    setError(null)
  }, [])

  return { upload, uploading, progress, error, uploadResult, reset, setError }
}
