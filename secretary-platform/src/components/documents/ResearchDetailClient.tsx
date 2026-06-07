'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { ResearchQueryForm } from '@/components/documents/ResearchQueryForm'
import { ResearchResult } from '@/components/documents/ResearchResult'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { useResearch } from '@/hooks/documents/useResearch'
import { useResearchHistory } from '@/hooks/documents/useResearchHistory'
import type { ResearchRecord } from '@/types/research'

type ResearchDetailClientProps = {
  initialRecord: ResearchRecord
}

export function ResearchDetailClient({
  initialRecord,
}: ResearchDetailClientProps) {
  const router = useRouter()
  const [theme, setTheme] = useState(initialRecord.theme)
  const [showRerun, setShowRerun] = useState(false)

  const { execute, loading, error, result, setError } = useResearch()
  const { deleteItem } = useResearchHistory()

  const current = result ?? initialRecord

  const handleDelete = async () => {
    if (!window.confirm('このリサーチ結果を削除しますか？')) return
    try {
      await deleteItem(current.id)
      router.push('/dashboard/documents/research')
    } catch {
      // handled in hook
    }
  }

  const handleRerun = async () => {
    if (!theme.trim()) {
      setError('リサーチテーマを入力してください')
      return
    }

    try {
      const record = await execute(theme)
      router.push(`/dashboard/documents/research/${record.id}`)
    } catch {
      // handled in hook
    }
  }

  return (
    <div className="flex flex-col gap-lg px-xl py-lg">
      {error && (
        <Alert type="error" dismissible onDismiss={() => setError(null)}>
          {error}
        </Alert>
      )}

      <div className="flex flex-wrap gap-sm">
        <Link href="/dashboard/documents/research">
          <Button type="button" variant="outline" size="sm">
            一覧に戻る
          </Button>
        </Link>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => setShowRerun((value) => !value)}
        >
          {showRerun ? '再実行を閉じる' : '同じテーマで再実行'}
        </Button>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={handleDelete}
        >
          削除
        </Button>
      </div>

      {showRerun && (
        <ResearchQueryForm
          theme={theme}
          onThemeChange={setTheme}
          onSubmit={handleRerun}
          loading={loading}
        />
      )}

      <ResearchResult record={current} showPrompt />
    </div>
  )
}
