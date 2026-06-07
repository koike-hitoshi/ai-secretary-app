# Ticket #08: 文章校正機能実装

**ステータス: 完了**（2026-06-07 検証済）

## 概要
OpenAI APIを使用してAIによる文章校正機能を実装し、ユーザーの文体を学習・適用する機能を構築する。

## 実装済み

| 項目 | パス |
|------|------|
| 文章校正ページ | `src/app/dashboard/documents/proofread/page.tsx` |
| クライアント UI | `src/components/documents/ProofreadPageClient.tsx` |
| DocumentEditor | `src/components/documents/DocumentEditor.tsx` |
| DocumentTypeSelector | `src/components/documents/DocumentTypeSelector.tsx` |
| ProofreadPanel | `src/components/documents/ProofreadPanel.tsx` |
| ProofreadResult | `src/components/documents/ProofreadResult.tsx` |
| WritingStyleAnalyzer | `src/components/documents/WritingStyleAnalyzer.tsx` |
| ProofreadHistory | `src/components/documents/ProofreadHistory.tsx` |
| OpenAI 統合 | `src/lib/ai/openai.ts`, `prompts.ts` |
| 文体学習 | `src/lib/writing-style/styleAnalyzer.ts`, `styleApplicator.ts` |
| 校正サービス | `src/lib/documents/proofreadService.ts` |
| ユーティリティ | `src/lib/documents/utils.ts` |
| 型定義 | `src/types/document.ts` |
| カスタムフック | `src/hooks/documents/`（useProofread, useWritingStyle, useProofreadHistory） |

### API Routes

| ルート | 用途 |
|--------|------|
| `POST /api/documents/proofread` | AI 文章校正・履歴保存 |
| `GET /api/documents/proofread/history` | 校正履歴（ページネーション） |
| `DELETE /api/documents/proofread/history/[id]` | 校正履歴の削除 |
| `GET /api/documents/writing-style` | 文体プロファイル取得 |
| `POST /api/documents/writing-style/analyze` | 文体分析・DB 保存 |

### 機能
- テキストエディター（文字数カウンター、下書き保存、テンプレート）
- 文書タイプ別校正（メール / 報告書 / 提案書 / 一般）
- OpenAI による誤字脱字・文法・文体・構成の提案
- 校正前後の比較表示、提案の受け入れ/却下、一括適用
- ユーザー文体の学習・プロファイル保存（`writing_style_profiles`）
- パーソナライズ校正（学習済み文体の適用）
- 校正履歴の保存・検索・再編集・削除

## 実装チェックリスト

### コード・UI
- [x] 文章校正ページ（`/dashboard/documents/proofread`）
- [x] `DocumentEditor`（エディター、文字数、下書き、テンプレート、クリア）
- [x] `DocumentTypeSelector`（メール / 報告書 / 提案書 / 一般）
- [x] `ProofreadPanel`（校正前後比較、結果反映）
- [x] `ProofreadResult`（カテゴリ別提案、受け入れ/却下、一括適用）
- [x] `WritingStyleAnalyzer`（文体分析、学習進度、特徴表示）
- [x] `ProofreadHistory`（履歴一覧、検索、再編集、削除）
- [x] `src/lib/ai/`（OpenAI クライアント、プロンプト）
- [x] `src/lib/writing-style/`（文体分析・適用）
- [x] `src/hooks/documents/` 一式
- [x] `src/types/document.ts`

### API Routes
- [x] `POST /api/documents/proofread`
- [x] `GET /api/documents/proofread/history`
- [x] `DELETE /api/documents/proofread/history/[id]`
- [x] `GET /api/documents/writing-style`
- [x] `POST /api/documents/writing-style/analyze`

### 機能
- [x] AI 文章校正（OpenAI `gpt-4o-mini`、`OPENAI_MODEL` で変更可）
- [x] 誤字脱字・文法・文体・構成の提案
- [x] 文体学習・プロファイル保存
- [x] パーソナライズ校正（学習済み文体の適用）
- [x] 校正履歴の DB 保存（`proofreading_history`）
- [x] 履歴の検索・再編集・削除

### インフラ・セットアップ
- [x] DB `proofreading_history` + RLS
- [x] DB `writing_style_profiles` + RLS
- [x] `.env.local` に `OPENAI_API_KEY` 設定
- [x] `npm run lint` / `npm run build` 通過済

## 完了条件
- [x] 文章校正機能動作確認
- [x] 誤字脱字・文法チェック確認
- [x] 文体学習機能動作確認
- [x] 校正履歴保存確認
- [x] パーソナライズ校正確認

## セットアップ（参照）

1. `.env.local` に `OPENAI_API_KEY` を設定
2. 任意: `OPENAI_MODEL=gpt-4o`（未設定時は `gpt-4o-mini`）
3. `/dashboard/documents/proofread` で校正・文体学習を利用

## 技術メモ
- 最大 12,000 文字まで校正対応
- 文体メタデータは `sample_excerpts` 内にエンコードして保存
- 提案は最大 15 件に制限（プロンプト指定）

## 注意事項
- APIコール数の最適化
- 長文は文字数上限で制御
- 本番では OpenAI API キーを環境変数で管理すること
