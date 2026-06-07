'use client'

import { useRouter } from 'next/navigation'
import { useEffect, type ReactNode } from 'react'

import { useAuth } from '@/lib/auth/AuthContext'
import { Spinner } from '@/components/ui/Spinner'

type AuthGuardProps = {
  children: ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login')
    }
  }, [isLoading, user, router])

  if (isLoading) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center bg-background">
        <Spinner size="lg" label="認証状態を確認中" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center bg-background">
        <Spinner size="lg" label="ログインページへ移動中" />
      </div>
    )
  }

  return children
}
