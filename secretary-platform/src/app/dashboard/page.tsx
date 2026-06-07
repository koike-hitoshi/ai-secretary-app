import Link from 'next/link'
import { DashboardQuickLinks } from '@/components/dashboard/DashboardQuickLinks'
import { PageHeader } from '@/components/ui/PageHeader'

export default function DashboardHomePage() {
  return (
    <>
      <PageHeader
        title="ダッシュボード"
        description="ルーティン業務を一つのアプリで。各機能へクイックアクセスできます。"
      />
      <DashboardQuickLinks />
      <section className="mx-xl mb-xl max-w-3xl rounded-2xl border border-border bg-surface-elevated p-lg">
        <h3 className="text-lg font-semibold text-foreground">
          このアプリについて
        </h3>
        <p className="mt-sm text-body text-muted-foreground">
          タスク管理・文章校正・議事録・リサーチ・Googleカレンダーを統合した無料のAI秘書アプリです。
          Googleアカウントでログインし、データは永久保存されます（エクスポート機能なし）。
          仕様の詳細は <code>docs/REQUIREMENTS.md</code>、デザインは{' '}
          <Link
            href="/dashboard/design-system"
            className="text-primary hover:text-primary-hover"
          >
            デザインシステム
          </Link>{' '}
          を参照してください。
        </p>
      </section>
    </>
  )
}
