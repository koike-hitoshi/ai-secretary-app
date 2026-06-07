# Ticket #09: 議事録作成機能実装

**ステータス: 完了**（2026-05-31 検証済）

## 概要

AssemblyAI APIを使用して音声ファイルから自動文字起こしを行い、OpenAI APIで議事録フォーマットに整形する機能を実装する。

## 実装済み

| 項目 | パス |
|------|------|
| 議事録ページ | `src/app/dashboard/documents/minutes/page.tsx` |
| 議事録詳細ページ | `src/app/dashboard/documents/minutes/[id]/page.tsx` |
| クライアント UI | `MinutesPageClient`, `MinutesDetailClient` |
| AudioUploader / TranscriptionProgress | `src/components/documents/` |
| MinutesDisplay / MinutesEditor / MinutesList / MinutesExporter | `src/components/documents/` |
| AssemblyAI 統合 | `src/lib/transcription/assemblyai.ts` |
| ジョブ管理 | `src/lib/transcription/transcriptionQueue.ts` |
| 議事録生成 | `src/lib/minutes/minutesGenerator.ts`, `minutesTemplates.ts` |
| サービス層 | `src/lib/minutes/minutesService.ts` |
| 音声ストレージ | `src/lib/storage/audioStorage.ts` |
| 型定義 | `src/types/minutes.ts` |
| カスタムフック | `useAudioUpload`, `useTranscription`, `useMinutes` |

### API Routes

| ルート | 用途 |
|--------|------|
| `POST /api/documents/upload` | 音声ファイルを Supabase Storage にアップロード |
| `POST /api/documents/transcribe` | AssemblyAI 文字起こし開始 |
| `GET /api/documents/transcribe/[id]/status` | 文字起こし進捗ポーリング |
| `POST /api/documents/minutes` | OpenAI 議事録自動生成 |
| `GET /api/documents/minutes` | 議事録一覧 |
| `GET/PUT/DELETE /api/documents/minutes/[id]` | 詳細・更新・削除 |

### 機能

- ドラッグ&ドロップ音声アップロード（mp3 / wav / m4a、最大 200MB）
- 処理ステップ表示（アップロード → 文字起こし → テキスト → 議事録化）
- AssemblyAI 日本語文字起こし
- OpenAI による議事録セクション生成（議論内容・決定事項・ネクストアクション）
- 議事録の編集・保存・削除
- エクスポート（Markdown / Plain Text / Word / HTML）
- 議事録一覧・検索
- 文字起こし進捗の再確認（ボタン・一覧からの再開）
- ページ再読み込み後の処理復帰（sessionStorage）
- 文字起こし完了時の進捗 100% 表示

## 実装チェックリスト

### コード・UI

- [x] 議事録作成ページ
- [x] 議事録詳細ページ
- [x] AudioUploader（D&D、形式検証、進捗）
- [x] TranscriptionProgress（4ステップ表示）
- [x] MinutesDisplay / MinutesEditor
- [x] MinutesList（検索・削除・進捗確認）
- [x] MinutesExporter（4形式）
- [x] `src/lib/transcription/`
- [x] `src/lib/minutes/`
- [x] `src/lib/storage/audioStorage.ts`
- [x] `src/hooks/documents/`（議事録用3本）

### API Routes

- [x] `POST /api/documents/upload`
- [x] `POST /api/documents/transcribe`
- [x] `GET /api/documents/transcribe/[id]/status`
- [x] `POST /api/documents/minutes`
- [x] `GET /api/documents/minutes`
- [x] `GET/PUT/DELETE /api/documents/minutes/[id]`

### 機能・UX

- [x] 音声ファイルアップロード（Supabase Storage）
- [x] AssemblyAI 文字起こし（日本語）
- [x] 進捗ポーリング（3秒間隔、タイムアウト・再開対応）
- [x] OpenAI 議事録自動生成
- [x] 議事録編集・保存
- [x] 議事録削除（Storage 連動）
- [x] エクスポート（4形式）
- [x] 一覧検索
- [x] 文字起こし完了時 100% 進捗表示

### インフラ

- [x] DB `meeting_minutes` + RLS
- [x] Storage マイグレーション SQL（`002_audio_storage.sql`）
- [x] `.env.local` に `ASSEMBLYAI_API_KEY` / `OPENAI_API_KEY` 設定
- [x] `npm run lint` / `npm run build` 通過済

## 完了条件

- [x] 音声ファイルアップロード確認
- [x] 文字起こし処理動作確認
- [x] 議事録自動生成確認
- [x] 議事録編集・保存確認
- [x] エクスポート機能確認

## セットアップ（手動）

1. `.env.local` に設定:
   - `ASSEMBLYAI_API_KEY`
   - `OPENAI_API_KEY`
   - `SUPABASE_AUDIO_BUCKET=meeting-audio`（任意）
2. Supabase SQL Editor で `supabase/migrations/002_audio_storage.sql` を実行（Storage バケット + RLS）
3. `/dashboard/documents/minutes` で利用

## 技術メモ

- 文字起こしジョブ状態は `transcript` フィールドに一時エンコード（`__MINUTES_JOB__:`）
- 開発向けファイル上限: 200MB（本番は Storage 設定で調整可）
- WebSocket は未使用（3秒間隔ポーリング）
- ポーリング: クライアント 90秒 / AssemblyAI 30秒タイムアウト、AbortController による再開
- 完了済み transcript の上書き防止（サーバー側レース対策）
- 処理中 ID を sessionStorage に保存し、ページ再読み込み後に自動復帰

## 注意事項

- Storage バケット未作成時はアップロードエラーになる
- 長時間音声は AssemblyAI の処理時間に依存
