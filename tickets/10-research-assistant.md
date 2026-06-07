# Ticket #10: リサーチ機能実装

**ステータス: 完了**（2026-05-31 検証済）

## 概要

OpenAI APIでリサーチ用プロンプトを最適化し、Perplexity APIで実際の検索を実行してユーザーに要約された情報を提供する機能を実装する。

## 実装済み

| 項目 | パス |
|------|------|
| リサーチページ | `src/app/dashboard/documents/research/page.tsx` |
| リサーチ詳細ページ | `src/app/dashboard/documents/research/[id]/page.tsx` |
| クライアント UI | `ResearchPageClient`, `ResearchDetailClient` |
| ResearchQueryForm / ResearchResult / ResearchHistory | `src/components/documents/` |
| Perplexity 統合 | `src/lib/research/perplexity.ts` |
| プロンプト最適化 | `src/lib/research/promptOptimizer.ts` |
| サービス層 | `src/lib/research/researchService.ts` |
| DB ヘルパー | `listResearchSessions`, `getResearchSessionById`（`documents.ts`） |
| 型定義 | `src/types/research.ts` |
| カスタムフック | `useResearch`, `useResearchHistory` |

### API Routes

| ルート | 用途 |
|--------|------|
| `POST /api/documents/research` | プロンプト最適化 → Perplexity 検索 → 保存 |
| `GET /api/documents/research` | リサーチ履歴一覧 |
| `GET /api/documents/research/[id]` | 詳細取得 |
| `DELETE /api/documents/research/[id]` | 削除 |

### 機能

- テーマ入力によるリサーチ実行
- OpenAI によるプロンプト最適化
- Perplexity API による Web 検索・要約
- 出典リンク一覧（`rel="noopener noreferrer"`）
- リサーチ履歴の保存・検索・削除
- 詳細ページでの再実行・削除

## 実装チェックリスト

### コード・UI

- [x] リサーチページ（`/dashboard/documents/research`）
- [x] リサーチ詳細ページ（`/dashboard/documents/research/[id]`）
- [x] `ResearchPageClient`
- [x] `ResearchDetailClient`
- [x] `ResearchQueryForm`
- [x] `ResearchResult`（要約・出典一覧）
- [x] `ResearchHistory`（履歴・検索・削除）
- [x] `src/lib/research/`（perplexity, promptOptimizer, researchService）
- [x] `src/hooks/documents/useResearch.ts`
- [x] `src/hooks/documents/useResearchHistory.ts`
- [x] `src/types/research.ts`

### API Routes

- [x] `POST /api/documents/research`
- [x] `GET /api/documents/research`
- [x] `GET /api/documents/research/[id]`
- [x] `DELETE /api/documents/research/[id]`

### 機能

- [x] OpenAI によるリサーチプロンプト最適化
- [x] Perplexity API による Web 検索
- [x] 検索結果の要約表示
- [x] 出典リンク一覧
- [x] リサーチ履歴の DB 保存（`research_sessions`）
- [x] 履歴の一覧・詳細・削除
- [x] 詳細ページでの再実行

### インフラ・セットアップ

- [x] DB `research_sessions` + RLS
- [x] `listResearchSessions` / `getResearchSessionById`
- [x] `.env.local` に `PERPLEXITY_API_KEY` 設定
- [x] `npm run lint` / `npm run build` 通過済

## 完了条件

- [x] テーマ入力 → リサーチ実行が動作する
- [x] 要約と出典が表示される
- [x] 履歴が保存・一覧表示される
- [x] 詳細ページで過去のリサーチを確認できる
- [x] 削除が動作する
- [x] 同じテーマでの再実行が動作する

## セットアップ

1. `.env.local` に設定:
   - `PERPLEXITY_API_KEY`
   - `OPENAI_API_KEY`（既存）
   - 任意: `PERPLEXITY_MODEL=sonar`（未設定時は `sonar`）
2. `/dashboard/documents/research` で利用

## 技術メモ

- OpenAI: プロンプト最適化（`gpt-4o-mini`）
- Perplexity: `sonar` モデル、120秒タイムアウト
- `sources` は `{ url, title, snippet }[]` 形式の JSONB
- テーマ最大 500 文字

## 注意事項

- Perplexity API のレート制限・コストに注意
- 出典 URL は API 返却値のみ使用（ハルシネーション防止）
