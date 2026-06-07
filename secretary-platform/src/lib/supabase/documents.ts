import type { SupabaseClient } from '@supabase/supabase-js'

import { throwIfError, throwOnError } from '@/lib/supabase/errors'
import type { Database, Json, Tables, TablesInsert } from '@/types/database'

type Supabase = SupabaseClient<Database>

export type DocumentType = 'proofread' | 'minutes' | 'research'

export type DocumentSummary = {
  id: string
  type: DocumentType
  title: string
  createdAt: string
}

export type ProofreadingDocument = Tables<'proofreading_history'>
export type MeetingMinutesDocument = Tables<'meeting_minutes'>
export type ResearchDocument = Tables<'research_sessions'>

function mapProofreadingSummary(row: ProofreadingDocument): DocumentSummary {
  const preview = row.original_text.trim().slice(0, 40)
  return {
    id: row.id,
    type: 'proofread',
    title: preview || '校正履歴',
    createdAt: row.created_at,
  }
}

function mapMinutesSummary(row: MeetingMinutesDocument): DocumentSummary {
  return {
    id: row.id,
    type: 'minutes',
    title: row.title,
    createdAt: row.created_at,
  }
}

function mapResearchSummary(row: ResearchDocument): DocumentSummary {
  return {
    id: row.id,
    type: 'research',
    title: row.theme,
    createdAt: row.created_at,
  }
}

export async function listRecentDocuments(
  supabase: Supabase,
  userId: string,
  limit = 20,
): Promise<DocumentSummary[]> {
  const [proofreading, minutes, research] = await Promise.all([
    supabase
      .from('proofreading_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit),
    supabase
      .from('meeting_minutes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit),
    supabase
      .from('research_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit),
  ])

  if (proofreading.error) throwOnError({ data: null, error: proofreading.error })
  if (minutes.error) throwOnError({ data: null, error: minutes.error })
  if (research.error) throwOnError({ data: null, error: research.error })

  return [
    ...(proofreading.data ?? []).map(mapProofreadingSummary),
    ...(minutes.data ?? []).map(mapMinutesSummary),
    ...(research.data ?? []).map(mapResearchSummary),
  ]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, limit)
}

export async function createProofreadingDocument(
  supabase: Supabase,
  userId: string,
  input: Pick<TablesInsert<'proofreading_history'>, 'original_text' | 'corrected_text' | 'suggestions'>,
): Promise<ProofreadingDocument> {
  return throwOnError(
    await supabase
      .from('proofreading_history')
      .insert({
        user_id: userId,
        original_text: input.original_text,
        corrected_text: input.corrected_text ?? null,
        suggestions: (input.suggestions ?? null) as Json | null,
      })
      .select()
      .single(),
  )
}

export async function createMeetingMinutesDocument(
  supabase: Supabase,
  userId: string,
  input: Pick<
    TablesInsert<'meeting_minutes'>,
    'title' | 'transcript' | 'discussed' | 'decisions' | 'next_actions' | 'audio_storage_path'
  >,
): Promise<MeetingMinutesDocument> {
  return throwOnError(
    await supabase
      .from('meeting_minutes')
      .insert({
        user_id: userId,
        title: input.title ?? '無題の議事録',
        transcript: input.transcript ?? null,
        discussed: input.discussed ?? null,
        decisions: input.decisions ?? null,
        next_actions: input.next_actions ?? null,
        audio_storage_path: input.audio_storage_path ?? null,
      })
      .select()
      .single(),
  )
}

export async function createResearchDocument(
  supabase: Supabase,
  userId: string,
  input: Pick<
    TablesInsert<'research_sessions'>,
    'theme' | 'generated_prompt' | 'summary' | 'sources'
  >,
): Promise<ResearchDocument> {
  return throwOnError(
    await supabase
      .from('research_sessions')
      .insert({
        user_id: userId,
        theme: input.theme,
        generated_prompt: input.generated_prompt ?? null,
        summary: input.summary ?? null,
        sources: (input.sources ?? []) as Json,
      })
      .select()
      .single(),
  )
}

export async function listProofreadingHistory(
  supabase: Supabase,
  userId: string,
  options: { page?: number; limit?: number } = {},
): Promise<{ items: ProofreadingDocument[]; total: number }> {
  const page = Math.max(1, options.page ?? 1)
  const limit = Math.min(50, Math.max(1, options.limit ?? 20))
  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data, error, count } = await supabase
    .from('proofreading_history')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) throwOnError({ data: null, error })

  return {
    items: data ?? [],
    total: count ?? 0,
  }
}

export async function listMeetingMinutes(
  supabase: Supabase,
  userId: string,
  options: { page?: number; limit?: number; search?: string } = {},
): Promise<{ items: MeetingMinutesDocument[]; total: number }> {
  const page = Math.max(1, options.page ?? 1)
  const limit = Math.min(50, Math.max(1, options.limit ?? 20))
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase
    .from('meeting_minutes')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  const search = options.search?.trim()
  if (search) {
    query = query.ilike('title', `%${search}%`)
  }

  const { data, error, count } = await query.range(from, to)

  if (error) throwOnError({ data: null, error })

  return {
    items: data ?? [],
    total: count ?? 0,
  }
}

export async function listResearchSessions(
  supabase: Supabase,
  userId: string,
  options: { page?: number; limit?: number; search?: string } = {},
): Promise<{ items: ResearchDocument[]; total: number }> {
  const page = Math.max(1, options.page ?? 1)
  const limit = Math.min(50, Math.max(1, options.limit ?? 20))
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase
    .from('research_sessions')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  const search = options.search?.trim()
  if (search) {
    query = query.or(`theme.ilike.%${search}%,summary.ilike.%${search}%`)
  }

  const { data, error, count } = await query.range(from, to)

  if (error) throwOnError({ data: null, error })

  return {
    items: data ?? [],
    total: count ?? 0,
  }
}

export async function getResearchSessionById(
  supabase: Supabase,
  userId: string,
  sessionId: string,
): Promise<ResearchDocument> {
  return throwOnError(
    await supabase
      .from('research_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('id', sessionId)
      .single(),
  )
}

export async function getMeetingMinutesById(
  supabase: Supabase,
  userId: string,
  minutesId: string,
): Promise<MeetingMinutesDocument> {
  return throwOnError(
    await supabase
      .from('meeting_minutes')
      .select('*')
      .eq('user_id', userId)
      .eq('id', minutesId)
      .single(),
  )
}

export async function updateMeetingMinutes(
  supabase: Supabase,
  userId: string,
  minutesId: string,
  input: Partial<
    Pick<
      TablesInsert<'meeting_minutes'>,
      'title' | 'transcript' | 'discussed' | 'decisions' | 'next_actions'
    >
  >,
): Promise<MeetingMinutesDocument> {
  return throwOnError(
    await supabase
      .from('meeting_minutes')
      .update({
        title: input.title,
        transcript: input.transcript,
        discussed: input.discussed,
        decisions: input.decisions,
        next_actions: input.next_actions,
      })
      .eq('user_id', userId)
      .eq('id', minutesId)
      .select()
      .single(),
  )
}

export async function deleteDocument(
  supabase: Supabase,
  userId: string,
  type: DocumentType,
  documentId: string,
): Promise<void> {
  const table =
    type === 'proofread'
      ? 'proofreading_history'
      : type === 'minutes'
        ? 'meeting_minutes'
        : 'research_sessions'

  throwIfError(
    await supabase
      .from(table)
      .delete()
      .eq('user_id', userId)
      .eq('id', documentId),
  )
}
