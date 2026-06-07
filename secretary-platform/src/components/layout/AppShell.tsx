import { DashboardLayout } from '@/components/layout/DashboardLayout'

type AppShellProps = {
  children: React.ReactNode
}

/** @deprecated Use DashboardLayout */
export function AppShell({ children }: AppShellProps) {
  return <DashboardLayout>{children}</DashboardLayout>
}
