const ASSEMBLYAI_API = 'https://api.assemblyai.com/v2'

export type AssemblyTranscriptStatus =
  | 'queued'
  | 'processing'
  | 'completed'
  | 'error'

export type AssemblyTranscript = {
  id: string
  status: AssemblyTranscriptStatus
  text?: string | null
  error?: string | null
  audio_duration?: number | null
  utterances?: Array<{ text?: string }>
}

export function extractTranscriptText(
  transcript: AssemblyTranscript,
): string | null {
  const direct = transcript.text?.trim()
  if (direct) return direct

  if (transcript.utterances?.length) {
    const joined = transcript.utterances
      .map((u) => u.text?.trim())
      .filter(Boolean)
      .join('\n')
    if (joined) return joined
  }

  return null
}

function getApiKey(): string {
  const key = process.env.ASSEMBLYAI_API_KEY
  if (!key) {
    throw new Error(
      'ASSEMBLYAI_API_KEY が未設定です。.env.local に API キーを追加してください。',
    )
  }
  return key
}

const ASSEMBLYAI_FETCH_TIMEOUT_MS = 30_000

async function assemblyFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const controller = new AbortController()
  const timeoutId = setTimeout(
    () => controller.abort(),
    ASSEMBLYAI_FETCH_TIMEOUT_MS,
  )

  let response: Response
  try {
    response = await fetch(`${ASSEMBLYAI_API}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        Authorization: getApiKey(),
        ...(init?.headers ?? {}),
      },
    })
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('AssemblyAI への接続がタイムアウトしました')
    }
    throw err
  } finally {
    clearTimeout(timeoutId)
  }

  const payload = (await response.json()) as T & {
    error?: string | { message?: string }
  }

  if (!response.ok) {
    const raw = (payload as { error?: string | { message?: string } }).error
    const message =
      typeof raw === 'string'
        ? raw
        : raw?.message ?? `AssemblyAI API エラー (${response.status})`
    throw new Error(message)
  }

  return payload
}

export async function uploadAudio(buffer: Buffer): Promise<string> {
  const response = await fetch(`${ASSEMBLYAI_API}/upload`, {
    method: 'POST',
    headers: {
      Authorization: getApiKey(),
      'Content-Type': 'application/octet-stream',
    },
    body: new Uint8Array(buffer),
  })

  const payload = (await response.json()) as { upload_url?: string; error?: string }

  if (!response.ok || !payload.upload_url) {
    throw new Error(payload.error ?? 'AssemblyAI へのアップロードに失敗しました')
  }

  return payload.upload_url
}

export async function createTranscription(audioUrl: string): Promise<string> {
  const payload = await assemblyFetch<{ id: string }>('/transcript', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      audio_url: audioUrl,
      language_code: 'ja',
    }),
  })

  return payload.id
}

export async function getTranscriptionStatus(
  id: string,
): Promise<AssemblyTranscript> {
  return assemblyFetch<AssemblyTranscript>(`/transcript/${id}`)
}

export async function getTranscriptionText(id: string): Promise<string> {
  const transcript = await getTranscriptionStatus(id)

  if (transcript.status === 'error') {
    throw new Error(transcript.error ?? '文字起こしに失敗しました')
  }

  if (transcript.status !== 'completed' || !transcript.text) {
    throw new Error('文字起こしがまだ完了していません')
  }

  return transcript.text
}

export function mapAssemblyStatusToProgress(
  status: AssemblyTranscriptStatus,
): number {
  switch (status) {
    case 'queued':
      return 10
    case 'processing':
      return 55
    case 'completed':
      return 100
    case 'error':
      return 0
    default:
      return 0
  }
}

export function estimateTranscriptionSeconds(fileSizeBytes: number): number {
  // おおよそ 1MB あたり 10 秒と仮定（目安）
  return Math.max(30, Math.round((fileSizeBytes / (1024 * 1024)) * 10))
}
