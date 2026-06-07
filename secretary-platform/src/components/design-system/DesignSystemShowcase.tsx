const colorSwatches = [
  { name: 'background', className: 'bg-background ring-1 ring-border' },
  { name: 'foreground', className: 'bg-foreground' },
  { name: 'surface', className: 'bg-surface ring-1 ring-border' },
  { name: 'surface-elevated', className: 'bg-surface-elevated ring-1 ring-border' },
  { name: 'primary', className: 'bg-primary' },
  { name: 'secondary', className: 'bg-secondary' },
  { name: 'accent', className: 'bg-accent' },
  { name: 'destructive', className: 'bg-destructive' },
  { name: 'muted', className: 'bg-muted' },
  { name: 'border', className: 'bg-border' },
] as const

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="animate-fade-in card-elevated p-xl">
      <h2 className="text-xl">{title}</h2>
      <div className="mt-lg">{children}</div>
    </section>
  )
}

export function DesignSystemShowcase() {
  return (
    <div className="flex flex-col gap-xl bg-background p-xl">
      <Section title="カラー（ダークテーマ）">
        <div className="grid grid-cols-2 gap-md sm:grid-cols-3 lg:grid-cols-5">
          {colorSwatches.map((swatch) => (
            <div key={swatch.name} className="flex flex-col gap-sm">
              <div
                className={`h-16 rounded-lg shadow-glow ${swatch.className}`}
              />
              <span className="text-caption font-mono">{swatch.name}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="タイポグラフィ">
        <div className="flex flex-col gap-md">
          <h1>見出し H1 — AI秘書</h1>
          <h2>見出し H2 — タスク管理</h2>
          <h3>見出し H3 — 文章校正</h3>
          <h4>見出し H4 — 議事録</h4>
          <h5>見出し H5 — リサーチ</h5>
          <h6>見出し H6 — カレンダー</h6>
          <p className="text-body">
            本文テキスト。ルーティン業務を効率化する統合型AI秘書アプリです。
          </p>
          <p className="text-caption">キャプション — 補助的な説明テキスト</p>
          <p className="text-label">ラベル — SECTION LABEL</p>
          <p>
            <a href="#typography">リンクスタイルのサンプル</a>
          </p>
          <p>
            インラインコード: <code>npm run dev</code>
          </p>
          <pre>
            <code>{`const greeting = 'Hello, AI Secretary'`}</code>
          </pre>
        </div>
      </Section>

      <Section title="ボタン（HIG 44pt タッチターゲット）">
        <div className="flex flex-wrap gap-md">
          <button type="button" className="btn-primary">
            Primary
          </button>
          <button type="button" className="btn-secondary">
            Secondary
          </button>
          <button
            type="button"
            className="btn-primary bg-accent hover:bg-accent"
          >
            Accent
          </button>
          <button
            type="button"
            className="btn-primary bg-destructive hover:bg-destructive"
          >
            Destructive
          </button>
        </div>
      </Section>

      <Section title="カード & シャドウ">
        <div className="grid gap-md sm:grid-cols-2 lg:grid-cols-4">
          <div className="card shadow-sm">
            <p className="font-semibold">shadow-sm</p>
            <p className="text-caption">カードコンポーネント例</p>
          </div>
          <div className="card shadow-md">
            <p className="font-semibold">shadow-md</p>
            <p className="text-caption">カードコンポーネント例</p>
          </div>
          <div className="card-elevated shadow-lg">
            <p className="font-semibold">shadow-lg</p>
            <p className="text-caption">カードコンポーネント例</p>
          </div>
          <div className="card-elevated shadow-xl">
            <p className="font-semibold">shadow-xl</p>
            <p className="text-caption">カードコンポーネント例</p>
          </div>
        </div>
      </Section>

      <Section title="スペーシング & 角丸">
        <div className="flex flex-wrap items-end gap-md">
          <div className="flex h-20 w-20 items-center justify-center rounded-sm bg-secondary text-caption">
            sm
          </div>
          <div className="flex h-20 w-20 items-center justify-center rounded-md bg-secondary text-caption">
            md
          </div>
          <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-secondary text-caption">
            lg
          </div>
          <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-secondary text-caption">
            xl
          </div>
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-secondary text-caption">
            2xl
          </div>
        </div>
      </Section>

      <Section title="ビブランシー素材">
        <div className="material-thin rounded-xl border border-border p-lg">
          <p className="font-semibold">material-thin</p>
          <p className="text-caption">
            サイドバーと同じ半透明ブラー素材（Human Interface Guidelines
            Materials）
          </p>
        </div>
      </Section>

      <Section title="アニメーション">
        <div className="flex flex-wrap gap-md">
          <div className="animate-fade-in rounded-lg bg-secondary px-lg py-md text-sm">
            fade-in
          </div>
          <div className="animate-slide-up rounded-lg bg-secondary px-lg py-md text-sm">
            slide-up
          </div>
          <div className="animate-scale-in rounded-lg bg-secondary px-lg py-md text-sm">
            scale-in
          </div>
        </div>
      </Section>
    </div>
  )
}
