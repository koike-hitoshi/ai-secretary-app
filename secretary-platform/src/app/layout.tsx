import type { Metadata } from 'next'
import { Noto_Sans_JP } from 'next/font/google'

import { Providers } from '@/components/auth/Providers'
import './globals.css'

const notoSansJP = Noto_Sans_JP({
  variable: '--font-noto-sans-jp',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  preload: true,
  fallback: [
    'Hiragino Sans',
    'Hiragino Kaku Gothic ProN',
    'Yu Gothic UI',
    'Meiryo',
    'sans-serif',
  ],
})

export const metadata: Metadata = {
  title: 'AI Secretary Platform',
  description:
    'タスク管理・文章校正・議事録・リサーチ・カレンダーを統合したAI秘書アプリ',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="ja"
      className={`${notoSansJP.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
