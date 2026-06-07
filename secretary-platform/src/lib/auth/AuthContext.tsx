'use client'

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import { signInWithGoogle } from '@/lib/auth/auth'
import { createClient } from '@/lib/supabase/client'
import { getCurrentUser, mapUser, type AppUser } from '@/lib/supabase/users'

type AuthContextType = {
  user: AppUser | null
  isLoading: boolean
  signIn: (redirectTo?: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    let mounted = true

    const loadUser = async () => {
      try {
        const currentUser = await getCurrentUser(supabase)
        if (mounted) {
          setUser(currentUser)
        }
      } catch {
        if (mounted) {
          setUser(null)
        }
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    loadUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return
      setUser(session?.user ? mapUser(session.user) : null)
      setIsLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase])

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isLoading,
      signIn: signInWithGoogle,
      signOut: async () => {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
        setUser(null)
      },
    }),
    [user, isLoading, supabase],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
