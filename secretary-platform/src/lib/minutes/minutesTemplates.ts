import type { MinutesRecord } from '@/types/minutes'

export function formatMinutesMarkdown(minutes: MinutesRecord): string {
  const sections = [
    `# ${minutes.title}`,
    '',
    `作成日: ${new Date(minutes.createdAt).toLocaleString('ja-JP')}`,
    '',
  ]

  if (minutes.discussed) {
    sections.push('## 議論された内容', '', minutes.discussed, '')
  }

  if (minutes.decisions) {
    sections.push('## 決定事項', '', minutes.decisions, '')
  }

  if (minutes.nextActions) {
    sections.push('## ネクストアクション', '', minutes.nextActions, '')
  }

  if (minutes.transcript && !minutes.transcript.startsWith('__MINUTES_JOB__:')) {
    sections.push('## 文字起こし全文', '', minutes.transcript, '')
  }

  return sections.join('\n')
}

export function formatMinutesPlainText(minutes: MinutesRecord): string {
  return formatMinutesMarkdown(minutes)
    .replace(/^# /gm, '')
    .replace(/^## /gm, '■ ')
}

export function formatMinutesHtml(minutes: MinutesRecord): string {
  const body = formatMinutesMarkdown(minutes)
    .replace(/^# (.+)$/m, '<h1>$1</h1>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${minutes.title}</title></head><body><p>${body}</p></body></html>`
}
