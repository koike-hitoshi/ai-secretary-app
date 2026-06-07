'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/Button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center gap-lg bg-background p-xl text-center">
      <h1 className="text-2xl font-semibold text-foreground">
        エラーが発生しました
      </h1>
      <p className="max-w-md text-base text-muted-foreground">
        ページの表示中に問題が起きました。開発サーバーを再起動してから、もう一度お試しください。
      </p>
      <div className="flex flex-wrap justify-center gap-sm">
        <Button onClick={() => reset()}>再試行</Button>
        <Button variant="secondary" onClick={() => (window.location.href = '/dashboard')}>
          ダッシュボードへ
        </Button>
      </div>
    </div>
  )
}
