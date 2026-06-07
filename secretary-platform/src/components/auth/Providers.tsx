'use client'

import { type ReactNode } from 'react'

import { AuthProvider } from '@/lib/auth/AuthContext'
import { Alert } from '@/components/ui/Alert'

type ProvidersProps = {
  children: ReactNode
}

function EnvGuard({ children }: { children: ReactNode }) {
  const hasSupabaseUrl = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL)
  const hasSupabaseKey = Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

  if (!hasSupabaseUrl || !hasSupabaseKey) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-xl">
        <div className="max-w-lg">
          <Alert type="error" title="環境変数が未設定です">
            <p>
              <code>secretary-platform/.env.local</code> に Supabase の
              URL と ANON_KEY を設定してから、dev サーバーを再起動してください。
            </p>
          </Alert>
        </div>
      </div>
    )
  }

  return children
}

export function Providers({ children }: ProvidersProps) {
  return (
    <EnvGuard>
      <AuthProvider>{children}</AuthProvider>
    </EnvGuard>
  )
}
