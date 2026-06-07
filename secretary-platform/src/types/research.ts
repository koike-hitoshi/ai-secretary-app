export type ResearchSource = {
  url: string
  title: string
  snippet?: string
}

export type ResearchRecord = {
  id: string
  theme: string
  generatedPrompt: string | null
  summary: string | null
  sources: ResearchSource[]
  createdAt: string
}

export type ResearchListItem = {
  id: string
  theme: string
  summaryPreview: string | null
  sourceCount: number
  createdAt: string
}

export type ResearchRequest = {
  theme: string
}

export type ResearchResponse = {
  record: ResearchRecord
}

export type ResearchListResponse = {
  items: ResearchListItem[]
  total: number
  page: number
  limit: number
  totalPages: number
}
