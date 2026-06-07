import { redirect } from 'next/navigation'

import { MinutesPageClient } from '@/components/documents/MinutesPageClient'
import { PageHeader } from '@/components/ui/PageHeader'
import { listMinutes } from '@/lib/minutes/minutesService'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/supabase/users'

export default async function MinutesPage() {
  const supabase = await createClient()
  const user = await getCurrentUser(supabase)

  if (!user) {
    redirect('/login?redirect=/dashboard/documents/minutes')
  }

  const { items } = await listMinutes(supabase, user.id, 1, 20)

  return (
    <>
      <PageHeader
        title="議事録作成"
        description="音声をアップロードすると、文字起こしから議事録まで自動生成します。"
      />
      <MinutesPageClient initialItems={items} />
    </>
  )
}
