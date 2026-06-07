# Ticket #07: Googleカレンダー連携機能

**ステータス: 完了**（2026-06-03 検証済）

## 概要
Google Calendar APIを使用してカレンダー機能を実装し、タスク管理機能との連携を構築する。

## 実装済み

| 項目 | パス |
|------|------|
| カレンダーページ | `src/app/dashboard/calendar/page.tsx` |
| UI コンポーネント | `src/components/calendar/`（CalendarView, CalendarHeader, CalendarSync, EventForm, EventItem, CalendarPageClient） |
| Google Calendar サービス | `src/lib/calendar/googleCalendar.ts` |
| トークン管理 | `src/lib/calendar/tokens.ts` |
| タスク連携 | `src/lib/calendar/calendarSync.ts` |
| Server Actions | `src/lib/calendar/actions.ts` |
| 設定・ユーティリティ | `src/lib/calendar/config.ts`, `utils.ts` |
| CalendarContext | `src/contexts/CalendarContext.tsx` |
| カスタムフック | `src/hooks/calendar/` |
| 型定義 | `src/types/calendar.ts` |

### API Routes

| ルート | 用途 |
|--------|------|
| `GET /api/calendar/auth` | Google OAuth 開始 |
| `GET /api/auth/google/callback` | OAuth コールバック |
| `GET/POST /api/calendar/events` | イベント取得・作成 |
| `PUT/DELETE /api/calendar/events/[id]` | イベント更新・削除 |
| `POST /api/calendar/sync` | 手動同期 |

### 機能
- Google カレンダー OAuth 連携（ログインとは別スコープ `calendar.events`）
- 月/週/日ビュー
- イベント CRUD（Google Calendar API）
- タスク期限のカレンダー表示（📋 バッジ）
- 予定作成時にタスクとしても保存
- 手動同期・連携解除
- トークン自動更新（refresh_token）

## 実装チェックリスト

### コード・UI
- [x] カレンダーページ（`/dashboard/calendar`）
- [x] `src/lib/calendar/`（OAuth、API、トークン、同期、actions）
- [x] `src/components/calendar/` 一式
- [x] `CalendarContext` + `src/hooks/calendar/`
- [x] `src/types/calendar.ts`
- [x] API Routes 5 本（auth / callback / events / events/[id] / sync）

### 機能
- [x] Google カレンダー OAuth 連携（ログインとは別フロー）
- [x] 月/週/日ビュー
- [x] イベント CRUD
- [x] タスク期限のカレンダー表示
- [x] 予定作成時のタスク連携
- [x] 手動同期・連携解除
- [x] refresh_token によるトークン更新

### インフラ・セットアップ（手動）
- [x] Supabase `google_calendar_tokens` テーブル + RLS
- [x] Google Cloud Console で **Calendar API** 有効化
- [x] OAuth 同意画面に `calendar.events` スコープ追加
- [x] Redirect URI: `http://localhost:3000/api/auth/google/callback`
- [x] Redirect URI（ログイン）: `https://curlkwygoozixibypwaq.supabase.co/auth/v1/callback`
- [x] `.env.local` に `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `GOOGLE_REDIRECT_URI`

### 検証
- [x] `npm run db:verify` — `google_calendar_tokens` 含む 6/6
- [x] `npm run verify:google-oauth` — Client ID/Secret 有効
- [x] ログイン・カレンダー両リダイレクト URI で OAuth 資格情報確認
- [x] `npm run lint` / `npm run build` 通過済

## 完了条件
- [x] Google Calendar認証完了
- [x] イベントCRUD操作確認
- [x] カレンダービュー表示確認
- [x] タスクとの連携動作確認
- [x] 同期機能動作確認

## セットアップ（参照）

1. Google Cloud Console で **Calendar API** を有効化
2. OAuth クライアントの Redirect URI に追加:
   - `http://localhost:3000/api/auth/google/callback`
   - （本番）`https://your-domain.vercel.app/api/auth/google/callback`
3. `.env.local` に設定:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback`

## 技術メモ
- `npm run lint` / `npm run build` 通過済
- Supabase Auth（ログイン）とカレンダー OAuth は別フロー
- 本番デプロイ時は本番ドメインを Redirect URI と `GOOGLE_REDIRECT_URI` / `NEXT_PUBLIC_APP_URL` に追加すること
