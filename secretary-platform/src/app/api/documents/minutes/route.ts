import { NextResponse, type NextRequest } from 'next/server'

import {
  generateMinutesFromTranscript,
  listMinutes,
} from '@/lib/minutes/minutesService'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUserOrThrow } from '@/lib/supabase/users'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const user = await getCurrentUserOrThrow(supabase)
    const { searchParams } = new URL(request.url)

    const page = Number(searchParams.get('page') ?? '1')
    const limit = Number(searchParams.get('limit') ?? '20')
    const search = searchParams.get('q') ?? undefined

    const result = await listMinutes(supabase, user.id, page, limit, search)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '一覧の取得に失敗しました' },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const user = await getCurrentUserOrThrow(supabase)
    const body = (await request.json()) as {
      minutesId?: string
      transcriptionText?: string
    }

    if (!body.minutesId) {
      return NextResponse.json({ error: 'minutesId が必要です' }, { status: 400 })
    }

    const result = await generateMinutesFromTranscript(
      supabase,
      user.id,
      body.minutesId,
      body.transcriptionText,
    )

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '議事録の生成に失敗しました' },
      { status: 500 },
    )
  }
}
