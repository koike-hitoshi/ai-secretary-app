# ページレイアウト（チケット #03）

## ルート構造

```
/dashboard                          … ダッシュボードホーム
/dashboard/tasks                    … タスク管理
/dashboard/calendar                 … カレンダー
/dashboard/documents/proofread      … 文章校正
/dashboard/documents/minutes        … 議事録
/dashboard/documents/research       … リサーチ
/dashboard/design-system            … デザイン確認（開発用）
```

旧 URL（`/tasks` など）は `next.config.ts` の `redirects` で `/dashboard/*` へ転送されます。

## レイアウトコンポーネント

| ファイル | 役割 |
|---------|------|
| `dashboard/layout.tsx` | `DashboardLayout` を適用 |
| `DashboardLayout.tsx` | Header + Sidebar + Main + MobileMenu |
| `Header.tsx` | ロゴ、検索（md+）、通知、ユーザーメニュー、ハンバーガー |
| `Sidebar.tsx` | デスクトップナビ（`lg:` 以上） |
| `MobileMenu.tsx` | モバイル用スライドインメニュー |
| `NavigationItem.tsx` | ナビ項目（アイコン・バッジ・アクティブ） |
| `UserMenu.tsx` | アバター・ドロップダウン |

## レスポンシブ

- **lg 未満:** サイドバー非表示、Header のハンバーガーで `MobileMenu`
- **lg 以上:** 固定サイドバー（240px）、Header 常時表示
- タッチターゲット: 最小 44×44px（HIG）

## ナビゲーション定義

`src/lib/navigation.ts` の `DASHBOARD_NAV_ITEMS` を編集してください。

## 制約

- `app/layout.tsx`（RootLayout）は変更しない
- 色はデザイントークン（`bg-background` 等）のみ
