'use client'

import { Button } from '@/components/ui/Button'
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card'
import { applyAllSuggestions } from '@/lib/writing-style/styleApplicator'
import type { ProofreadResponse } from '@/types/document'

type ProofreadPanelProps = {
  result: ProofreadResponse
  acceptedIds: Set<string>
  onApplyAccepted: (text: string) => void
}

export function ProofreadPanel({
  result,
  acceptedIds,
  onApplyAccepted,
}: ProofreadPanelProps) {
  const appliedText = applyAllSuggestions(
    result.original,
    result.suggestions,
    acceptedIds,
  )

  const handleApply = () => {
    onApplyAccepted(
      acceptedIds.size > 0 ? appliedText : result.corrected,
    )
  }

  return (
    <Card elevated>
      <CardHeader>
        <CardTitle className="text-base">校正結果</CardTitle>
        <p className="text-caption">
          文体一致度: {result.writingStyleMatch}% ・ 提案 {result.suggestions.length}件
        </p>
      </CardHeader>
      <CardBody>
        <div className="grid gap-md lg:grid-cols-2">
          <div>
            <p className="mb-xs text-xs font-medium text-muted-foreground">校正前</p>
            <div className="max-h-64 overflow-y-auto rounded-lg border border-border bg-background p-md text-sm whitespace-pre-wrap">
              {result.original}
            </div>
          </div>
          <div>
            <p className="mb-xs text-xs font-medium text-muted-foreground">校正後</p>
            <div className="max-h-64 overflow-y-auto rounded-lg border border-primary/30 bg-primary/5 p-md text-sm whitespace-pre-wrap">
              {acceptedIds.size > 0 ? appliedText : result.corrected}
            </div>
          </div>
        </div>

        <div className="mt-md flex flex-wrap gap-sm">
          <Button type="button" onClick={handleApply}>
            {acceptedIds.size > 0 ? '選択した提案を適用' : '校正結果をエディターに反映'}
          </Button>
        </div>
      </CardBody>
    </Card>
  )
}
