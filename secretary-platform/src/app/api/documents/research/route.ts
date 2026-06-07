import { NextResponse, type NextRequest } from 'next/server'

import { listResearch, runResearch } from '@/lib/research/researchService'
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

    const result = await listResearch(supabase, user.id, page, limit, search)
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
    const body = (await request.json()) as { theme?: string }

    const theme = body.theme?.trim()
    if (!theme) {
      return NextResponse.json(
        { error: 'リサーチテーマを入力してください' },
        { status: 400 },
      )
    }

    const record = await runResearch(supabase, user.id, theme)
    return NextResponse.json({ record })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'リサーチに失敗しました' },
      { status: 500 },
    )
  }
}
