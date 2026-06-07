import type { MinutesContent } from '@/types/minutes'

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'

type AiMinutesResult = {
  discussedTopics?: string[]
  decisions?: string[]
  nextActions?: Array<{
    task?: string
    assignee?: string
    dueDate?: string
  }>
}

function getOpenAIApiKey(): string {
  const key = process.env.OPENAI_API_KEY
  if (!key) {
    throw new Error('OPENAI_API_KEY が未設定です')
  }
  return key
}

function getModel(): string {
  return process.env.OPENAI_MODEL ?? 'gpt-4o-mini'
}

export async function generateMinutes(
  transcription: string,
  title = '議事録',
): Promise<MinutesContent> {
  const trimmed = transcription.trim()
  if (!trimmed) {
    throw new Error('文字起こしテキストが空です')
  }

  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getOpenAIApiKey()}`,
    },
    body: JSON.stringify({
      model: getModel(),
      response_format: { type: 'json_object' },
      temperature: 0.2,
      messages: [
        {
          role: 'system',
          content: `あなたは議事録作成の専門家です。文字起こしから議事録を作成し、次のJSON形式のみで応答してください:
{
  "discussedTopics": ["議論ポイント1", ...],
  "decisions": ["決定事項1", ...],
  "nextActions": [{ "task": "タスク", "assignee": "担当者（任意）", "dueDate": "期限（任意・YYYY-MM-DD）" }]
}
各配列は日本語で、実際の内容に基づいて作成してください。`,
        },
        {
          role: 'user',
          content: `会議名: ${title}\n\n文字起こし:\n${trimmed.slice(0, 50000)}`,
        },
      ],
    }),
  })

  const payload = (await response.json()) as {
    error?: { message?: string }
    choices?: Array<{ message?: { content?: string } }>
  }

  if (!response.ok) {
    throw new Error(payload.error?.message ?? '議事録の生成に失敗しました')
  }

  const content = payload.choices?.[0]?.message?.content
  if (!content) {
    throw new Error('OpenAI からの応答が空です')
  }

  const result = JSON.parse(content) as AiMinutesResult

  return {
    discussedTopics: Array.isArray(result.discussedTopics)
      ? result.discussedTopics
      : [],
    decisions: Array.isArray(result.decisions) ? result.decisions : [],
    nextActions: Array.isArray(result.nextActions)
      ? result.nextActions.map((item) => ({
          task: item.task ?? '',
          assignee: item.assignee,
          dueDate: item.dueDate,
        }))
      : [],
  }
}

export function formatMinutesSections(content: MinutesContent): {
  discussed: string
  decisions: string
  nextActions: string
} {
  return {
    discussed: content.discussedTopics.map((t) => `・${t}`).join('\n'),
    decisions: content.decisions.map((d) => `・${d}`).join('\n'),
    nextActions: content.nextActions
      .map((a) => {
        const parts = [`・${a.task}`]
        if (a.assignee) parts.push(`担当: ${a.assignee}`)
        if (a.dueDate) parts.push(`期限: ${a.dueDate}`)
        return parts.join(' / ')
      })
      .join('\n'),
  }
}

export function extractKeyPoints(text: string): string[] {
  return text
    .split(/[。\n]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20)
    .slice(0, 8)
}
