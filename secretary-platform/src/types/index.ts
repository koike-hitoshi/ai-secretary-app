export type TaskPriority = 'high' | 'medium' | 'low'

export type Task = {
  id: string
  userId: string
  title: string
  description?: string
  dueDate?: string
  priority: TaskPriority
  completed: boolean
  createdAt: string
  updatedAt: string
}

export type MeetingMinutes = {
  id: string
  title: string
  discussed: string
  decisions: string
  nextActions: string
  createdAt: string
}

export type ResearchSource = {
  title: string
  url: string
}

export type ResearchResult = {
  theme: string
  summary: string
  sources: ResearchSource[]
}

export type {
  DocumentType,
  ProofreadHistoryItem,
  ProofreadRequest,
  ProofreadResponse,
  Suggestion,
  SuggestionType,
  WritingStyleProfile,
} from '@/types/document'

export type {
  ActionItem,
  ExportFormat,
  MinutesContent,
  MinutesListItem,
  MinutesRecord,
  TranscriptionJob,
} from '@/types/minutes'

/** @deprecated Use DASHBOARD_NAV_ITEMS from @/lib/navigation */
export { DASHBOARD_NAV_ITEMS as NAV_ITEMS } from '@/lib/navigation'
