'use client'

import { Button } from '@/components/ui/Button'
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import type { ProofreadHistoryItem } from '@/types/document'

type ProofreadHistoryProps = {
  items: ProofreadHistoryItem[]
  search: string
  onSearchChange: (value: string) => void
  loading: boolean
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  onRestore: (item: ProofreadHistoryItem) => void
  onDelete: (item: ProofreadHistoryItem) => void
  deletingId?: string | null
}

export function ProofreadHistory({
  items,
  search,
  onSearchChange,
  loading,
  page,
  totalPages,
  onPageChange,
  onRestore,
  onDelete,
  deletingId = null,
}: ProofreadHistoryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">校正履歴</CardTitle>
      </CardHeader>
      <CardBody className="flex flex-col gap-md">
        <Input
          label="履歴を検索"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="原文・校正後のテキストで検索"
        />

        {loading ? (
          <p className="text-sm text-muted-foreground">読み込み中...</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">校正履歴はまだありません。</p>
        ) : (
          <ul className="flex flex-col gap-sm">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex flex-col gap-sm rounded-lg border border-border bg-surface-elevated p-md sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">
                    {new Date(item.createdAt).toLocaleString('ja-JP')}
                  </p>
                  <p className="truncate text-sm text-foreground">
                    {item.original.slice(0, 80)}
                    {item.original.length > 80 ? '…' : ''}
                  </p>
                  <p className="text-caption">
                    提案 {item.suggestions.length}件
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-sm">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={loading || deletingId === item.id}
                    onClick={() => onRestore(item)}
                  >
                    再編集
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    loading={deletingId === item.id}
                    disabled={loading || deletingId === item.id}
                    onClick={() => onDelete(item)}
                  >
                    削除
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between gap-sm">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={page <= 1 || loading}
              onClick={() => onPageChange(page - 1)}
            >
              前へ
            </Button>
            <span className="text-caption">
              {page} / {totalPages}
            </span>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={page >= totalPages || loading}
              onClick={() => onPageChange(page + 1)}
            >
              次へ
            </Button>
          </div>
        )}
      </CardBody>
    </Card>
  )
}
