const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'
const DEFAULT_MODEL = 'gpt-4o-mini'

export const MAX_RESEARCH_THEME_LENGTH = 500

function getOpenAIApiKey(): string {
  const key = process.env.OPENAI_API_KEY
  if (!key) {
    throw new Error(
      'OPENAI_API_KEY が未設定です。.env.local に API キーを追加してください。',
    )
  }
  return key
}

function getModel(): string {
  return process.env.OPENAI_MODEL ?? DEFAULT_MODEL
}

function sanitizeTheme(theme: string): string {
  return theme.trim().replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
}

export async function optimizeResearchPrompt(theme: string): Promise<string> {
  const sanitized = sanitizeTheme(theme)
  if (!sanitized) {
    throw new Error('リサーチテーマを入力してください')
  }
  if (sanitized.length > MAX_RESEARCH_THEME_LENGTH) {
    throw new Error(
      `テーマが長すぎます（最大 ${MAX_RESEARCH_THEME_LENGTH} 文字）`,
    )
  }

  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getOpenAIApiKey()}`,
    },
    body: JSON.stringify({
      model: getModel(),
      messages: [
        {
          role: 'system',
          content: `あなたはリサーチプロンプトの最適化専門家です。
ユーザーが入力したテーマを、Web検索AI（Perplexity）向けの効果的な調査プロンプトに変換してください。

ルール:
- 日本語で出力する
- 調査すべき観点・キーワードを明確にする
- 最新情報・主要な論点・実務的な示唆を求める構成にする
- プロンプト本文のみを返す（説明や前置きは不要）
- 500文字以内`,
        },
        {
          role: 'user',
          content: `テーマ: ${sanitized}`,
        },
      ],
      temperature: 0.4,
    }),
  })

  const payload = (await response.json()) as {
    error?: { message?: string }
    choices?: Array<{ message?: { content?: string } }>
  }

  if (!response.ok) {
    throw new Error(
      payload.error?.message ?? `OpenAI API エラー (${response.status})`,
    )
  }

  const optimized = payload.choices?.[0]?.message?.content?.trim()
  if (!optimized) {
    throw new Error('プロンプトの最適化に失敗しました')
  }

  return optimized
}
