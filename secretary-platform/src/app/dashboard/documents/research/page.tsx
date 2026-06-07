import { redirect } from 'next/navigation'

import { ResearchPageClient } from '@/components/documents/ResearchPageClient'
import { PageHeader } from '@/components/ui/PageHeader'
import { listResearch } from '@/lib/research/researchService'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/supabase/users'

export default async function ResearchPage() {
  const supabase = await createClient()
  const user = await getCurrentUser(supabase)

  if (!user) {
    redirect('/login?redirect=/dashboard/documents/research')
  }

  const { items } = await listResearch(supabase, user.id, 1, 20)

  return (
    <>
      <PageHeader
        title="リサーチ"
        description="テーマを入力するだけで、最新情報を調査して要約します。"
      />
      <ResearchPageClient initialItems={items} />
    </>
  )
}
