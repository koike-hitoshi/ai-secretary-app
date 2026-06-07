import type { WritingStyleAnalysis } from '@/types/document'

export type WritingStyle = {
  vocabulary: string[]
  formalityLevel: number
  averageSentenceLength: number
  commonPhrases: string[]
  toneDescription: string
}

export function analysisToStyle(analysis: WritingStyleAnalysis): WritingStyle {
  return {
    vocabulary: analysis.vocabulary,
    formalityLevel: analysis.formalityLevel,
    averageSentenceLength: analysis.averageSentenceLength,
    commonPhrases: analysis.commonPhrases,
    toneDescription: analysis.toneDescription,
  }
}

export function buildStyleHint(style: WritingStyle | null): string | null {
  if (!style) return null
  return [
    `文体: ${style.toneDescription}`,
    `フォーマル度: ${style.formalityLevel}/5`,
    `平均文長: 約${style.averageSentenceLength}文字`,
    style.commonPhrases.length > 0
      ? `よく使う表現: ${style.commonPhrases.join('、')}`
      : null,
    style.vocabulary.length > 0
      ? `特徴的な語彙: ${style.vocabulary.join('、')}`
      : null,
  ]
    .filter(Boolean)
    .join('\n')
}

export function compareStyles(
  style1: WritingStyle,
  style2: WritingStyle,
): number {
  const formalityDiff =
    1 - Math.abs(style1.formalityLevel - style2.formalityLevel) / 4
  const lengthDiff =
    1 -
    Math.min(
      1,
      Math.abs(style1.averageSentenceLength - style2.averageSentenceLength) /
        80,
    )

  const phrases1 = new Set(style1.commonPhrases.map((p) => p.toLowerCase()))
  const phrases2 = style2.commonPhrases.filter((p) =>
    phrases1.has(p.toLowerCase()),
  )
  const phraseOverlap =
    phrases2.length /
    Math.max(1, Math.max(style1.commonPhrases.length, style2.commonPhrases.length))

  const score = (formalityDiff * 0.35 + lengthDiff * 0.25 + phraseOverlap * 0.4) * 100
  return Math.round(Math.min(100, Math.max(0, score)))
}

export function mergeStyleSamples(
  existing: string[],
  incoming: string[],
  maxSamples = 10,
): string[] {
  const combined = [...existing]
  for (const sample of incoming) {
    const trimmed = sample.trim()
    if (!trimmed || combined.includes(trimmed)) continue
    combined.push(trimmed)
  }
  return combined.slice(-maxSamples)
}
