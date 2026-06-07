export type DocumentType = 'email' | 'report' | 'proposal' | 'general'

export type SuggestionType = 'spelling' | 'grammar' | 'style' | 'structure'

export type Suggestion = {
  id: string
  type: SuggestionType
  original: string
  suggested: string
  explanation: string
  position: { start: number; end: number }
  confidence: number
}

export type ProofreadRequest = {
  content: string
  documentType: DocumentType
  applyUserStyle: boolean
}

export type ProofreadResponse = {
  documentId: string
  original: string
  corrected: string
  suggestions: Suggestion[]
  writingStyleMatch: number
  createdAt: string
}

export type ProofreadHistoryItem = {
  id: string
  original: string
  corrected: string | null
  suggestions: Suggestion[]
  createdAt: string
}

export type WritingStyleProfile = {
  toneDescription: string | null
  sampleExcerpts: string[]
  analyzedAt: string | null
  sampleCount: number
  formalityLevel: number | null
  averageSentenceLength: number | null
  commonPhrases: string[]
}

export type WritingStyleAnalysis = {
  toneDescription: string
  formalityLevel: number
  averageSentenceLength: number
  commonPhrases: string[]
  vocabulary: string[]
}
