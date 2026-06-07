# Ticket #01: デザインシステム構築

**ステータス: 完了**（2026-05-30）

## 概要
Apple風のモダンなデザインシステムを構築し、アプリ全体で使用する共通のスタイルとデザイントークンを定義する。

## 目的
- 一貫性のあるデザイン言語の確立
- CSS変数によるテーマ管理
- Tailwind設定のカスタマイズ

## 実装内容

### 1. Tailwind設定（tailwind.config.ts）
- CSS変数を使用したカラーシステムの定義
- フォントシステムの設定
- スペーシングシステムの設定
- ボーダー半径、シャドウの定義

### 2. CSS変数定義（globals.css）
- `:root` でのカラートークン定義
 - `--background`: 背景色
 - `--foreground`: テキスト色
 - `--primary`: プライマリカラー
 - `--secondary`: セカンダリカラー
 - `--accent`: アクセントカラー
 - `--destructive`: 削除・エラー色
 - `--muted`: ミュートカラー
 - `--border`: ボーダー色
 - `--ring`: フォーカスリング色
- スペーシングトークン
- アニメーション定義

### 3. タイポグラフィシステム
- 見出しスタイル（h1〜h6）
- 本文スタイル
- リンクスタイル
- コードブロックスタイル

## 技術要件
- Tailwind CSS v3（安定版で実装済み）
- CSS変数による動的テーマ（ダークモード）
- レスポンシブ対応
- 日本語フォント（Noto Sans JP + システムフォント）

## 完了条件
- [x] tailwind.config.tsの設定完了
- [x] globals.cssのCSS変数定義完了
- [x] デザイントークンのドキュメント作成（`docs/design-tokens.md`）
- [x] サンプルページでのスタイル確認（`/dashboard/design-system`）

## 実装メモ
| 項目 | パス / 備考 |
|------|-------------|
| Tailwind 設定 | `secretary-platform/tailwind.config.ts` |
| グローバル CSS | `secretary-platform/src/app/globals.css` |
| ドキュメント | `secretary-platform/docs/design-tokens.md` |
| プレビュー | `DesignSystemShowcase` + `/dashboard/design-system` |
| 追加トークン | `--success`, `--warning`, `--info`, `--surface-elevated` 等 |

## 注意事項
- 生のHEX値（#FFFFFFなど）はコンポーネント内では使用しない（`:root` のみ）
- Tailwindのgray-*などの色ユーティリティは使用しない
- すべての色はCSS変数経由で指定する
- RootLayout（`app/layout.tsx`）はフォント・ダークテーマ適用のため最小限更新済み
