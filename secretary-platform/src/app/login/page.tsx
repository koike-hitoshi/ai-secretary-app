'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'

import { useAuth } from '@/lib/auth/AuthContext'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Card, CardBody, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'

function getLoginErrorMessage(code: string): string {
  switch (code) {
    case 'auth_callback_error':
      return '認証コールバックに失敗しました。'
    case 'exchange_failed':
      return 'セッションの確立に失敗しました。'
    default:
      return `認証エラー (${code})`
  }
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}

function LoginForm() {
  const { signIn } = useAuth()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const redirectTo = searchParams.get('redirect') ?? '/dashboard'
  const callbackError = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  const displayError =
    error ??
    (errorDescription
      ? decodeURIComponent(errorDescription.replace(/\+/g, ' '))
      : callbackError
        ? getLoginErrorMessage(callbackError)
        : null)

  const showGoogleSetupHint =
    callbackError === 'server_error' ||
    callbackError === 'exchange_failed' ||
    errorDescription?.includes('exchange external code')

  const handleSignIn = async () => {
    setLoading(true)
    setError(null)

    try {
      await signIn(redirectTo)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'ログインに失敗しました。もう一度お試しください。',
      )
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-background px-md py-xl">
      <Card elevated className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-md flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">
            AI
          </div>
          <CardTitle>AI Secretary Platform</CardTitle>
          <CardDescription>
            Googleアカウントでログインして、タスク管理・文章校正・議事録・リサーチを始めましょう。
          </CardDescription>
        </CardHeader>

        <CardBody className="space-y-md">
          {displayError && (
            <Alert type="error" title="ログインエラー">
              {displayError}
              {showGoogleSetupHint && (
                <ul className="mt-sm list-disc space-y-xs pl-md text-sm">
                  <li>
                    Google Cloud Console の Redirect URI に追加:
                    <br />
                    <code className="text-xs">
                      https://curlkwygoozixibypwaq.supabase.co/auth/v1/callback
                    </code>
                  </li>
                  <li>
                    Supabase → Auth → Providers → Google の Client ID / Secret
                    を Google Cloud と一致させる
                  </li>
                  <li>
                    現在の Client ID が Google 側で無効な可能性があります。Google
                    Cloud で Web アプリケーション用 OAuth クライアントを新規作成し、
                    上記 Redirect URI を登録してから Supabase に貼り直してください。
                  </li>
                </ul>
              )}
            </Alert>
          )}

          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full"
            loading={loading}
            leftIcon={!loading ? <GoogleIcon /> : undefined}
            onClick={handleSignIn}
          >
            Googleでログイン
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            ログインすることで、データはあなたのアカウントに安全に保存されます。
          </p>
        </CardBody>
      </Card>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-full flex-1 items-center justify-center">
          <Spinner size="lg" label="読み込み中" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
