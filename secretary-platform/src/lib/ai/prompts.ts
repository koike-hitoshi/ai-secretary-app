import type { DocumentType } from '@/types/document'

const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  email: 'ビジネスメール',
  report: '報告書',
  proposal: '提案書',
  general: '一般文書',
}

export function getDocumentTypeLabel(type: DocumentType): string {
  return DOCUMENT_TYPE_LABELS[type]
}

export function buildProofreadSystemPrompt(documentType: DocumentType): string {
  const label = DOCUMENT_TYPE_LABELS[documentType]
  return `あなたは日本語の文章校正の専門家です。${label}向けに、誤字脱字・文法・文体・構成を改善してください。
必ず次のJSON形式のみで応答してください（マークダウン不可）:
{
  "corrected": "校正後の全文",
  "suggestions": [
    {
      "id": "s1",
      "type": "spelling|grammar|style|structure",
      "original": "修正前の該当箇所",
      "suggested": "修正後の該当箇所",
      "explanation": "修正理由（日本語・簡潔）",
      "confidence": 0.0から1.0の数値
    }
  ],
  "writingStyleMatch": 0から100の整数（ユーザー文体との一致度。文体情報がない場合は80）
}
suggestionsは重要な変更のみ（最大15件）。correctedは入力全体を自然な日本語に整えたものにしてください。`
}

export function buildProofreadUserPrompt(
  content: string,
  userStyleHint: string | null,
): string {
  const styleSection = userStyleHint
    ? `\n\n【ユーザーの文体プロファイル】\n${userStyleHint}\n上記の文体に合わせて校正してください。`
    : ''
  return `以下の文章を校正してください。${styleSection}\n\n---\n${content}\n---`
}

export function buildWritingStyleSystemPrompt(): string {
  return `あなたは日本語の文体分析の専門家です。提供された文章サンプルから文体特徴を分析し、次のJSON形式のみで応答してください:
{
  "toneDescription": "文体の特徴を2〜3文で説明",
  "formalityLevel": 1から5の整数（1=カジュアル、5=フォーマル）,
  "averageSentenceLength": 平均文長（文字数の概算・整数）,
  "commonPhrases": ["よく使う表現1", "表現2", ...最大8件],
  "vocabulary": ["特徴的な語彙1", ...最大10件]
}`
}

export function buildWritingStyleUserPrompt(samples: string[]): string {
  return `以下の文章サンプル（${samples.length}件）から文体を分析してください:\n\n${samples
    .map((s, i) => `【サンプル${i + 1}】\n${s}`)
    .join('\n\n')}`
}
