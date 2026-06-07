# チケット進捗一覧

最終更新: 2026-05-31（全10チケット完了・機能実装完了）

---

## 全体サマリー

| 指標 | 状況 |
|------|------|
| チケット完了 | **10 / 10**（100%） |
| 基盤（#01–#05） | **5 / 5** 完了 |
| 機能（#06–#10） | **5 / 5** 完了 |
| 要件定義（§2.1–§2.5） | **すべて実装済み** |
| ビルド | `npm run lint` / `npm run build` 通過済 |

**結論: 要件定義書に記載された全機能の実装が完了しています。**

任意の残タスク: #02 の Storybook（オプション・未実装）

---

## 全チケット実装状況

| # | チケット | 状態 | 検証日 | 主要ページ / パス | チケット詳細 |
|---|---------|------|--------|------------------|-------------|
| 01 | デザインシステム | ✅ 完了 | 2026-05-30 | `/dashboard/design-system` | [01-design-system.md](./01-design-system.md) |
| 02 | UIコンポーネント | ✅ 完了※ | 2026-05-30 | `src/components/ui/` | [02-ui-components.md](./02-ui-components.md) |
| 03 | ページレイアウト | ✅ 完了 | 2026-05-30 | サイドバー・ダッシュボード | [03-page-layouts.md](./03-page-layouts.md) |
| 04 | データベース基盤 | ✅ 完了 | 2026-05-31 | Supabase 6テーブル + RLS | [04-database-setup.md](./04-database-setup.md) |
| 05 | 認証システム | ✅ 完了 | 2026-05-31 | `/login`, Google OAuth | [05-auth-system.md](./05-auth-system.md) |
| 06 | タスク管理 | ✅ 完了 | 2026-05-31 | `/dashboard/tasks` | [06-task-management.md](./06-task-management.md) |
| 07 | カレンダー連携 | ✅ 完了 | 2026-06-03 | `/dashboard/calendar` | [07-calendar-integration.md](./07-calendar-integration.md) |
| 08 | 文章校正 | ✅ 完了 | 2026-06-07 | `/dashboard/documents/proofread` | [08-text-proofreading.md](./08-text-proofreading.md) |
| 09 | 議事録 | ✅ 完了 | 2026-05-31 | `/dashboard/documents/minutes` | [09-minutes-generation.md](./09-minutes-generation.md) |
| 10 | リサーチ | ✅ 完了 | 2026-05-31 | `/dashboard/documents/research` | [10-research-assistant.md](./10-research-assistant.md) |

※ #02 は Storybook のみ未実装（オプション）。コンポーネント本体は完了。

---

## 要件定義との対応（docs/REQUIREMENTS.md）

| 要件 | チケット | 実装状況 | 確認ポイント |
|------|---------|---------|-------------|
| §2.1 タスク管理 | #06 | ✅ | CRUD、優先度、期限、アラート |
| §2.2 文章校正 | #08 | ✅ | OpenAI 校正、文体学習、履歴 |
| §2.3 議事録作成 | #09 | ✅ | 音声アップロード、文字起こし、議事録生成 |
| §2.4 リサーチ | #10 | ✅ | プロンプト最適化、Perplexity 検索、出典表示 |
| §2.5 Googleカレンダー | #07 | ✅ | OAuth、イベント CRUD、タスク連携 |
| §3.1 認証 | #05 | ✅ | Google OAuth 2.0 |
| 基盤 UI / DB | #01–#04 | ✅ | デザインシステム、コンポーネント、レイアウト、Supabase |

---

## 実装済み機能（詳細）

### 基盤（#01–#05）

| 機能 | 実装 |
|------|------|
| デザインシステム | CSS 変数、タイポグラフィ、カラートークン |
| UI コンポーネント | Button, Input, Card, Alert, Tabs, Textarea 等 |
| ページレイアウト | サイドバーナビ、PageHeader、ダッシュボード |
| データベース | `tasks`, `proofreading_history`, `writing_style_profiles`, `meeting_minutes`, `research_sessions`, `google_calendar_tokens` |
| 認証 | Supabase Auth + Google OAuth、ミドルウェア保護 |

### 機能（#06–#10）

| # | 機能 | ページ | API / 外部連携 |
|---|------|--------|---------------|
| 06 | タスク CRUD・優先度・期限 | `/dashboard/tasks` | Supabase |
| 07 | カレンダー表示・同期・CRUD | `/dashboard/calendar` | Google Calendar API |
| 08 | AI 校正・文体学習・履歴 | `/dashboard/documents/proofread` | OpenAI |
| 09 | 音声→文字起こし→議事録 | `/dashboard/documents/minutes` | AssemblyAI + OpenAI |
| 10 | テーマ→検索→要約・出典 | `/dashboard/documents/research` | OpenAI + Perplexity |

### 設定済み環境変数

| 変数 | 用途 | 状態 |
|------|------|------|
| `OPENAI_API_KEY` | 校正・議事録・リサーチ | ✅ |
| `ASSEMBLYAI_API_KEY` | 議事録 文字起こし | ✅ |
| `PERPLEXITY_API_KEY` | リサーチ Web 検索 | ✅ |
| `GOOGLE_CLIENT_ID` / `SECRET` | OAuth・カレンダー | ✅ |
| Supabase 各種キー | DB・認証・Storage | ✅ |

---

## 未実装（任意・非ブロッカー）

| 項目 | チケット | 備考 |
|------|---------|------|
| Storybook | #02 | オプション。`docs/ui-components.md` で代替ドキュメントあり |

**プロダクト機能としての未実装項目はありません。**

---

## API Routes 一覧（実装済み）

| カテゴリ | ルート |
|---------|--------|
| 認証 | `POST /api/auth/google/callback` |
| カレンダー | `/api/calendar/auth`, `events`, `events/[id]`, `sync` |
| 文章校正 | `/api/documents/proofread`, `proofread/history`, `writing-style` |
| 議事録 | `/api/documents/upload`, `transcribe`, `minutes` |
| リサーチ | `/api/documents/research`, `research/[id]` |

---

## 関連ドキュメント

- [docs/REQUIREMENTS.md](../docs/REQUIREMENTS.md) — 要件定義
- [docs/PRODUCT_SPEC.md](../docs/PRODUCT_SPEC.md) — プロダクト仕様
- 各チケット: `tickets/01-*.md` 〜 `tickets/10-*.md`
