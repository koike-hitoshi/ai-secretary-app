import {
  createTranscription,
  estimateTranscriptionSeconds,
  extractTranscriptText,
  getTranscriptionStatus,
  mapAssemblyStatusToProgress,
  uploadAudio,
} from '@/lib/transcription/assemblyai'
import {
  encodeJobMeta,
  parseJobMeta,
} from '@/lib/transcription/transcriptionQueue'
import {
  formatMinutesSections,
  generateMinutes,
} from '@/lib/minutes/minutesGenerator'
import {
  deleteFromStorage,
  getSignedUrl,
  uploadToStorage,
} from '@/lib/storage/audioStorage'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  createMeetingMinutesDocument,
  deleteDocument,
  getMeetingMinutesById,
  listMeetingMinutes,
  updateMeetingMinutes,
} from '@/lib/supabase/documents'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import type {
  MinutesListItem,
  MinutesRecord,
  TranscribeResponse,
  TranscriptionJob,
  UploadResponse,
} from '@/types/minutes'

type Supabase = SupabaseClient<Database>

function mapMinutesRow(row: {
  id: string
  title: string
  transcript: string | null
  discussed: string | null
  decisions: string | null
  next_actions: string | null
  audio_storage_path: string | null
  created_at: string
  updated_at: string
}): MinutesRecord {
  return {
    id: row.id,
    title: row.title,
    transcript: row.transcript,
    discussed: row.discussed,
    decisions: row.decisions,
    nextActions: row.next_actions,
    audioStoragePath: row.audio_storage_path,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapListItem(row: {
  id: string
  title: string
  transcript: string | null
  discussed: string | null
  decisions: string | null
  created_at: string
  updated_at: string
}): MinutesListItem {
  const job = parseJobMeta(row.transcript)
  const hasTranscript =
    Boolean(row.transcript) && !job && row.transcript !== null
  return {
    id: row.id,
    title: row.title,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    hasTranscript,
    hasSummary: Boolean(row.discussed || row.decisions),
  }
}

export async function uploadAudioFile(
  userId: string,
  file: File,
): Promise<UploadResponse> {
  const admin = createAdminClient()
  const path = await uploadToStorage(admin, userId, file)

  return {
    uploadId: path,
    status: 'uploaded',
    fileSize: file.size,
    estimatedTime: estimateTranscriptionSeconds(file.size),
  }
}

async function createAssemblyTranscriptFromStorage(
  admin: ReturnType<typeof createAdminClient>,
  uploadId: string,
): Promise<string> {
  // Supabase の署名付き URL を AssemblyAI に直接渡す（二重アップロードを避ける）
  const signedUrl = await getSignedUrl(admin, uploadId, 6 * 3600)

  try {
    return await createTranscription(signedUrl)
  } catch {
    // 署名 URL が使えない場合は AssemblyAI に直接アップロード
    const response = await fetch(signedUrl)
    if (!response.ok) {
      throw new Error('ストレージから音声ファイルを取得できませんでした')
    }
    const buffer = Buffer.from(await response.arrayBuffer())
    const assemblyUploadUrl = await uploadAudio(buffer)
    return createTranscription(assemblyUploadUrl)
  }
}

export async function startTranscription(
  supabase: Supabase,
  userId: string,
  uploadId: string,
  meetingTitle?: string,
): Promise<TranscribeResponse> {
  const admin = createAdminClient()
  const assemblyaiId = await createAssemblyTranscriptFromStorage(admin, uploadId)

  const minutes = await createMeetingMinutesDocument(supabase, userId, {
    title: meetingTitle?.trim() || '無題の議事録',
    audio_storage_path: uploadId,
    transcript: encodeJobMeta({
      assemblyaiId,
      status: 'processing',
      progress: 10,
    }),
  })

  return {
    transcriptionId: assemblyaiId,
    minutesId: minutes.id,
    status: 'processing',
    progress: 10,
  }
}

function completedJobFromRow(
  minutesId: string,
  transcript: string | null,
): TranscriptionJob {
  return {
    minutesId,
    assemblyaiId: '',
    status: 'completed',
    progress: 100,
    result: transcript ?? undefined,
  }
}

async function refreshRowIfCompleted(
  supabase: Supabase,
  userId: string,
  minutesId: string,
): Promise<TranscriptionJob | null> {
  const row = await getMeetingMinutesById(supabase, userId, minutesId)
  if (!parseJobMeta(row.transcript)) {
    return completedJobFromRow(minutesId, row.transcript)
  }
  return null
}

export async function pollTranscription(
  supabase: Supabase,
  userId: string,
  minutesId: string,
): Promise<TranscriptionJob> {
  const row = await getMeetingMinutesById(supabase, userId, minutesId)
  const meta = parseJobMeta(row.transcript)

  if (!meta) {
    return completedJobFromRow(minutesId, row.transcript)
  }

  const transcript = await getTranscriptionStatus(meta.assemblyaiId)
  const progress = mapAssemblyStatusToProgress(transcript.status)
  const text = extractTranscriptText(transcript)

  if (transcript.status === 'completed') {
    if (!text) {
      const error = '文字起こし結果が空でした。音声が認識できなかった可能性があります。'
      await updateMeetingMinutes(supabase, userId, minutesId, {
        transcript: encodeJobMeta({
          ...meta,
          status: 'failed',
          progress: 0,
          error,
        }),
      })

      return {
        minutesId,
        assemblyaiId: meta.assemblyaiId,
        status: 'failed',
        progress: 0,
        error,
      }
    }

    await updateMeetingMinutes(supabase, userId, minutesId, {
      transcript: text,
    })

    return {
      minutesId,
      assemblyaiId: meta.assemblyaiId,
      status: 'completed',
      progress: 100,
      result: text,
    }
  }

  // ステータスが processing でもテキストが返る場合がある
  if (text && transcript.status === 'processing') {
    await updateMeetingMinutes(supabase, userId, minutesId, {
      transcript: text,
    })

    return {
      minutesId,
      assemblyaiId: meta.assemblyaiId,
      status: 'completed',
      progress: 100,
      result: text,
    }
  }

  if (transcript.status === 'error') {
    const error = transcript.error ?? '文字起こしに失敗しました'
    await updateMeetingMinutes(supabase, userId, minutesId, {
      transcript: encodeJobMeta({
        ...meta,
        status: 'failed',
        progress: 0,
        error,
      }),
    })

    return {
      minutesId,
      assemblyaiId: meta.assemblyaiId,
      status: 'failed',
      progress: 0,
      error,
    }
  }

  const alreadyCompleted = await refreshRowIfCompleted(
    supabase,
    userId,
    minutesId,
  )
  if (alreadyCompleted) {
    return alreadyCompleted
  }

  const status = transcript.status === 'queued' ? 'pending' : 'processing'
  await updateMeetingMinutes(supabase, userId, minutesId, {
    transcript: encodeJobMeta({
      ...meta,
      status,
      progress,
    }),
  })

  return {
    minutesId,
    assemblyaiId: meta.assemblyaiId,
    status,
    progress,
  }
}

export async function generateMinutesFromTranscript(
  supabase: Supabase,
  userId: string,
  minutesId: string,
  transcriptionText?: string,
) {
  const row = await getMeetingMinutesById(supabase, userId, minutesId)
  const text = transcriptionText ?? row.transcript

  if (!text || parseJobMeta(text)) {
    throw new Error('文字起こしが完了していません')
  }

  const content = await generateMinutes(text, row.title)
  const sections = formatMinutesSections(content)

  const updated = await updateMeetingMinutes(supabase, userId, minutesId, {
    transcript: text,
    discussed: sections.discussed,
    decisions: sections.decisions,
    next_actions: sections.nextActions,
  })

  return {
    minutesId: updated.id,
    minutes: content,
    record: mapMinutesRow(updated),
  }
}

export async function getMinutes(
  supabase: Supabase,
  userId: string,
  minutesId: string,
): Promise<MinutesRecord> {
  const row = await getMeetingMinutesById(supabase, userId, minutesId)
  return mapMinutesRow(row)
}

export async function listMinutes(
  supabase: Supabase,
  userId: string,
  page: number,
  limit: number,
  search?: string,
) {
  const { items, total } = await listMeetingMinutes(supabase, userId, {
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

export async function updateMinutes(
  supabase: Supabase,
  userId: string,
  minutesId: string,
  input: {
    title?: string
    discussed?: string
    decisions?: string
    nextActions?: string
    transcript?: string
  },
) {
  const updated = await updateMeetingMinutes(supabase, userId, minutesId, {
    title: input.title,
    discussed: input.discussed,
    decisions: input.decisions,
    next_actions: input.nextActions,
    transcript: input.transcript,
  })

  return mapMinutesRow(updated)
}

export async function removeMinutes(
  supabase: Supabase,
  userId: string,
  minutesId: string,
) {
  const row = await getMeetingMinutesById(supabase, userId, minutesId)

  if (row.audio_storage_path) {
    try {
      const admin = createAdminClient()
      await deleteFromStorage(admin, row.audio_storage_path)
    } catch {
      // ストレージ削除失敗は DB 削除を妨げない
    }
  }

  await deleteDocument(supabase, userId, 'minutes', minutesId)
}
