import { redirect, notFound } from 'next/navigation'

import { MinutesDetailClient } from '@/components/documents/MinutesDetailClient'
import { PageHeader } from '@/components/ui/PageHeader'
import { getMinutes } from '@/lib/minutes/minutesService'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/supabase/users'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function MinutesDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const user = await getCurrentUser(supabase)

  if (!user) {
    redirect(`/login?redirect=/dashboard/documents/minutes/${id}`)
  }

  let record = null
  try {
    record = await getMinutes(supabase, user.id, id)
  } catch {
    record = null
  }

  if (!record) {
    notFound()
  }

  return (
    <>
      <PageHeader title="議事録詳細" description={record.title} />
      <MinutesDetailClient initialRecord={record} />
    </>
  )
}
