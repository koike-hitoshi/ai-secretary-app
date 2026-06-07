'use client'

import Link from 'next/link'

import { Button } from '@/components/ui/Button'
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import type { MinutesListItem } from '@/types/minutes'

type MinutesListProps = {
  items: MinutesListItem[]
  search: string
  onSearchChange: (value: string) => void
  loading: boolean
  onDelete: (id: string) => void
  onResumeProgress?: (id: string) => void
  resumingId?: string | null
  deletingId?: string | null
}

export function MinutesList({
  items,
  search,
  onSearchChange,
  loading,
  onDelete,
  onResumeProgress,
  resumingId = null,
  deletingId = null,
}: MinutesListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">議事録一覧</CardTitle>
      </CardHeader>
      <CardBody className="flex flex-col gap-md">
        <Input
          label="検索"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="会議名で検索"
        />

        {loading ? (
          <p className="text-sm text-muted-foreground">読み込み中...</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">議事録はまだありません。</p>
        ) : (
          <ul className="flex flex-col gap-sm">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex flex-col gap-sm rounded-lg border border-border bg-surface-elevated p-md sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground">{item.title}</p>
                  <p className="text-caption">
                    {new Date(item.createdAt).toLocaleString('ja-JP')}
                    {item.hasSummary
                      ? ' · 議事録生成済'
                      : item.hasTranscript
                        ? ' · 文字起こし済'
                        : ' · 文字起こし処理中'}
                  </p>
                </div>
                <div className="flex shrink-0 gap-sm">
                  {!item.hasTranscript && onResumeProgress && (
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      loading={resumingId === item.id}
                      disabled={resumingId === item.id}
                      onClick={() => onResumeProgress(item.id)}
                    >
                      進捗確認
                    </Button>
                  )}
                  <Link href={`/dashboard/documents/minutes/${item.id}`}>
                    <Button type="button" size="sm" variant="outline">
                      詳細
                    </Button>
                  </Link>
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    loading={deletingId === item.id}
                    disabled={deletingId === item.id}
                    onClick={() => onDelete(item.id)}
                  >
                    削除
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  )
}
