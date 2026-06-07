'use client'

import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useCalendarSync } from '@/hooks/calendar'

function formatSyncTime(iso: string | null): string {
  if (!iso) return '未同期'
  const date = new Date(iso)
  return `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

export function CalendarSync() {
  const { connected, lastSyncAt, isSyncing, connect, sync, disconnect } =
    useCalendarSync()

  return (
    <section
      aria-label="カレンダー同期"
      className="flex flex-wrap items-center justify-between gap-md rounded-2xl border border-border bg-surface-elevated p-lg"
    >
      <div className="flex flex-wrap items-center gap-sm">
        <h2 className="text-base font-semibold text-foreground">Googleカレンダー連携</h2>
        <Badge variant={connected ? 'success' : 'secondary'} size="sm">
          {connected ? '連携済み' : '未連携'}
        </Badge>
        {connected && (
          <span className="text-sm text-muted-foreground">
            最終同期: {formatSyncTime(lastSyncAt)}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-sm">
        {!connected ? (
          <Button onClick={connect}>Googleカレンダーと連携</Button>
        ) : (
          <>
            <Button variant="outline" loading={isSyncing} onClick={() => void sync()}>
              同期する
            </Button>
            <Button variant="ghost" onClick={() => void disconnect()}>
              連携解除
            </Button>
          </>
        )}
      </div>
    </section>
  )
}
