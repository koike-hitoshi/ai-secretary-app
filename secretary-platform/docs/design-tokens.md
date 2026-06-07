# デザイントークン

Apple Human Interface Guidelines（ダークモード）に準拠したデザインシステムのリファレンスです。

## 原則

1. **トークン経由のみ** — コンポーネント内で `#FFFFFF` や `gray-*` などの生値は使わない
2. **CSS 変数が唯一のソース** — 色・影・スペーシングは `globals.css` の `:root` で定義
3. **Tailwind ユーティリティで参照** — `bg-background`, `text-foreground`, `shadow-md` など
4. **RootLayout は編集しない** — テーマは `:root` トークンで制御

## カラートークン

| トークン | CSS 変数 | Tailwind | 用途 |
|---------|----------|----------|------|
| Background | `--background` | `bg-background` | ページ背景 |
| Foreground | `--foreground` | `text-foreground` | 主要テキスト |
| Surface | `--surface` | `bg-surface` | カード・メイン領域 |
| Surface Elevated | `--surface-elevated` | `bg-surface-elevated` | コードブロック・浮き上がり |
| Primary | `--primary` | `bg-primary`, `text-primary` | アクション・リンク |
| Primary Hover | `--primary-hover` | `hover:bg-primary-hover` | ホバー状態 |
| Secondary | `--secondary` | `bg-secondary` | 二次ボタン・背景 |
| Accent | `--accent` | `bg-accent` | 強調 |
| Destructive | `--destructive` | `bg-destructive` | 削除・エラー |
| Muted | `--muted` | `text-muted` | ラベル・非活性 |
| Muted Foreground | `--muted-foreground` | `text-muted-foreground` | キャプション |
| Border | `--border` | `border-border` | 区切り線 |
| Ring | `--ring` | `ring-ring` | フォーカスリング |
| Sidebar | `--sidebar` | `.glass-sidebar` | サイドバー（ビブランシー） |

## タイポグラフィ

| スタイル | クラス / 要素 | サイズ |
|---------|--------------|--------|
| H1 | `<h1>` | `text-4xl` |
| H2 | `<h2>` | `text-3xl` |
| H3 | `<h3>` | `text-2xl` |
| H4 | `<h4>` | `text-xl` |
| H5 | `<h5>` | `text-lg` |
| H6 | `<h6>` | `text-base` |
| 本文 | `.text-body` / `<p>` | `text-base` |
| キャプション | `.text-caption` | `text-sm` |
| ラベル | `.text-label` | `text-xs` uppercase |

フォントスタック: SF Pro → `-apple-system` → Geist Sans（フォールバック）

## スペーシング（8pt グリッド）

| トークン | 値 | Tailwind |
|---------|-----|----------|
| xs | 4px | `p-xs`, `gap-xs`, `mt-xs` |
| sm | 8px | `p-sm`, `gap-sm` |
| md | 16px | `p-md`, `gap-md` |
| lg | 24px | `p-lg`, `gap-lg` |
| xl | 32px | `p-xl`, `gap-xl` |
| 2xl | 48px | `p-2xl` |
| 3xl | 64px | `p-3xl` |

## 角丸

| トークン | Tailwind |
|---------|----------|
| sm | `rounded-sm` |
| md | `rounded-md` |
| lg | `rounded-lg` |
| xl | `rounded-xl` |
| 2xl | `rounded-2xl` |
| full | `rounded-full` |

## シャドウ

| トークン | Tailwind | 用途 |
|---------|----------|------|
| sm | `shadow-sm` | ボタン・小カード |
| md | `shadow-md` | 標準カード |
| lg | `shadow-lg` | モーダル |
| xl | `shadow-xl` | オーバーレイ |
| glow | `shadow-glow` | ダーク UI の微細な縁取り |

## アニメーション

| 名前 | クラス | 用途 |
|------|--------|------|
| fade-in | `animate-fade-in` | フェードイン |
| slide-up | `animate-slide-up` | 下からスライド |
| scale-in | `animate-scale-in` | スケールイン |

- Fast: 150ms — ホバー・フォーカス
- Normal: 250ms — 標準トランジション
- Slow: 400ms — ページ遷移

## コンポーネントクラス

| クラス | 用途 |
|--------|------|
| `.btn-primary` | プライマリボタン（最小 44px タッチターゲット） |
| `.btn-secondary` | セカンダリボタン |
| `.card` | 標準カード |
| `.card-elevated` | 浮き上がったカード |
| `.glass-sidebar` | ビブランシー素材（サイドバー） |
| `.material-thin` | 薄いビブランシー素材 |

## 確認ページ

`/design-system` で全トークン・スタイルのライブプレビューを確認できます。

```bash
cd secretary-platform
npm run dev
# → http://localhost:3000/design-system
```

## ファイル構成

```
tailwind.config.ts   # Tailwind v3 — トークン → ユーティリティのマッピング
src/app/globals.css  # :root CSS 変数 + @layer base/components/utilities
```
