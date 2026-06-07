import type { TranscriptionStatus } from '@/types/minutes'

const JOB_PREFIX = '__MINUTES_JOB__:'

export type MinutesJobMeta = {
  assemblyaiId: string
  status: TranscriptionStatus
  progress: number
  error?: string
}

export function encodeJobMeta(meta: MinutesJobMeta): string {
  return `${JOB_PREFIX}${JSON.stringify(meta)}`
}

export function parseJobMeta(transcript: string | null): MinutesJobMeta | null {
  if (!transcript?.startsWith(JOB_PREFIX)) return null

  try {
    return JSON.parse(transcript.slice(JOB_PREFIX.length)) as MinutesJobMeta
  } catch {
    return null
  }
}

export function isProcessingTranscript(transcript: string | null): boolean {
  const meta = parseJobMeta(transcript)
  return meta !== null && meta.status !== 'completed' && meta.status !== 'failed'
}
