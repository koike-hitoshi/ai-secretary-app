import type { SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '@/types/database'

type AdminClient = SupabaseClient<Database>

export const AUDIO_BUCKET =
  process.env.SUPABASE_AUDIO_BUCKET ?? 'meeting-audio'

const ALLOWED_EXTENSIONS = new Set(['mp3', 'wav', 'm4a', 'mpeg', 'mp4', 'webm'])
export const MAX_AUDIO_BYTES = 200 * 1024 * 1024 // 200MB（開発向け上限）

export function validateAudioFile(file: File): void {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  const mime = file.type.toLowerCase()

  const validExt = ALLOWED_EXTENSIONS.has(ext)
  const validMime =
    mime.startsWith('audio/') ||
    mime === 'video/mp4' ||
    mime === 'application/octet-stream'

  if (!validExt && !validMime) {
    throw new Error('対応形式は mp3 / wav / m4a です')
  }

  if (file.size > MAX_AUDIO_BYTES) {
    throw new Error(
      `ファイルサイズが上限（${Math.round(MAX_AUDIO_BYTES / 1024 / 1024)}MB）を超えています`,
    )
  }

  if (file.size === 0) {
    throw new Error('空のファイルはアップロードできません')
  }
}

export function buildAudioStoragePath(userId: string, fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? 'audio'
  const safeName = `${crypto.randomUUID()}.${ext}`
  return `${userId}/${safeName}`
}

export async function uploadToStorage(
  admin: AdminClient,
  userId: string,
  file: File,
): Promise<string> {
  validateAudioFile(file)
  const path = buildAudioStoragePath(userId, file.name)
  const buffer = Buffer.from(await file.arrayBuffer())

  const { error } = await admin.storage.from(AUDIO_BUCKET).upload(path, buffer, {
    contentType: file.type || 'audio/mpeg',
    upsert: false,
  })

  if (error) {
    throw new Error(
      error.message.includes('Bucket not found')
        ? `Storage バケット「${AUDIO_BUCKET}」が見つかりません。Supabase で作成してください。`
        : `音声ファイルのアップロードに失敗しました: ${error.message}`,
    )
  }

  return path
}

export async function getSignedUrl(
  admin: AdminClient,
  path: string,
  expiresIn = 3600,
): Promise<string> {
  const { data, error } = await admin.storage
    .from(AUDIO_BUCKET)
    .createSignedUrl(path, expiresIn)

  if (error || !data?.signedUrl) {
    throw new Error('音声ファイルの URL 取得に失敗しました')
  }

  return data.signedUrl
}

export async function deleteFromStorage(
  admin: AdminClient,
  path: string,
): Promise<void> {
  const { error } = await admin.storage.from(AUDIO_BUCKET).remove([path])
  if (error) {
    throw new Error(`音声ファイルの削除に失敗しました: ${error.message}`)
  }
}
