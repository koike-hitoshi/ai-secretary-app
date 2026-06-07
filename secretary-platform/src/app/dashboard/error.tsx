'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/Button'

export default function DashboardError({
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
    <div className="flex flex-1 flex-col items-center justify-center gap-lg p-xl text-center">
      <h2 className="text-xl font-semibold text-foreground">
        ダッシュボードを表示できません
      </h2>
      <p className="max-w-md text-base text-muted-foreground">
        {error.message || '不明なエラーが発生しました。'}
      </p>
      <Button onClick={() => reset()}>再試行</Button>
    </div>
  )
}
