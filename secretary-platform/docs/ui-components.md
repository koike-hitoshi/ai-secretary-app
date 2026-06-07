# 共通 UI コンポーネント

`src/components/ui/` — Apple HIG 準拠・ダークテーマ・CSS 変数トークンのみ使用。

```tsx
import { Button, Input, Card } from '@/components/ui'
```

## Button

| Prop | 型 | デフォルト | 説明 |
|------|-----|-----------|------|
| `variant` | `primary \| secondary \| outline \| ghost \| destructive` | `primary` | 見た目 |
| `size` | `sm \| md \| lg` | `md` | サイズ（最小 44pt は md/lg） |
| `loading` | `boolean` | `false` | スピナー表示・無効化 |
| `leftIcon` / `rightIcon` | `ReactNode` | — | アイコン |
| `disabled` | `boolean` | — | 無効状態 |

## Input

| Prop | 型 | 説明 |
|------|-----|------|
| `label` | `string` | ラベル |
| `error` | `string` | エラーメッセージ（`aria-invalid`） |
| `hint` | `string` | 補足テキスト |
| `inputSize` | `sm \| md \| lg` | サイズ |
| `type` | HTML input type | `text`, `email`, `password`, `number`, `search` 等 |

## Textarea

| Prop | 型 | 説明 |
|------|-----|------|
| `autoResize` | `boolean` | 入力に応じて高さ自動調整 |
| `showCount` | `boolean` | 文字数表示 |
| `maxLength` | `number` | 最大文字数 |

## Card

| コンポーネント | 説明 |
|---------------|------|
| `Card` | `interactive`, `elevated` でホバー・影 |
| `CardHeader` / `CardTitle` / `CardDescription` | ヘッダー領域 |
| `CardBody` | 本文 |
| `CardFooter` | フッター（区切り線付き） |

## Modal

| Prop | 型 | 説明 |
|------|-----|------|
| `open` | `boolean` | 表示状態 |
| `onClose` | `() => void` | 閉じる |
| `title` | `string` | タイトル（`aria-labelledby`） |
| `size` | `sm \| md \| lg \| full` | 幅 |
| `closeOnOverlayClick` | `boolean` | オーバーレイクリックで閉じる |

Esc キーで閉じます。`role="dialog"` + `aria-modal`。

## Alert

| Prop | 型 | 説明 |
|------|-----|------|
| `type` | `info \| success \| warning \| error` | 種別・アイコン |
| `title` | `string` | 見出し（任意） |
| `dismissible` | `boolean` | 閉じるボタン |

## Select

| Prop | 型 | 説明 |
|------|-----|------|
| `options` | `{ value, label, disabled? }[]` | 選択肢 |
| `searchable` | `boolean` | 検索フィルター |
| `multiple` | `boolean` | 複数選択 |
| `value` / `onChange` | 制御コンポーネント | 単一: `string`、複数: `string[]` |

キーボード: ↑↓ で移動、Enter/Space で選択、Esc で閉じる。

## Badge

| Prop | 型 | 説明 |
|------|-----|------|
| `variant` | `default \| primary \| secondary \| accent \| success \| warning \| destructive` | 色 |
| `size` | `sm \| md` | サイズ |
| `dismissible` | `boolean` | 削除ボタン |
| `onDismiss` | `() => void` | 削除時 |

## Spinner

| Prop | 型 | デフォルト |
|------|-----|-----------|
| `size` | `sm \| md \| lg` | `md` |
| `color` | `primary \| foreground \| muted` | `primary` |
| `label` | `string` | `読み込み中`（`aria-label`） |

## Tabs

```tsx
<Tabs defaultValue="a" onValueChange={setTab}>
  <TabsList>
    <TabsTrigger value="a" icon={<Icon />}>A</TabsTrigger>
  </TabsList>
  <TabsContent value="a">...</TabsContent>
</Tabs>
```

`role="tablist"` / `tab` / `tabpanel`、アクティブタブのみ `tabIndex={0}`。

## プレビュー

`/design-system` — `ComponentShowcase` + `DesignSystemShowcase`
