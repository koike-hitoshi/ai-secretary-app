'use client'

import { useCallback, useState } from 'react'

import { DocumentEditor } from '@/components/documents/DocumentEditor'
import { DocumentTypeSelector } from '@/components/documents/DocumentTypeSelector'
import { ProofreadHistory } from '@/components/documents/ProofreadHistory'
import { ProofreadPanel } from '@/components/documents/ProofreadPanel'
import { ProofreadResult } from '@/components/documents/ProofreadResult'
import { WritingStyleAnalyzer } from '@/components/documents/WritingStyleAnalyzer'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { useProofread } from '@/hooks/documents/useProofread'
import { useProofreadHistory } from '@/hooks/documents/useProofreadHistory'
import { useWritingStyle } from '@/hooks/documents/useWritingStyle'
import type {
  DocumentType,
  ProofreadHistoryItem,
  WritingStyleProfile,
} from '@/types/document'

type ProofreadPageClientProps = {
  initialProfile: WritingStyleProfile | null
  initialHistory: ProofreadHistoryItem[]
}

export function ProofreadPageClient({
  initialProfile,
  initialHistory,
}: ProofreadPageClientProps) {
  const [content, setContent] = useState('')
  const [documentType, setDocumentType] = useState<DocumentType>('general')
  const [applyUserStyle, setApplyUserStyle] = useState(true)
  const [acceptedIds, setAcceptedIds] = useState<Set<string>>(new Set())
  const [deletingHistoryId, setDeletingHistoryId] = useState<string | null>(
    null,
  )

  const { proofread, loading, error, result, clearResult, setError } =
    useProofread()
  const {
    profile,
    loading: styleLoading,
    error: styleError,
    analyzeStyle,
    setError: setStyleError,
  } = useWritingStyle(initialProfile)
  const {
    items: historyItems,
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
  } = useProofreadHistory(initialHistory)

  const handleProofread = async () => {
    if (!content.trim()) {
      setError('校正する文章を入力してください')
      return
    }

    try {
      const response = await proofread({
        content,
        documentType,
        applyUserStyle,
      })
      setAcceptedIds(new Set(response.suggestions.map((s) => s.id)))
      prependItem({
        id: response.documentId,
        original: response.original,
        corrected: response.corrected,
        suggestions: response.suggestions,
        createdAt: response.createdAt,
      })
    } catch {
      // error state handled in hook
    }
  }

  const handleAnalyzeStyle = async () => {
    if (!content.trim()) {
      setStyleError('文体を学習する文章を入力してください')
      return
    }

    try {
      await analyzeStyle([content])
    } catch {
      // error state handled in hook
    }
  }

  const toggleSuggestion = useCallback((id: string) => {
    setAcceptedIds((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const acceptAll = useCallback(() => {
    if (!result) return
    setAcceptedIds(new Set(result.suggestions.map((s) => s.id)))
  }, [result])

  const rejectAll = useCallback(() => {
    setAcceptedIds(new Set())
  }, [])

  const handleRestore = (item: ProofreadHistoryItem) => {
    setContent(item.corrected ?? item.original)
    clearResult()
    setAcceptedIds(new Set())
  }

  const handleDeleteHistory = async (item: ProofreadHistoryItem) => {
    if (!window.confirm('この校正履歴を削除しますか？')) return

    setDeletingHistoryId(item.id)
    try {
      await deleteItem(item.id)
      if (result?.documentId === item.id) {
        clearResult()
      }
    } catch {
      // error state handled in hook
    } finally {
      setDeletingHistoryId(null)
    }
  }

  const handleApplyText = (text: string) => {
    setContent(text)
  }

  return (
    <div className="flex flex-col gap-lg px-xl py-lg">
      {(error || styleError || historyError) && (
        <Alert
          type="error"
          dismissible
          onDismiss={() => {
            setError(null)
            setStyleError(null)
            setHistoryError(null)
          }}
        >
          {error ?? styleError ?? historyError}
        </Alert>
      )}

      <Tabs defaultValue="editor">
        <TabsList>
          <TabsTrigger value="editor">校正</TabsTrigger>
          <TabsTrigger value="style">文体</TabsTrigger>
          <TabsTrigger value="history">履歴</TabsTrigger>
        </TabsList>

        <TabsContent value="editor">
          <div className="grid gap-lg lg:grid-cols-2">
            <Card>
              <CardBody className="flex flex-col gap-md">
                <DocumentTypeSelector
                  value={documentType}
                  onChange={setDocumentType}
                  disabled={loading}
                />

                <label className="flex items-center gap-sm text-sm text-foreground">
                  <input
                    type="checkbox"
                    checked={applyUserStyle}
                    onChange={(e) => setApplyUserStyle(e.target.checked)}
                    disabled={loading}
                    className="size-4 rounded border-border accent-primary"
                  />
                  学習済みの文体を適用する
                </label>

                <DocumentEditor
                  content={content}
                  documentType={documentType}
                  onContentChange={setContent}
                  onDocumentTypeChange={setDocumentType}
                  disabled={loading}
                />

                <Button
                  onClick={handleProofread}
                  loading={loading}
                  disabled={!content.trim()}
                >
                  校正を実行
                </Button>
              </CardBody>
            </Card>

            <div className="flex flex-col gap-md">
              {result ? (
                <>
                  <ProofreadPanel
                    result={result}
                    acceptedIds={acceptedIds}
                    onApplyAccepted={handleApplyText}
                  />
                  <ProofreadResult
                    suggestions={result.suggestions}
                    acceptedIds={acceptedIds}
                    onToggle={toggleSuggestion}
                    onAcceptAll={acceptAll}
                    onRejectAll={rejectAll}
                  />
                </>
              ) : (
                <Card>
                  <CardBody>
                    <p className="text-sm text-muted-foreground">
                      文章を入力して「校正を実行」を押すと、AI による校正結果と提案が表示されます。
                    </p>
                  </CardBody>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="style">
          <WritingStyleAnalyzer
            profile={profile}
            loading={styleLoading}
            onAnalyze={handleAnalyzeStyle}
            canAnalyze={Boolean(content.trim())}
          />
        </TabsContent>

        <TabsContent value="history">
          <ProofreadHistory
            items={historyItems}
            search={search}
            onSearchChange={setSearch}
            loading={historyLoading}
            page={page}
            totalPages={totalPages}
            onPageChange={fetchHistory}
            onRestore={handleRestore}
            onDelete={handleDeleteHistory}
            deletingId={deletingHistoryId}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
