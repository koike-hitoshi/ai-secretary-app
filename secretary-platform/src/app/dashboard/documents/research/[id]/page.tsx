import { notFound, redirect } from 'next/navigation'

import { ResearchDetailClient } from '@/components/documents/ResearchDetailClient'
import { PageHeader } from '@/components/ui/PageHeader'
import { getResearch } from '@/lib/research/researchService'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/supabase/users'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function ResearchDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const user = await getCurrentUser(supabase)

  if (!user) {
    redirect(`/login?redirect=/dashboard/documents/research/${id}`)
  }

  let record = null
  try {
    record = await getResearch(supabase, user.id, id)
  } catch {
    record = null
  }

  if (!record) {
    notFound()
  }

  return (
    <>
      <PageHeader title="リサーチ詳細" description={record.theme} />
      <ResearchDetailClient initialRecord={record} />
    </>
  )
}
