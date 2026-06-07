import type { Suggestion, WritingStyleAnalysis } from '@/types/document'

import type { WritingStyle } from '@/lib/writing-style/styleAnalyzer'

export function adaptSuggestions(
  suggestions: Suggestion[],
  userStyle: WritingStyle | null,
): Suggestion[] {
  if (!userStyle) return suggestions

  return suggestions.map((suggestion) => {
    if (suggestion.type !== 'style') return suggestion

    const matchesPhrase = userStyle.commonPhrases.some(
      (phrase) =>
        suggestion.suggested.includes(phrase) ||
        suggestion.original.includes(phrase),
    )

    return {
      ...suggestion,
      confidence: matchesPhrase
        ? Math.min(1, suggestion.confidence + 0.1)
        : suggestion.confidence,
      explanation: matchesPhrase
        ? `${suggestion.explanation}（あなたの文体パターンに合わせた提案）`
        : suggestion.explanation,
    }
  })
}

export function profileFromAnalysis(
  analysis: WritingStyleAnalysis,
  existingSamples: string[],
  newSample: string,
): {
  toneDescription: string
  sampleExcerpts: string[]
  formalityLevel: number
  averageSentenceLength: number
  commonPhrases: string[]
} {
  const samples = [...existingSamples]
  const trimmed = newSample.trim()
  if (trimmed && !samples.includes(trimmed)) {
    samples.push(trimmed.slice(0, 500))
  }

  return {
    toneDescription: analysis.toneDescription,
    sampleExcerpts: samples.slice(-10),
    formalityLevel: analysis.formalityLevel,
    averageSentenceLength: analysis.averageSentenceLength,
    commonPhrases: analysis.commonPhrases,
  }
}

export function applySuggestion(
  text: string,
  suggestion: Suggestion,
): string {
  if (!suggestion.original) return text

  const index = text.indexOf(suggestion.original, suggestion.position.start)
  if (index === -1) {
    return text.replace(suggestion.original, suggestion.suggested)
  }

  return (
    text.slice(0, index) +
    suggestion.suggested +
    text.slice(index + suggestion.original.length)
  )
}

export function applyAllSuggestions(
  text: string,
  suggestions: Suggestion[],
  acceptedIds: Set<string>,
): string {
  const accepted = suggestions
    .filter((s) => acceptedIds.has(s.id))
    .sort((a, b) => b.position.start - a.position.start)

  return accepted.reduce((current, suggestion) => {
    return applySuggestion(current, suggestion)
  }, text)
}
