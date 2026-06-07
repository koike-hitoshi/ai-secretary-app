'use client'

import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import type { TranscriptionStatus } from '@/types/minutes'

const STEPS = [
  { key: 'upload', label: 'ファイルアップロード' },
  { key: 'transcribe', label: '音声認識処理' },
  { key: 'text', label: 'テキスト生成' },
  { key: 'minutes', label: '議事録フォーマット化' },
] as const

type TranscriptionProgressProps = {
  status: TranscriptionStatus
  progress: number
  error?: string | null
  generatingMinutes?: boolean
  readyToGenerate?: boolean
}

function getActiveStep(
  status: TranscriptionStatus,
  generatingMinutes: boolean,
  readyToGenerate: boolean,
): number {
  if (generatingMinutes) return 3
  if (readyToGenerate || status === 'completed') return 3
  if (status === 'processing') return 1
  if (status === 'pending') return 1
  return 0
}

export function TranscriptionProgress({
  status,
  progress,
  error,
  generatingMinutes = false,
  readyToGenerate = false,
}: TranscriptionProgressProps) {
  const activeStep = getActiveStep(status, generatingMinutes, readyToGenerate)
  const transcriptionComplete = readyToGenerate && !generatingMinutes

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">処理状況</CardTitle>
      </CardHeader>
      <CardBody className="flex flex-col gap-md">
        <div className="flex flex-col gap-sm">
          {STEPS.map((step, index) => {
            const done =
              index < activeStep ||
              (transcriptionComplete && index < 3)
            const active = index === activeStep && !transcriptionComplete
            const ready = transcriptionComplete && index === 3
            return (
              <div key={step.key} className="flex items-center gap-sm">
                <span
                  className={cn(
                    'flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-medium',
                    done && 'bg-success text-success-foreground',
                    active && 'bg-primary text-primary-foreground',
                    ready &&
                      'border-2 border-primary bg-transparent text-primary',
                    !done && !active && !ready && 'bg-secondary text-muted-foreground',
                  )}
                >
                  {done ? '✓' : index + 1}
                </span>
                <span
                  className={cn(
                    'text-sm',
                    (active || ready) && 'font-medium text-foreground',
                    !active && !ready && 'text-muted-foreground',
                  )}
                >
                  {step.label}
                  {ready && (
                    <span className="ml-xs text-caption text-primary">
                      （準備完了）
                    </span>
                  )}
                </span>
              </div>
            )
          })}
        </div>

        <div>
          <div className="mb-xs flex justify-between text-xs text-muted-foreground">
            <span>進捗</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-all duration-normal"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        {status === 'failed' && !error && (
          <p className="text-sm text-destructive">処理に失敗しました</p>
        )}
      </CardBody>
    </Card>
  )
}
