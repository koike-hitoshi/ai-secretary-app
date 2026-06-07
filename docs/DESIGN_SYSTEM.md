# デザインシステム — AI秘書

Apple風のモダンなUIを一貫して適用するためのデザイントークンと利用ガイド。

## 原則

1. **生の HEX 値はコンポーネントに書かない** — 色は `:root` の CSS 変数 → Tailwind ユーティリティ経由
2. **`gray-*` 等の Tailwind デフォルト色は使わない** — セマンティックトークンのみ
3. **ライトモードのみ** — ダークモード非対応

## ファイル構成

| ファイル | 役割 |
|----------|------|
| `tailwind.config.ts` | Tailwind テーマ拡張（色・フォント・スペーシング・半径・シャドウ・アニメーション） |
| `src/app/globals.css` | CSS 変数の定義、タイポグラフィ、`@config` 読み込み |
| `src/app/(app)/design-system/page.tsx` | サンプルページ（スタイル確認用） |

## カラートークン

| トークン | Tailwind クラス例 | 用途 |
|----------|-------------------|------|
| `--background` | `bg-background` | ページ背景 |
| `--foreground` | `text-foreground` | 本文テキスト |
| `--surface` | `bg-surface` | カード・パネル |
| `--primary` | `bg-primary`, `text-primary` | 主要アクション（Apple Blue） |
| `--primary-foreground` | `text-primary-foreground` | プライマリ上のテキスト |
| `--primary-hover` | `hover:text-primary-hover` | ホバー状態 |
| `--secondary` | `bg-secondary` | サブ背景・ホバー |
| `--secondary-foreground` | `text-secondary-foreground` | セカンダリ上のテキスト |
| `--accent` | `bg-accent`, `text-accent` | 補助アクセント |
| `--destructive` | `bg-destructive`, `text-destructive` | 削除・エラー |
| `--muted` | `text-muted` | ラベル・キャプション |
| `--muted-foreground` | `text-muted-foreground` | 補助テキスト |
| `--border` | `border-border` | ボーダー |
| `--ring` | `ring-ring` | フォーカスリング |
| `--sidebar` | `glass-sidebar` | サイドバー（半透明+ブラー） |

## スペーシング

| トークン | クラス | 値 |
|----------|--------|-----|
| `--space-xs` | `p-xs`, `gap-xs`, `m-xs` | 4px |
| `--space-sm` | `p-sm`, `gap-sm` | 8px |
| `--space-md` | `p-md`, `gap-md` | 16px |
| `--space-lg` | `p-lg`, `gap-lg` | 24px |
| `--space-xl` | `p-xl`, `gap-xl` | 32px |
| `--space-2xl` | `p-2xl` | 48px |
| `--space-3xl` | `p-3xl` | 64px |

## ボーダー半径

| トークン | クラス |
|----------|--------|
| `--radius-sm` | `rounded-sm` |
| `--radius-md` | `rounded-md` |
| `--radius-lg` | `rounded-lg` |
| `--radius-xl` | `rounded-xl` |
| `--radius-2xl` | `rounded-2xl` |
| `--radius-full` | `rounded-full` |

## シャドウ

| トークン | クラス |
|----------|--------|
| `--shadow-sm` | `shadow-sm` |
| `--shadow-md` | `shadow-md` |
| `--shadow-lg` | `shadow-lg` |
| `--shadow-xl` | `shadow-xl` |

## タイポグラフィ

### 見出し（`@layer base` で自動適用）

| 要素 | サイズ | クラス（上書き時） |
|------|--------|-------------------|
| h1 | 34px | `text-4xl font-semibold` |
| h2 | 32px | `text-3xl font-semibold` |
| h3 | 28px | `text-2xl font-semibold` |
| h4 | 20px | `text-xl font-semibold` |
| h5 | 17px | `text-lg font-semibold` |
| h6 | 15px | `text-base font-semibold` |

### ユーティリティクラス

| クラス | 用途 |
|--------|------|
| `text-body` | 本文 |
| `text-caption` | キャプション |
| `text-label` | ラベル（大文字・トラッキング広め） |

### リンク・コード

- リンク: `a` 要素に `text-primary` + ホバーアンダーライン（base 層）
- インラインコード: `code` 要素に `bg-surface ring-border`（base 層）
- コードブロック: `pre` + `pre code`

## アニメーション

| クラス | 説明 |
|--------|------|
| `animate-fade-in` | フェードイン |
| `animate-slide-up` | 下からスライド |
| `animate-scale-in` | スケールイン |

## 使用例

```tsx
<button className="rounded-lg bg-primary px-lg py-sm text-sm font-medium text-primary-foreground shadow-sm transition-colors duration-fast hover:bg-primary-hover">
  保存
</button>

<div className="rounded-2xl border border-border bg-surface p-lg shadow-md">
  <h3>カードタイトル</h3>
  <p className="text-caption">補助テキスト</p>
</div>
```

## 確認方法

```bash
cd secretary-platform
npm run dev
```

http://localhost:3000/design-system で全トークンの見た目を確認できます。
