'use client'

import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card'
import type { ResearchRecord } from '@/types/research'

type ResearchResultProps = {
  record: ResearchRecord
  showPrompt?: boolean
}

export function ResearchResult({
  record,
  showPrompt = false,
}: ResearchResultProps) {
  return (
    <div className="flex flex-col gap-md">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">調査結果</CardTitle>
        </CardHeader>
        <CardBody className="flex flex-col gap-md">
          <div>
            <p className="mb-xs text-xs font-medium text-muted-foreground">
              テーマ
            </p>
            <p className="text-sm text-foreground">{record.theme}</p>
          </div>

          {showPrompt && record.generatedPrompt && (
            <div>
              <p className="mb-xs text-xs font-medium text-muted-foreground">
                最適化プロンプト
              </p>
              <p className="whitespace-pre-wrap text-sm text-foreground">
                {record.generatedPrompt}
              </p>
            </div>
          )}

          <div>
            <p className="mb-xs text-xs font-medium text-muted-foreground">
              要約
            </p>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
              {record.summary ?? '要約がありません'}
            </p>
          </div>
        </CardBody>
      </Card>

      {record.sources.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              出典（{record.sources.length}件）
            </CardTitle>
          </CardHeader>
          <CardBody>
            <ul className="flex flex-col gap-sm">
              {record.sources.map((source, index) => (
                <li
                  key={`${source.url}-${index}`}
                  className="rounded-lg border border-border bg-surface-elevated p-md"
                >
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    {source.title || source.url}
                  </a>
                  {source.snippet && (
                    <p className="mt-xs text-caption text-muted-foreground">
                      {source.snippet}
                    </p>
                  )}
                  <p className="mt-xs truncate text-caption text-muted-foreground">
                    {source.url}
                  </p>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      )}
    </div>
  )
}
