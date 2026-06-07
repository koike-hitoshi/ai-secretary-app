import { optimizeResearchPrompt } from '@/lib/research/promptOptimizer'
import { searchWithPerplexity } from '@/lib/research/perplexity'
import {
  createResearchDocument,
  deleteDocument,
  getResearchSessionById,
  listResearchSessions,
} from '@/lib/supabase/documents'
import type { Json } from '@/types/database'
import type {
  ResearchListItem,
  ResearchRecord,
  ResearchSource,
} from '@/types/research'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

type Supabase = SupabaseClient<Database>

function parseSources(value: unknown): ResearchSource[] {
  if (!Array.isArray(value)) return []

  return value
    .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
    .map((item) => ({
      url: String(item.url ?? ''),
      title: String(item.title ?? ''),
      snippet: item.snippet ? String(item.snippet) : undefined,
    }))
    .filter((item) => item.url.length > 0)
}

function mapResearchRow(row: {
  id: string
  theme: string
  generated_prompt: string | null
  summary: string | null
  sources: unknown
  created_at: string
}): ResearchRecord {
  return {
    id: row.id,
    theme: row.theme,
    generatedPrompt: row.generated_prompt,
    summary: row.summary,
    sources: parseSources(row.sources),
    createdAt: row.created_at,
  }
}

function mapListItem(row: {
  id: string
  theme: string
  summary: string | null
  sources: unknown
  created_at: string
}): ResearchListItem {
  const sources = parseSources(row.sources)
  const summary = row.summary?.trim() ?? null

  return {
    id: row.id,
    theme: row.theme,
    summaryPreview: summary ? summary.slice(0, 120) : null,
    sourceCount: sources.length,
    createdAt: row.created_at,
  }
}

export async function runResearch(
  supabase: Supabase,
  userId: string,
  theme: string,
): Promise<ResearchRecord> {
  const generatedPrompt = await optimizeResearchPrompt(theme)
  const { summary, sources } = await searchWithPerplexity(generatedPrompt)

  const row = await createResearchDocument(supabase, userId, {
    theme: theme.trim(),
    generated_prompt: generatedPrompt,
    summary,
    sources: sources as unknown as Json,
  })

  return mapResearchRow(row)
}

export async function getResearch(
  supabase: Supabase,
  userId: string,
  id: string,
): Promise<ResearchRecord> {
  const row = await getResearchSessionById(supabase, userId, id)
  return mapResearchRow(row)
}

export async function listResearch(
  supabase: Supabase,
  userId: string,
  page: number,
  limit: number,
  search?: string,
) {
  const { items, total } = await listResearchSessions(supabase, userId, {
    page,
    limit,
    search,
  })

  return {
    items: items.map(mapListItem),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}

export async function removeResearch(
  supabase: Supabase,
  userId: string,
  id: string,
): Promise<void> {
  await deleteDocument(supabase, userId, 'research', id)
}
