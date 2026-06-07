import type { ResearchSource } from '@/types/research'

const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions'
const DEFAULT_MODEL = 'sonar'
const FETCH_TIMEOUT_MS = 120_000

type PerplexitySearchResult = {
  title?: string
  url?: string
  snippet?: string
}

type PerplexityCompletionResponse = {
  choices?: Array<{ message?: { content?: string } }>
  citations?: string[]
  search_results?: PerplexitySearchResult[]
  error?: { message?: string }
}

function getApiKey(): string {
  const key = process.env.PERPLEXITY_API_KEY
  if (!key) {
    throw new Error(
      'PERPLEXITY_API_KEY が未設定です。.env.local に API キーを追加してください。',
    )
  }
  return key
}

function getModel(): string {
  return process.env.PERPLEXITY_MODEL ?? DEFAULT_MODEL
}

function titleFromUrl(url: string): string {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, '')
    return hostname
  } catch {
    return url
  }
}

function buildSources(
  citations: string[],
  searchResults: PerplexitySearchResult[],
): ResearchSource[] {
  const resultByUrl = new Map<string, PerplexitySearchResult>()
  for (const item of searchResults) {
    if (item.url) {
      resultByUrl.set(item.url, item)
    }
  }

  return citations.map((url) => {
    const match = resultByUrl.get(url)
    return {
      url,
      title: match?.title?.trim() || titleFromUrl(url),
      snippet: match?.snippet?.trim() || undefined,
    }
  })
}

export async function searchWithPerplexity(prompt: string): Promise<{
  summary: string
  sources: ResearchSource[]
}> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  let response: Response
  try {
    response = await fetch(PERPLEXITY_API_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getApiKey()}`,
      },
      body: JSON.stringify({
        model: getModel(),
        messages: [
          {
            role: 'system',
            content:
              'あなたは調査アシスタントです。日本語で正確かつ簡潔に回答し、事実に基づいた情報を提供してください。箇条書きを適宜使い、重要なポイントを整理してください。',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.2,
        language_preference: 'ja',
      }),
    })
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('Perplexity API への接続がタイムアウトしました')
    }
    throw err
  } finally {
    clearTimeout(timeoutId)
  }

  const payload = (await response.json()) as PerplexityCompletionResponse

  if (!response.ok) {
    throw new Error(
      payload.error?.message ?? `Perplexity API エラー (${response.status})`,
    )
  }

  const summary = payload.choices?.[0]?.message?.content?.trim()
  if (!summary) {
    throw new Error('Perplexity からの応答が空です')
  }

  const citations = payload.citations ?? []
  const searchResults = payload.search_results ?? []
  const sources = buildSources(citations, searchResults)

  return { summary, sources }
}
