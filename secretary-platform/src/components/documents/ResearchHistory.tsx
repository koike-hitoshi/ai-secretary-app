'use client'

import Link from 'next/link'

import { Button } from '@/components/ui/Button'
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import type { ResearchListItem } from '@/types/research'

type ResearchHistoryProps = {
  items: ResearchListItem[]
  search: string
  onSearchChange: (value: string) => void
  loading: boolean
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  onDelete: (item: ResearchListItem) => void
  deletingId?: string | null
}

export function ResearchHistory({
  items,
  search,
  onSearchChange,
  loading,
  page,
  totalPages,
  onPageChange,
  onDelete,
  deletingId = null,
}: ResearchHistoryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">リサーチ履歴</CardTitle>
      </CardHeader>
      <CardBody className="flex flex-col gap-md">
        <Input
          label="履歴を検索"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="テーマや要約で検索"
        />

        {loading ? (
          <p className="text-sm text-muted-foreground">読み込み中...</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            リサーチ履歴はまだありません。
          </p>
        ) : (
          <ul className="flex flex-col gap-sm">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex flex-col gap-sm rounded-lg border border-border bg-surface-elevated p-md sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground">{item.theme}</p>
                  <p className="text-caption">
                    {new Date(item.createdAt).toLocaleString('ja-JP')}
                    {item.sourceCount > 0
                      ? ` · 出典 ${item.sourceCount}件`
                      : ' · 出典なし'}
                  </p>
                  {item.summaryPreview && (
                    <p className="mt-xs truncate text-sm text-muted-foreground">
                      {item.summaryPreview}
                      {item.summaryPreview.length >= 120 ? '…' : ''}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 gap-sm">
                  <Link href={`/dashboard/documents/research/${item.id}`}>
                    <Button type="button" size="sm" variant="outline">
                      詳細
                    </Button>
                  </Link>
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
