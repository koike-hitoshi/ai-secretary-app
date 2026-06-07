import { NextResponse, type NextRequest } from 'next/server'

import { runWritingStyleAnalysis } from '@/lib/documents/proofreadService'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUserOrThrow } from '@/lib/supabase/users'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const user = await getCurrentUserOrThrow(supabase)
    const body = (await request.json()) as { samples?: string[]; content?: string }

    const samples =
      body.samples ??
      (body.content?.trim() ? [body.content.trim()] : [])

    if (samples.length === 0) {
      return NextResponse.json(
        { error: '分析する文章を入力してください' },
        { status: 400 },
      )
    }

    const profile = await runWritingStyleAnalysis(supabase, user.id, samples)
    return NextResponse.json({ profile })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '文体分析に失敗しました' },
      { status: 500 },
    )
  }
}
