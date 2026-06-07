'use client'

import { useCallback, useState } from 'react'

import type { DocumentType, ProofreadResponse } from '@/types/document'

export function useProofread() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ProofreadResponse | null>(null)

  const proofread = useCallback(
    async (input: {
      content: string
      documentType: DocumentType
      applyUserStyle: boolean
    }) => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch('/api/documents/proofread', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        })

        const payload = (await response.json()) as ProofreadResponse & {
          error?: string
        }

        if (!response.ok) {
          throw new Error(payload.error ?? '校正に失敗しました')
        }

        setResult(payload)
        return payload
      } catch (err) {
        const message = err instanceof Error ? err.message : '校正に失敗しました'
        setError(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  const clearResult = useCallback(() => {
    setResult(null)
    setError(null)
  }, [])

  return { proofread, loading, error, result, clearResult, setError }
}
