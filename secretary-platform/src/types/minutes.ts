export type TranscriptionStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'

export type ActionItem = {
  task: string
  assignee?: string
  dueDate?: string
}

export type MinutesRecord = {
  id: string
  title: string
  transcript: string | null
  discussed: string | null
  decisions: string | null
  nextActions: string | null
  audioStoragePath: string | null
  createdAt: string
  updatedAt: string
}

export type MinutesContent = {
  discussedTopics: string[]
  decisions: string[]
  nextActions: ActionItem[]
}

export type TranscriptionJob = {
  minutesId: string
  assemblyaiId: string
  status: TranscriptionStatus
  progress: number
  audioUrl?: string
  result?: string
  error?: string
}

export type UploadResponse = {
  uploadId: string
  status: 'uploaded'
  fileSize: number
  estimatedTime: number
}

export type TranscribeResponse = {
  transcriptionId: string
  minutesId: string
  status: TranscriptionStatus
  progress: number
}

export type MinutesListItem = {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  hasTranscript: boolean
  hasSummary: boolean
}

export type ExportFormat = 'pdf' | 'word' | 'markdown' | 'text'
