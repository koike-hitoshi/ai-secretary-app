'use client'

import { useState } from 'react'

import { ResearchHistory } from '@/components/documents/ResearchHistory'
import { ResearchQueryForm } from '@/components/documents/ResearchQueryForm'
import { ResearchResult } from '@/components/documents/ResearchResult'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { useResearch } from '@/hooks/documents/useResearch'
import { useResearchHistory } from '@/hooks/documents/useResearchHistory'
import type { ResearchListItem } from '@/types/research'

type ResearchPageClientProps = {
  initialItems: ResearchListItem[]
}

export function ResearchPageClient({ initialItems }: ResearchPageClientProps) {
  const [theme, setTheme] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const { execute, loading, error, result, clearResult, setError } =
    useResearch()
  const {
    items,
    search,
    setSearch,
    loading: historyLoading,
    error: historyError,
    page,
    totalPages,
    fetchHistory,
    prependItem,
    deleteItem,
    setError: setHistoryError,
  } = useResearchHistory(initialItems)

  const handleSubmit = async () => {
    if (!theme.trim()) {
      setError('リサーチテーマを入力してください')
      return
    }

    try {
      const record = await execute(theme)
      prependItem({
        id: record.id,
        theme: record.theme,
        summaryPreview: record.summary?.slice(0, 120) ?? null,
        sourceCount: record.sources.length,
        createdAt: record.createdAt,
      })
    } catch {
      // handled in hook
    }
  }

  const handleDelete = async (item: ResearchListItem) => {
    if (!window.confirm('このリサーチ結果を削除しますか？')) return
    setDeletingId(item.id)
    try {
      await deleteItem(item.id)
      if (result?.id === item.id) {
        clearResult()
      }
    } catch {
      // handled in hook
    } finally {
      setDeletingId(null)
    }
  }

  const combinedError = error ?? historyError

  return (
    <div className="flex flex-col gap-lg px-xl py-lg">
      {combinedError && (
        <Alert
          type="error"
          dismissible
          onDismiss={() => {
            setError(null)
            setHistoryError(null)
          }}
        >
          {combinedError}
        </Alert>
      )}

      <div className="grid gap-lg lg:grid-cols-2">
        <ResearchQueryForm
          theme={theme}
          onThemeChange={setTheme}
          onSubmit={handleSubmit}
          loading={loading}
        />

        {result && (
          <div className="flex flex-col gap-md">
            <ResearchResult record={result} />
            <Button type="button" variant="outline" size="sm" onClick={clearResult}>
              結果をクリア
            </Button>
          </div>
        )}
      </div>

      <ResearchHistory
        items={items}
        search={search}
        onSearchChange={setSearch}
        loading={historyLoading}
        page={page}
        totalPages={totalPages}
        onPageChange={(nextPage) => void fetchHistory(nextPage, search)}
        onDelete={handleDelete}
        deletingId={deletingId}
      />

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => void fetchHistory(1, search)}
      >
        一覧を更新
      </Button>
    </div>
  )
}
