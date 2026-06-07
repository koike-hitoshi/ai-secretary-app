'use client'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardBody, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import type { WritingStyleProfile } from '@/types/document'

type WritingStyleAnalyzerProps = {
  profile: WritingStyleProfile | null
  loading: boolean
  onAnalyze: () => void
  canAnalyze: boolean
}

export function WritingStyleAnalyzer({
  profile,
  loading,
  onAnalyze,
  canAnalyze,
}: WritingStyleAnalyzerProps) {
  const progress = Math.min(100, (profile?.sampleCount ?? 0) * 10)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">文体プロファイル</CardTitle>
        <CardDescription>
          過去の文章からあなたの文体を学習し、パーソナライズされた校正に活用します。
        </CardDescription>
      </CardHeader>
      <CardBody className="flex flex-col gap-md">
        {profile?.toneDescription ? (
          <>
            <p className="text-sm text-foreground">{profile.toneDescription}</p>

            <div className="grid gap-sm sm:grid-cols-3">
              <div className="rounded-lg border border-border bg-surface-elevated p-md">
                <p className="text-xs text-muted-foreground">学習サンプル</p>
                <p className="text-lg font-semibold">{profile.sampleCount}件</p>
              </div>
              <div className="rounded-lg border border-border bg-surface-elevated p-md">
                <p className="text-xs text-muted-foreground">フォーマル度</p>
                <p className="text-lg font-semibold">
                  {profile.formalityLevel ?? '—'}/5
                </p>
              </div>
              <div className="rounded-lg border border-border bg-surface-elevated p-md">
                <p className="text-xs text-muted-foreground">平均文長</p>
                <p className="text-lg font-semibold">
                  {profile.averageSentenceLength
                    ? `約${profile.averageSentenceLength}文字`
                    : '—'}
                </p>
              </div>
            </div>

            <div>
              <div className="mb-xs flex items-center justify-between text-xs text-muted-foreground">
                <span>学習進度</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-normal"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {profile.commonPhrases.length > 0 && (
              <div className="flex flex-wrap gap-xs">
                {profile.commonPhrases.map((phrase) => (
                  <Badge key={phrase} variant="secondary">
                    {phrase}
                  </Badge>
                ))}
              </div>
            )}

            {profile.analyzedAt && (
              <p className="text-caption">
                最終分析: {new Date(profile.analyzedAt).toLocaleString('ja-JP')}
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            まだ文体プロファイルがありません。文章を入力して「文体を学習」を実行してください。
          </p>
        )}

        <Button
          type="button"
          variant="secondary"
          loading={loading}
          disabled={!canAnalyze}
          onClick={onAnalyze}
        >
          文体を学習・更新
        </Button>
      </CardBody>
    </Card>
  )
}
