# 動作確認レポート（チケット #01–#03）

実施日: 2026-05-30  
対象: デザインシステム / UIコンポーネント / ページレイアウト

## 自動チェック

| 項目 | 結果 |
|------|------|
| `npm run lint` | 通過（`global-error.tsx` の未使用変数 warning のみ） |
| `npm run build` | 通過（全11ルート静的生成） |
| スモークテスト | `node scripts/verify-smoke.mjs`（dev 起動中） |

```bash
cd secretary-platform
npm run dev:clean
# 別ターミナル
node scripts/verify-smoke.mjs
```

---

## 1. 各コンポーネントの表示

| コンポーネント | 確認方法 | 結果 |
|---------------|---------|------|
| Button（5 variant / 3 size / loading） | `/dashboard/design-system` ComponentShowcase | OK |
| Input / Textarea | 同上 | OK |
| Card / Modal / Alert | 同上 | OK |
| Select（検索・複数選択） | 同上 | OK |
| Badge / Spinner / Tabs | 同上 | OK |
| PageHeader / ComingSoon | 各機能ページ | OK |
| デザイントークン（色・タイポ・影） | DesignSystemShowcase | OK |

**デザインルール:** `src/` 内に `gray-*` / `zinc-*` 等の禁止ユーティリティなし。HEX は `globals.css` の `:root` のみ。

---

## 2. ナビゲーション

| 項目 | 結果 |
|------|------|
| `/` → `/dashboard` リダイレクト | OK (307) |
| サイドバー6項目 + デザインシステムリンク | OK |
| 各 `href`（`/dashboard/tasks` 等） | 全ルート HTTP 200 |
| 旧URL（`/tasks`, `/proofreading` 等） | `next.config` で新URLへリダイレクト |
| アクティブ表示 `aria-current="page"` | ダッシュボードで確認 |
| モバイル: ハンバーガー → MobileMenu | 実装済（`lg` 未満） |

---

## 3. デザインの一貫性

| 項目 | 結果 |
|------|------|
| ダークテーマ（CSS変数） | OK |
| フォント（Noto Sans JP + システムフォント） | OK |
| 8pt グリッド spacing トークン | OK |
| Header / Sidebar / Main 構造 | DashboardLayout で統一 |
| カード・ボタン・フォームの角丸・影 | トークン経由で統一 |

**軽微な注意:** Button `size="sm"` は `min-h-[36px]`（HIG 44pt より小さい）。コンパクト用途向け。

---

## 4. アクセシビリティ

| 項目 | 実装箇所 | 結果 |
|------|---------|------|
| `aria-current`（現在地） | NavigationItem | OK |
| `aria-label`（アイコンボタン） | Header, MobileMenu, UserMenu | OK |
| `aria-invalid` / `aria-describedby` | Input, Textarea, Select | OK |
| `role="dialog"` + `aria-modal` | Modal, MobileMenu | OK |
| `role="tablist/tab/tabpanel"` | Tabs | OK |
| `role="listbox/option"` | Select | OK |
| `role="alert"` | Alert, エラーメッセージ | OK |
| `focus-visible` リング | 主要インタラクティブ要素 | OK |
| `sr-only`（Spinner） | Spinner | OK |
| キーボード（Select ↑↓ Enter Esc） | Select | OK |
| `prefers-reduced-motion` | globals.css | OK |
| タッチターゲット 44px | Button md/lg, Header ボタン | OK |

**改善候補（未対応）**

- Modal のフォーカストラップ（Tab 循環）
- Header 検索 Input の `<label>` 視覚表示（`aria-label` はあり）

---

## 手動確認チェックリスト

ブラウザで http://localhost:3000/dashboard を開き、以下を目視確認してください。

- [ ] 日本語が読める（16px 前後、白文字 on 黒背景）
- [ ] サイドバーから全ページへ遷移できる
- [ ] `/dashboard/design-system` で全 UI が表示される
- [ ] Tab キーでフォーカスリングが見える
- [ ] 幅 < 1024px でハンバーガーメニューが開く

---

## 画面が出ない・Internal Server Error のとき

アプリ本体のビルドは通っていても、**開発環境**で次の原因が多いです。

| 症状 | よくある原因 |
|------|----------------|
| 接続できない | `npm run dev` 未起動、または **別フォルダ**で実行している |
| Internal Server Error | 壊れた `.next` キャッシュ、**3000 番の古いプロセス** |
| 真っ白 / 真っ黒だけ | JS/CSS チャンク読み込み失敗（キャッシュ・OneDrive 同期） |
| ターミナルに何も出ない | 初回コンパイル待ち、またはポート競合で起動失敗 |

**推奨手順（PowerShell）:**

```powershell
cd secretary-platform
npm run dev:fresh
```

別ターミナルで:

```powershell
cd secretary-platform
npm run verify:smoke
```

`All smoke checks passed` ならサーバーは正常。ブラウザは **Ctrl+Shift+R** でハードリロードし、F12 → Console に赤エラーがないか確認してください。

OneDrive 上のプロジェクトでは `.next` の同期で不具合が出ることがあります。再発する場合は `.next` を同期対象外にするか、ローカル非同期フォルダへ移すことを検討してください。

---

## 結論

**チケット #01–#03 の実装は、ビルド・ルート・マークアップ・a11y 属性の観点で問題なく動作しています。**  
引き続き E2E（Playwright 等）は未導入のため、リグレッション防止には `scripts/verify-smoke.mjs` または E2E 追加を推奨します。
