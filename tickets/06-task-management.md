# Ticket #06: タスク管理機能実装

**ステータス: 完了**（2026-05-31）

## 概要
Todoリスト形式のタスク管理機能を実装し、優先度設定、期限管理、アラート通知機能を構築する。

## 実装済み

| 項目 | パス |
|------|------|
| タスク管理ページ | `src/app/dashboard/tasks/page.tsx` |
| クライアント UI | `src/components/tasks/TasksPageClient.tsx` |
| TaskList / TaskItem / TaskForm / TaskFilter / TaskAlertBanner | `src/components/tasks/` |
| Server Actions | `src/lib/tasks/actions.ts` |
| フィルター・ソート | `src/lib/tasks/utils.ts` |
| TaskContext | `src/contexts/TaskContext.tsx` |
| カスタムフック | `src/hooks/tasks/`（useTasks, useTask, useTaskAlerts） |
| 型定義 | `src/types/task.ts` |

### 機能
- タスク CRUD（追加・編集・削除・完了切替）
- 優先度（高・中・低）設定
- 期限日設定と残日数表示
- 期限2日前アラートバナー（`listUpcomingTasks` + 確認済み操作）
- ステータス / 優先度 / 期限フィルター
- 並び替え（作成日・期限・優先度・タイトル）
- 楽観的更新 UI
- ページネーション（10件/ページ）

## 完了条件
- [x] タスクのCRUD操作完了
- [x] 優先度設定機能動作確認
- [x] 期限管理機能動作確認
- [x] アラート通知表示確認
- [x] フィルター・ソート機能動作確認

## 技術メモ
- API Routes は未作成。Server Actions + Supabase データ層で実装
- `npm run lint` / `npm run build` 通過済

## 注意事項
- CSS変数を使用したスタイリング
- レスポンシブデザイン対応
- アクセシビリティ対応（ARIA、キーボード操作）
