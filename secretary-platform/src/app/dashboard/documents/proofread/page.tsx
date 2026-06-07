import { redirect } from 'next/navigation'

import { ProofreadPageClient } from '@/components/documents/ProofreadPageClient'
import { PageHeader } from '@/components/ui/PageHeader'
import {
  getProofreadHistory,
  getUserWritingStyleProfile,
} from '@/lib/documents/proofreadService'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/supabase/users'

export default async function ProofreadPage() {
  const supabase = await createClient()
  const user = await getCurrentUser(supabase)

  if (!user) {
    redirect('/login?redirect=/dashboard/documents/proofread')
  }

  const [profile, history] = await Promise.all([
    getUserWritingStyleProfile(supabase, user.id),
    getProofreadHistory(supabase, user.id, 1, 20),
  ])

  return (
    <>
      <PageHeader
        title="文章校正"
        description="メールや報告書を、あなたの文体に合わせて校正します。"
      />
      <ProofreadPageClient
        initialProfile={profile}
        initialHistory={history.items}
      />
    </>
  )
}
