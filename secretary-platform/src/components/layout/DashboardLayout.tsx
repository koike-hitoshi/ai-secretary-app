'use client'

import { useState, type ReactNode } from 'react'

import { AuthGuard } from '@/components/auth/AuthGuard'
import { Header } from '@/components/layout/Header'
import { MobileMenu } from '@/components/layout/MobileMenu'
import { Sidebar } from '@/components/layout/Sidebar'

export type DashboardLayoutProps = {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <AuthGuard>
      <div className="flex min-h-full flex-1 flex-col bg-background">
        <Header onOpenMobileMenu={() => setMobileMenuOpen(true)} />
        <div className="flex min-h-0 flex-1">
          <Sidebar />
          <main className="flex min-w-0 flex-1 flex-col overflow-auto bg-background">
            {children}
          </main>
        </div>
        <MobileMenu
          open={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />
      </div>
    </AuthGuard>
  )
}
