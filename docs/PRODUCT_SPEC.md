# AI Secretary — 実装補足仕様

正式な要件定義は **[REQUIREMENTS.md](./REQUIREMENTS.md)** を参照してください。本ファイルは実装時の技術補足です。

## 認証

- Supabase Auth + **Google OAuth のみ**
- マルチテナント / チーム機能は実装しない
- RLS で `auth.uid()` 単位にデータ分離

## 音声アップロード（5GB対応）

Vercel の API Routes にはボディサイズ上限があるため、大容量音声は次の流れとする。

1. クライアントが Supabase Storage へ直接アップロード（署名付き URL）
2. サーバーが Storage URL を AssemblyAI に渡して文字起こし
3. OpenAI で議事録フォーマットに整形

定数: `secretary-platform/src/lib/constants.ts`

## API ルート（予定）

| パス | 用途 |
|------|------|
| `/api/tasks` | タスク CRUD |
| `/api/proofreading` | 文章校正 |
| `/api/research` | リサーチ |
| `/api/minutes/*` | 議事録・アップロード |
| `/api/calendar/events` | Google カレンダー |

## 環境変数

`secretary-platform/.env.example`
