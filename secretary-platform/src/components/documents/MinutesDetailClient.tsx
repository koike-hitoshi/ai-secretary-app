'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { MinutesDisplay } from '@/components/documents/MinutesDisplay'
import { MinutesEditor } from '@/components/documents/MinutesEditor'
import { MinutesExporter } from '@/components/documents/MinutesExporter'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { useMinutes } from '@/hooks/documents/useMinutes'
import type { MinutesRecord } from '@/types/minutes'

type MinutesDetailClientProps = {
  initialRecord: MinutesRecord
}

export function MinutesDetailClient({ initialRecord }: MinutesDetailClientProps) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(initialRecord.title)
  const [discussed, setDiscussed] = useState(initialRecord.discussed ?? '')
  const [decisions, setDecisions] = useState(initialRecord.decisions ?? '')
  const [nextActions, setNextActions] = useState(initialRecord.nextActions ?? '')
  const [saveStatus, setSaveStatus] = useState<string | null>(null)

  const { record, loading, error, update, remove, setError } = useMinutes()

  const current = record ?? initialRecord

  const handleSave = async () => {
    try {
      const saved = await update(current.id, {
        title,
        discussed,
        decisions,
        nextActions,
      })
      setTitle(saved.title)
      setDiscussed(saved.discussed ?? '')
      setDecisions(saved.decisions ?? '')
      setNextActions(saved.nextActions ?? '')
      setEditing(false)
      setSaveStatus('保存しました')
      window.setTimeout(() => setSaveStatus(null), 2000)
    } catch {
      // handled in hook
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('この議事録を削除しますか？')) return
    try {
      await remove(current.id)
      router.push('/dashboard/documents/minutes')
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
      {saveStatus && (
        <Alert type="success" dismissible onDismiss={() => setSaveStatus(null)}>
          {saveStatus}
        </Alert>
      )}

      <div className="flex flex-wrap items-center justify-between gap-sm">
        <div>
          <Link
            href="/dashboard/documents/minutes"
            className="text-sm text-primary hover:underline"
          >
            ← 議事録一覧に戻る
          </Link>
          <h2 className="mt-xs text-xl font-semibold">{current.title}</h2>
          <p className="text-caption">
            更新: {new Date(current.updatedAt).toLocaleString('ja-JP')}
          </p>
        </div>
        <div className="flex flex-wrap gap-sm">
          <Button
            type="button"
            variant={editing ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setEditing((v) => !v)}
          >
            {editing ? 'プレビュー' : '編集'}
          </Button>
          {editing && (
            <Button type="button" size="sm" loading={loading} onClick={handleSave}>
              保存
            </Button>
          )}
          <Button
            type="button"
            variant="destructive"
            size="sm"
            loading={loading}
            onClick={handleDelete}
          >
            削除
          </Button>
        </div>
      </div>

      <MinutesExporter record={current} />

      {editing ? (
        <MinutesEditor
          title={title}
          discussed={discussed}
          decisions={decisions}
          nextActions={nextActions}
          onTitleChange={setTitle}
          onDiscussedChange={setDiscussed}
          onDecisionsChange={setDecisions}
          onNextActionsChange={setNextActions}
          disabled={loading}
        />
      ) : (
        <MinutesDisplay record={current} />
      )}
    </div>
  )
}
