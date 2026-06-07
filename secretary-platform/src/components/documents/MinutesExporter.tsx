'use client'

import { Button } from '@/components/ui/Button'
import {
  formatMinutesHtml,
  formatMinutesMarkdown,
  formatMinutesPlainText,
} from '@/lib/minutes/minutesTemplates'
import type { ExportFormat, MinutesRecord } from '@/types/minutes'

type MinutesExporterProps = {
  record: MinutesRecord
}

function downloadBlob(content: string, fileName: string, mime: string) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()
  URL.revokeObjectURL(url)
}

export function MinutesExporter({ record }: MinutesExporterProps) {
  const baseName = record.title.replace(/[^\w\u3040-\u30ff\u4e00-\u9faf-]+/g, '_')

  const exportAs = (format: ExportFormat) => {
    switch (format) {
      case 'markdown':
        downloadBlob(
          formatMinutesMarkdown(record),
          `${baseName}.md`,
          'text/markdown;charset=utf-8',
        )
        break
      case 'text':
        downloadBlob(
          formatMinutesPlainText(record),
          `${baseName}.txt`,
          'text/plain;charset=utf-8',
        )
        break
      case 'word':
        downloadBlob(
          formatMinutesHtml(record),
          `${baseName}.doc`,
          'application/msword',
        )
        break
      case 'pdf':
        downloadBlob(
          formatMinutesHtml(record),
          `${baseName}.html`,
          'text/html;charset=utf-8',
        )
        window.open('', '_blank')?.document?.write(formatMinutesHtml(record))
        break
    }
  }

  return (
    <div className="flex flex-wrap gap-sm">
      <Button type="button" size="sm" variant="outline" onClick={() => exportAs('markdown')}>
        Markdown
      </Button>
      <Button type="button" size="sm" variant="outline" onClick={() => exportAs('text')}>
        Plain Text
      </Button>
      <Button type="button" size="sm" variant="outline" onClick={() => exportAs('word')}>
        Word
      </Button>
      <Button type="button" size="sm" variant="outline" onClick={() => exportAs('pdf')}>
        HTML/PDF
      </Button>
    </div>
  )
}
