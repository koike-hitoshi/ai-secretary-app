import { NextResponse, type NextRequest } from 'next/server'

import { pollTranscription } from '@/lib/minutes/minutesService'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUserOrThrow } from '@/lib/supabase/users'

export const dynamic = 'force-dynamic'

type RouteContext = {
  params: Promise<{ id: string }>
}

const noStoreHeaders = {
  'Cache-Control': 'no-store, no-cache, must-revalidate',
}

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const supabase = await createClient()
    const user = await getCurrentUserOrThrow(supabase)

    const job = await pollTranscription(supabase, user.id, id)

    return NextResponse.json(
      {
        transcriptionId: job.assemblyaiId,
        minutesId: job.minutesId,
        status: job.status,
        progress: job.progress,
        result: job.result,
        error: job.error,
      },
      { headers: noStoreHeaders },
    )
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'ステータス取得に失敗しました' },
      { status: 500, headers: noStoreHeaders },
    )
  }
}
