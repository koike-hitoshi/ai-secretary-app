'use client'

import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { Textarea } from '@/components/ui/Textarea'
import { MAX_RESEARCH_THEME_LENGTH } from '@/lib/research/promptOptimizer'

type ResearchQueryFormProps = {
  theme: string
  onThemeChange: (value: string) => void
  onSubmit: () => void
  loading?: boolean
  disabled?: boolean
}

export function ResearchQueryForm({
  theme,
  onThemeChange,
  onSubmit,
  loading = false,
  disabled = false,
}: ResearchQueryFormProps) {
  return (
    <Card>
      <CardBody className="flex flex-col gap-md">
        <h2 className="text-lg font-semibold">リサーチテーマ</h2>
        <Textarea
          label="調査したいテーマ"
          value={theme}
          onChange={(e) => onThemeChange(e.target.value)}
          placeholder="例: 2026年の生成AI市場動向と主要プレイヤーの比較"
          rows={4}
          maxLength={MAX_RESEARCH_THEME_LENGTH}
          showCount
          disabled={disabled || loading}
        />
        <p className="text-caption text-muted-foreground">
          OpenAI がプロンプトを最適化し、Perplexity で Web 検索を実行します。
        </p>
        <Button
          onClick={onSubmit}
          loading={loading}
          disabled={!theme.trim() || disabled || loading}
        >
          リサーチを実行
        </Button>
      </CardBody>
    </Card>
  )
}
