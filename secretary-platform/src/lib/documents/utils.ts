import type { Json } from '@/types/database'
import type { ProofreadHistoryItem, Suggestion, WritingStyleProfile } from '@/types/document'
import type { Tables } from '@/types/database'

const DRAFT_STORAGE_KEY = 'proofread-draft-v1'

export type ProofreadDraft = {
  content: string
  documentType: string
  applyUserStyle: boolean
  savedAt: string
}

export const DOCUMENT_TEMPLATES: Record<
  string,
  { label: string; content: string }
> = {
  email: {
    label: 'メール',
    content: `件名: \n\nお世話になっております。\n\n[本文を入力してください]\n\n何卒よろしくお願いいたします。`,
  },
  report: {
    label: '報告書',
    content: `【報告書】\n\n1. 概要\n\n2. 実施内容\n\n3. 結果・所感\n\n4. 今後の予定`,
  },
  proposal: {
    label: '提案書',
    content: `【提案書】\n\n■ 背景・課題\n\n■ 提案内容\n\n■ 期待効果\n\n■ スケジュール`,
  },
}

export function saveDraft(draft: Omit<ProofreadDraft, 'savedAt'>): void {
  if (typeof window === 'undefined') return
  const payload: ProofreadDraft = { ...draft, savedAt: new Date().toISOString() }
  localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(payload))
}

export function loadDraft(): ProofreadDraft | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as ProofreadDraft
  } catch {
    return null
  }
}

export function clearDraft(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(DRAFT_STORAGE_KEY)
}

export function parseSuggestions(value: Json | null): Suggestion[] {
  if (!value || !Array.isArray(value)) return []
  return value as unknown as Suggestion[]
}

export function mapProofreadingRow(
  row: Tables<'proofreading_history'>,
): ProofreadHistoryItem {
  return {
    id: row.id,
    original: row.original_text,
    corrected: row.corrected_text,
    suggestions: parseSuggestions(row.suggestions),
    createdAt: row.created_at,
  }
}

export function mapWritingStyleRow(
  row: Tables<'writing_style_profiles'> | null,
  meta?: {
    formalityLevel?: number | null
    averageSentenceLength?: number | null
    commonPhrases?: string[]
  },
): WritingStyleProfile | null {
  if (!row) return null

  const samples = Array.isArray(row.sample_excerpts)
    ? (row.sample_excerpts as string[])
    : []

  return {
    toneDescription: row.tone_description,
    sampleExcerpts: samples,
    analyzedAt: row.analyzed_at,
    sampleCount: samples.length,
    formalityLevel: meta?.formalityLevel ?? null,
    averageSentenceLength: meta?.averageSentenceLength ?? null,
    commonPhrases: meta?.commonPhrases ?? [],
  }
}

export function highlightDiff(original: string, corrected: string): string {
  if (original === corrected) return corrected

  const originalWords = original.split(/(\s+)/)
  const correctedWords = corrected.split(/(\s+)/)
  const parts: string[] = []

  const maxLen = Math.max(originalWords.length, correctedWords.length)
  for (let i = 0; i < maxLen; i += 1) {
    const a = originalWords[i] ?? ''
    const b = correctedWords[i] ?? ''
    if (a === b) {
      parts.push(b)
    } else if (b) {
      parts.push(`<mark class="bg-primary/30 rounded-sm px-0.5">${b}</mark>`)
    }
  }

  return parts.join('')
}
