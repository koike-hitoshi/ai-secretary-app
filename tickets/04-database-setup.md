# Ticket #04: データベース基盤構築

**ステータス: 完了**（2026-05-31 再検証済）

## 概要
SupabaseでのデータベースとRow Level Security (RLS)の設定を行い、データ永続化の基盤を構築する。

## 実装済み

| 項目 | パス / 備考 |
|------|-------------|
| `@supabase/supabase-js` / `@supabase/ssr` | インストール済 |
| ブラウザクライアント | `src/lib/supabase/client.ts` |
| サーバークライアント | `src/lib/supabase/server.ts` |
| 管理クライアント | `src/lib/supabase/admin.ts` |
| セッションミドルウェア | `src/lib/supabase/middleware.ts` |
| タスク CRUD + アラート | `src/lib/supabase/tasks.ts` |
| ユーザー / セッション | `src/lib/supabase/users.ts` |
| ドキュメント（校正・議事録・リサーチ） | `src/lib/supabase/documents.ts` |
| 行マッパー / エラー処理 | `src/lib/supabase/mappers.ts`, `errors.ts` |
| DB 型定義 | `src/types/database.ts`（6 テーブル + `task_priority` enum） |
| ドメイン型 | `src/types/index.ts`（`Task` 等） |
| SQL マイグレーション | `supabase/migrations/001_initial.sql` |
| npm スクリプト | `db:migrate`, `db:verify`, `db:test` |
| 環境変数 | `secretary-platform/.env.local` 設定済 |
| リモート DB マイグレーション | **完了** |

### 作成済みテーブル（001_initial.sql）

| テーブル | 用途 |
|---------|------|
| `tasks` | タスク管理（#06） |
| `writing_style_profiles` | 文章校正スタイル（#08） |
| `proofreading_history` | 校正履歴（#08） |
| `meeting_minutes` | 議事録（#09） |
| `research_sessions` | リサーチ（#10） |
| `google_calendar_tokens` | カレンダー OAuth トークン（#07） |

> **注:** 当初チケット記載の `users` / `documents` / `writing_styles` テーブルは、実装では Supabase Auth の `auth.users` を直接参照し、機能別テーブルに分割している。

### 検証結果（2026-05-31 再実行）

```bash
cd secretary-platform && npm run db:verify
# → 6/6 tables ready

cd secretary-platform && npm run db:test
# → 13 passed, 0 failed（CRUD + RLS 確認済）
```

## 目的
- データベーステーブルの作成
- セキュリティポリシーの設定
- データアクセス層の実装

## 実装内容

### 1. Supabaseプロジェクト設定
- [x] プロジェクト作成
- [x] 環境変数設定
  - [x] `NEXT_PUBLIC_SUPABASE_URL`
  - [x] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [x] `SUPABASE_SERVICE_ROLE_KEY`

### 2. データベーステーブル作成
- [x] `tasks` — タスク管理
- [x] `writing_style_profiles` — 文章スタイル
- [x] `proofreading_history` — 校正履歴
- [x] `meeting_minutes` — 議事録
- [x] `research_sessions` — リサーチ
- [x] `google_calendar_tokens` — カレンダートークン

### 3. Row Level Security (RLS) 設定
- [x] 全テーブルで RLS 有効化
- [x] ユーザーは自分のデータのみアクセス可能
- [x] ポリシー設定

### 4. Supabaseクライアント設定
- [x] `src/lib/supabase/client.ts`（ブラウザ）
- [x] `src/lib/supabase/server.ts`（サーバー）
- [x] `src/lib/supabase/admin.ts`（サービスロール）

### 5. データベース型定義
- [x] `src/types/database.ts` 作成

### 6. データアクセス層（src/lib/supabase/）
- [x] `users.ts` — ユーザー・セッション・スタイルプロフィール
- [x] `tasks.ts` — タスク CRUD + アラート対象取得
- [x] `documents.ts` — 校正・議事録・リサーチ操作

## 技術要件
- Supabase
- TypeScript型安全性
- エラーハンドリング

## 完了条件
- [x] Supabaseプロジェクト作成完了
- [x] 全テーブル作成完了（6/6）
- [x] RLSポリシー設定完了
- [x] TypeScript型定義完了
- [x] 基本的なCRUD操作テスト完了（`db:verify` 6/6、`db:test` 13/13）

## 注意事項
- 環境変数は `.env.local` に記載
- RLSは必ず有効化する
- マイグレーション履歴を管理
