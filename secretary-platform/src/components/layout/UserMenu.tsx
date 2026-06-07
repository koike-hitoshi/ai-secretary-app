'use client'

import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

import { useAuth } from '@/lib/auth/AuthContext'
import { cn } from '@/lib/utils'
import { IconChevronDown } from '@/components/ui/icons'

export function UserMenu() {
  const { user, isLoading, signOut } = useAuth()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const menuId = useId()

  const userName = user?.name ?? 'ゲストユーザー'
  const userEmail = user?.email ?? 'guest@example.com'
  const avatarUrl = user?.avatarUrl
  const initials = userName.slice(0, 2)

  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    if (!open) return
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        close()
      }
    }
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open, close])

  const handleSignOut = async () => {
    setSigningOut(true)
    try {
      await signOut()
      router.replace('/login')
      router.refresh()
    } catch {
      router.replace('/login')
      router.refresh()
    } finally {
      setSigningOut(false)
      close()
    }
  }

  if (isLoading) {
    return (
      <div
        className="h-9 w-9 animate-pulse rounded-full bg-secondary"
        aria-label="ユーザー情報を読み込み中"
      />
    )
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'flex min-h-[44px] items-center gap-sm rounded-lg px-sm py-xs transition-colors duration-fast',
          'hover:bg-secondary',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        )}
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt=""
            className="h-9 w-9 shrink-0 rounded-full object-cover"
          />
        ) : (
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground"
            aria-hidden
          >
            {initials}
          </span>
        )}
        <span className="hidden text-left sm:block">
          <span className="block max-w-[8rem] truncate text-sm font-medium text-foreground">
            {userName}
          </span>
          <span className="block max-w-[8rem] truncate text-xs text-muted-foreground">
            {userEmail}
          </span>
        </span>
        <IconChevronDown
          size={16}
          className={cn(
            'hidden shrink-0 text-muted-foreground transition-transform duration-fast sm:block',
            open && 'rotate-180',
          )}
        />
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          className="absolute right-0 top-full z-50 mt-xs min-w-[12rem] animate-scale-in rounded-xl border border-border bg-surface-elevated py-xs shadow-lg"
        >
          <div className="border-b border-border px-md py-sm">
            <p className="text-sm font-medium text-foreground">{userName}</p>
            <p className="text-xs text-muted-foreground">{userEmail}</p>
          </div>
          <button
            type="button"
            role="menuitem"
            className="flex w-full px-md py-sm text-left text-sm text-foreground transition-colors duration-fast hover:bg-secondary"
            onClick={close}
          >
            プロフィール設定
          </button>
          <button
            type="button"
            role="menuitem"
            disabled={signingOut}
            className="flex w-full px-md py-sm text-left text-sm text-destructive transition-colors duration-fast hover:bg-destructive/10 disabled:opacity-50"
            onClick={handleSignOut}
          >
            {signingOut ? 'ログアウト中...' : 'ログアウト'}
          </button>
        </div>
      )}
    </div>
  )
}
