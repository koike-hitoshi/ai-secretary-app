import { NextResponse, type NextRequest } from 'next/server'

import { startTranscription } from '@/lib/minutes/minutesService'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUserOrThrow } from '@/lib/supabase/users'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const user = await getCurrentUserOrThrow(supabase)
    const body = (await request.json()) as {
      uploadId?: string
      meetingTitle?: string
    }

    if (!body.uploadId?.trim()) {
      return NextResponse.json({ error: 'uploadId が必要です' }, { status: 400 })
    }

    const result = await startTranscription(
      supabase,
      user.id,
      body.uploadId,
      body.meetingTitle,
    )

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '文字起こしの開始に失敗しました' },
      { status: 500 },
    )
  }
}
