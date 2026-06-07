'use client'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card'
import type { Suggestion, SuggestionType } from '@/types/document'

const TYPE_LABELS: Record<SuggestionType, string> = {
  spelling: '誤字脱字',
  grammar: '文法',
  style: '文体',
  structure: '構成',
}

const TYPE_VARIANTS: Record<
  SuggestionType,
  'destructive' | 'warning' | 'primary' | 'accent'
> = {
  spelling: 'destructive',
  grammar: 'warning',
  style: 'primary',
  structure: 'accent',
}

type ProofreadResultProps = {
  suggestions: Suggestion[]
  acceptedIds: Set<string>
  onToggle: (id: string) => void
  onAcceptAll: () => void
  onRejectAll: () => void
}

export function ProofreadResult({
  suggestions,
  acceptedIds,
  onToggle,
  onAcceptAll,
  onRejectAll,
}: ProofreadResultProps) {
  const grouped = suggestions.reduce(
    (acc, suggestion) => {
      acc[suggestion.type].push(suggestion)
      return acc
    },
    {
      spelling: [] as Suggestion[],
      grammar: [] as Suggestion[],
      style: [] as Suggestion[],
      structure: [] as Suggestion[],
    },
  )

  if (suggestions.length === 0) {
    return (
      <Card>
        <CardBody>
          <p className="text-sm text-muted-foreground">
            修正提案はありません。文章は十分に整っています。
          </p>
        </CardBody>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-md">
      <div className="flex flex-wrap gap-sm">
        <Button type="button" size="sm" variant="secondary" onClick={onAcceptAll}>
          すべて受け入れ
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onRejectAll}>
          すべて却下
        </Button>
      </div>

      {(Object.keys(grouped) as SuggestionType[]).map((type) => {
        const items = grouped[type]
        if (items.length === 0) return null

        return (
          <Card key={type}>
            <CardHeader>
              <CardTitle className="flex items-center gap-sm text-base">
                <Badge variant={TYPE_VARIANTS[type]}>{TYPE_LABELS[type]}</Badge>
                <span className="text-muted-foreground">{items.length}件</span>
              </CardTitle>
            </CardHeader>
            <CardBody>
              <ul className="flex flex-col gap-md">
                {items.map((suggestion) => {
                  const accepted = acceptedIds.has(suggestion.id)
                  return (
                    <li
                      key={suggestion.id}
                      className="rounded-lg border border-border bg-surface-elevated p-md"
                    >
                      <div className="mb-sm flex flex-wrap items-center justify-between gap-sm">
                        <span className="text-xs text-muted-foreground">
                          信頼度 {Math.round(suggestion.confidence * 100)}%
                        </span>
                        <Button
                          type="button"
                          size="sm"
                          variant={accepted ? 'primary' : 'outline'}
                          onClick={() => onToggle(suggestion.id)}
                        >
                          {accepted ? '受け入れ済み' : '受け入れる'}
                        </Button>
                      </div>
                      <p className="text-sm">
                        <span className="text-muted-foreground line-through">
                          {suggestion.original || '（該当箇所）'}
                        </span>
                        {' → '}
                        <span className="font-medium text-foreground">
                          {suggestion.suggested}
                        </span>
                      </p>
                      {suggestion.explanation && (
                        <p className="mt-xs text-caption">{suggestion.explanation}</p>
                      )}
                    </li>
                  )
                })}
              </ul>
            </CardBody>
          </Card>
        )
      })}
    </div>
  )
}
