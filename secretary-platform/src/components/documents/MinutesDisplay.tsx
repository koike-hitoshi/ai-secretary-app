'use client'

import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card'
import type { MinutesRecord } from '@/types/minutes'

type MinutesDisplayProps = {
  record: MinutesRecord
}

function Section({
  title,
  content,
}: {
  title: string
  content: string | null
}) {
  if (!content?.trim()) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardBody>
        <p className="whitespace-pre-wrap text-sm text-foreground">{content}</p>
      </CardBody>
    </Card>
  )
}

export function MinutesDisplay({ record }: MinutesDisplayProps) {
  return (
    <div className="flex flex-col gap-md">
      <Section title="議論された内容" content={record.discussed} />
      <Section title="決定事項" content={record.decisions} />
      <Section title="ネクストアクション" content={record.nextActions} />
      {record.transcript && !record.transcript.startsWith('__MINUTES_JOB__:') && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">文字起こし全文</CardTitle>
          </CardHeader>
          <CardBody>
            <p className="max-h-64 overflow-y-auto whitespace-pre-wrap text-sm text-muted-foreground">
              {record.transcript}
            </p>
          </CardBody>
        </Card>
      )}
    </div>
  )
}
