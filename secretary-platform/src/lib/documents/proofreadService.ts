import { analyzeWritingStyle, proofreadText } from '@/lib/ai/openai'
import { mapProofreadingRow, mapWritingStyleRow } from '@/lib/documents/utils'
import {
  analysisToStyle,
  buildStyleHint,
  mergeStyleSamples,
} from '@/lib/writing-style/styleAnalyzer'
import { adaptSuggestions } from '@/lib/writing-style/styleApplicator'
import {
  createProofreadingDocument,
  deleteDocument,
  listProofreadingHistory,
} from '@/lib/supabase/documents'
import { getWritingStyleProfile, upsertWritingStyleProfile } from '@/lib/supabase/users'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database, Json } from '@/types/database'
import type {
  DocumentType,
  ProofreadResponse,
  WritingStyleProfile,
} from '@/types/document'

type Supabase = SupabaseClient<Database>

const STYLE_META_KEY = '_style_meta'

type StyleMeta = {
  formalityLevel: number
  averageSentenceLength: number
  commonPhrases: string[]
  vocabulary: string[]
}

function parseStyleMeta(samples: string[]): {
  excerpts: string[]
  meta: StyleMeta | null
} {
  if (samples.length === 0) return { excerpts: [], meta: null }

  const last = samples[samples.length - 1]
  if (last?.startsWith(STYLE_META_KEY)) {
    try {
      const meta = JSON.parse(last.slice(STYLE_META_KEY.length)) as StyleMeta
      return { excerpts: samples.slice(0, -1), meta }
    } catch {
      return { excerpts: samples, meta: null }
    }
  }

  return { excerpts: samples, meta: null }
}

function encodeStyleMeta(meta: StyleMeta, excerpts: string[]): Json {
  return [...excerpts, `${STYLE_META_KEY}${JSON.stringify(meta)}`] as unknown as Json
}

export async function getUserWritingStyleProfile(
  supabase: Supabase,
  userId: string,
): Promise<WritingStyleProfile | null> {
  const row = await getWritingStyleProfile(supabase, userId)
  if (!row) return null

  const samples = Array.isArray(row.sample_excerpts)
    ? (row.sample_excerpts as string[])
    : []
  const { excerpts, meta } = parseStyleMeta(samples)

  return mapWritingStyleRow(
    { ...row, sample_excerpts: excerpts as Json },
    meta
      ? {
          formalityLevel: meta.formalityLevel,
          averageSentenceLength: meta.averageSentenceLength,
          commonPhrases: meta.commonPhrases,
        }
      : undefined,
  )
}

export async function runProofread(
  supabase: Supabase,
  userId: string,
  input: {
    content: string
    documentType: DocumentType
    applyUserStyle: boolean
  },
): Promise<ProofreadResponse> {
  const profile = input.applyUserStyle
    ? await getUserWritingStyleProfile(supabase, userId)
    : null

  const style =
    profile && profile.toneDescription
      ? analysisToStyle({
          toneDescription: profile.toneDescription,
          formalityLevel: profile.formalityLevel ?? 3,
          averageSentenceLength: profile.averageSentenceLength ?? 40,
          commonPhrases: profile.commonPhrases,
          vocabulary: [],
        })
      : null

  const styleHint = input.applyUserStyle ? buildStyleHint(style) : null

  const proofreadResult = await proofreadText(
    input.content,
    input.documentType,
    styleHint,
  )
  const { corrected, writingStyleMatch } = proofreadResult
  const suggestions = style
    ? adaptSuggestions(proofreadResult.suggestions, style)
    : proofreadResult.suggestions

  const saved = await createProofreadingDocument(supabase, userId, {
    original_text: input.content,
    corrected_text: corrected,
    suggestions: suggestions as unknown as Json,
  })

  return {
    documentId: saved.id,
    original: input.content,
    corrected,
    suggestions,
    writingStyleMatch,
    createdAt: saved.created_at,
  }
}

export async function runWritingStyleAnalysis(
  supabase: Supabase,
  userId: string,
  samples: string[],
) {
  const existing = await getWritingStyleProfile(supabase, userId)
  const existingSamples = Array.isArray(existing?.sample_excerpts)
    ? (existing.sample_excerpts as string[])
    : []
  const { excerpts: existingExcerpts } = parseStyleMeta(existingSamples)

  const mergedSamples = mergeStyleSamples(existingExcerpts, samples)
  const analysis = await analyzeWritingStyle(mergedSamples)

  const meta: StyleMeta = {
    formalityLevel: analysis.formalityLevel,
    averageSentenceLength: analysis.averageSentenceLength,
    commonPhrases: analysis.commonPhrases,
    vocabulary: analysis.vocabulary,
  }

  const analyzedAt = new Date().toISOString()
  const row = await upsertWritingStyleProfile(supabase, userId, {
    toneDescription: analysis.toneDescription,
    sampleExcerpts: encodeStyleMeta(meta, mergedSamples),
    analyzedAt,
  })

  return mapWritingStyleRow(row, {
    formalityLevel: meta.formalityLevel,
    averageSentenceLength: meta.averageSentenceLength,
    commonPhrases: meta.commonPhrases,
  })
}

export async function deleteProofreadHistoryItem(
  supabase: Supabase,
  userId: string,
  documentId: string,
): Promise<void> {
  await deleteDocument(supabase, userId, 'proofread', documentId)
}

export async function getProofreadHistory(
  supabase: Supabase,
  userId: string,
  page: number,
  limit: number,
) {
  const { items, total } = await listProofreadingHistory(supabase, userId, {
    page,
    limit,
  })

  return {
    items: items.map(mapProofreadingRow),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}
