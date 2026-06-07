'use client'

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="ja">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          padding: '2rem',
          backgroundColor: '#000000',
          color: '#f5f5f7',
          fontFamily:
            '"Hiragino Sans", "Yu Gothic UI", "Meiryo", sans-serif',
          fontSize: '16px',
          lineHeight: 1.6,
        }}
      >
        <h1 style={{ fontSize: '1.5rem', margin: 0 }}>エラーが発生しました</h1>
        <p style={{ margin: 0, color: '#c7c7cc', maxWidth: '28rem', textAlign: 'center' }}>
          アプリの読み込みに失敗しました。ターミナルで dev サーバーを止め、
          <code style={{ color: '#fff' }}> npm run dev</code> を再実行してください。
        </p>
        <button
          type="button"
          onClick={() => reset()}
          style={{
            minHeight: '44px',
            padding: '0 1.5rem',
            borderRadius: '0.5rem',
            border: 'none',
            backgroundColor: '#0a84ff',
            color: '#ffffff',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          再試行
        </button>
      </body>
    </html>
  )
}
