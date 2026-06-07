import {
  buildProofreadSystemPrompt,
  buildProofreadUserPrompt,
  buildWritingStyleSystemPrompt,
  buildWritingStyleUserPrompt,
} from '@/lib/ai/prompts'
import type {
  DocumentType,
  Suggestion,
  WritingStyleAnalysis,
} from '@/types/document'

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'
const DEFAULT_MODEL = 'gpt-4o-mini'
export const MAX_PROOFREAD_LENGTH = 12_000

type ChatMessage = {
  role: 'system' | 'user'
  content: string
}

type ProofreadAiResult = {
  corrected: string
  suggestions: Array<{
    id?: string
    type?: string
    original?: string
    suggested?: string
    explanation?: string
    confidence?: number
  }>
  writingStyleMatch?: number
}

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

async function chatCompletionJson<T>(
  messages: ChatMessage[],
): Promise<T> {
  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getOpenAIApiKey()}`,
    },
    body: JSON.stringify({
      model: getModel(),
      messages,
      response_format: { type: 'json_object' },
      temperature: 0.3,
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

  const content = payload.choices?.[0]?.message?.content
  if (!content) {
    throw new Error('OpenAI からの応答が空です')
  }

  return JSON.parse(content) as T
}

const VALID_SUGGESTION_TYPES = new Set([
  'spelling',
  'grammar',
  'style',
  'structure',
])

function normalizeSuggestionType(value: string | undefined): Suggestion['type'] {
  if (value && VALID_SUGGESTION_TYPES.has(value)) {
    return value as Suggestion['type']
  }
  return 'style'
}

export function enrichSuggestions(
  original: string,
  raw: ProofreadAiResult['suggestions'],
): Suggestion[] {
  return (raw ?? []).map((item, index) => {
    const snippet = item.original ?? ''
    const start = snippet ? original.indexOf(snippet) : -1
    const end = start >= 0 ? start + snippet.length : 0

    return {
      id: item.id ?? `suggestion-${index + 1}`,
      type: normalizeSuggestionType(item.type),
      original: snippet,
      suggested: item.suggested ?? '',
      explanation: item.explanation ?? '',
      position: {
        start: start >= 0 ? start : 0,
        end: start >= 0 ? end : 0,
      },
      confidence:
        typeof item.confidence === 'number'
          ? Math.min(1, Math.max(0, item.confidence))
          : 0.8,
    }
  })
}

export async function proofreadText(
  content: string,
  documentType: DocumentType,
  userStyleHint: string | null,
): Promise<{
  corrected: string
  suggestions: Suggestion[]
  writingStyleMatch: number
}> {
  if (content.length > MAX_PROOFREAD_LENGTH) {
    throw new Error(
      `文章が長すぎます（最大 ${MAX_PROOFREAD_LENGTH.toLocaleString()} 文字）`,
    )
  }

  const result = await chatCompletionJson<ProofreadAiResult>([
    { role: 'system', content: buildProofreadSystemPrompt(documentType) },
    {
      role: 'user',
      content: buildProofreadUserPrompt(content, userStyleHint),
    },
  ])

  const corrected = result.corrected?.trim() || content
  const suggestions = enrichSuggestions(content, result.suggestions)
  const writingStyleMatch =
    typeof result.writingStyleMatch === 'number'
      ? Math.min(100, Math.max(0, Math.round(result.writingStyleMatch)))
      : 80

  return { corrected, suggestions, writingStyleMatch }
}

export async function analyzeWritingStyle(
  samples: string[],
): Promise<WritingStyleAnalysis> {
  const trimmed = samples.map((s) => s.trim()).filter(Boolean)
  if (trimmed.length === 0) {
    throw new Error('分析する文章サンプルがありません')
  }

  const result = await chatCompletionJson<WritingStyleAnalysis>([
    { role: 'system', content: buildWritingStyleSystemPrompt() },
    { role: 'user', content: buildWritingStyleUserPrompt(trimmed) },
  ])

  return {
    toneDescription: result.toneDescription ?? '文体の特徴を分析しました',
    formalityLevel:
      typeof result.formalityLevel === 'number'
        ? Math.min(5, Math.max(1, Math.round(result.formalityLevel)))
        : 3,
    averageSentenceLength:
      typeof result.averageSentenceLength === 'number'
        ? Math.round(result.averageSentenceLength)
        : 40,
    commonPhrases: Array.isArray(result.commonPhrases)
      ? result.commonPhrases.slice(0, 8)
      : [],
    vocabulary: Array.isArray(result.vocabulary)
      ? result.vocabulary.slice(0, 10)
      : [],
  }
}
