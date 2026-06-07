/** 議事録用音声アップロード制約 */
export const AUDIO_ACCEPTED_EXTENSIONS = ['mp3', 'wav', 'm4a'] as const

export const AUDIO_ACCEPTED_MIME_TYPES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/mp4',
  'audio/x-m4a',
  'audio/m4a',
] as const

/** 5 GB（バイト） */
export const AUDIO_MAX_FILE_BYTES = 5 * 1024 * 1024 * 1024

export const AUDIO_ACCEPT_ATTRIBUTE = AUDIO_ACCEPTED_EXTENSIONS.map(
  (ext) => `.${ext}`,
).join(',')
