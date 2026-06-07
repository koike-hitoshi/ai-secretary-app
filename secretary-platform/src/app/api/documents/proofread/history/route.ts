import { NextResponse, type NextRequest } from 'next/server'

import { getProofreadHistory } from '@/lib/documents/proofreadService'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUserOrThrow } from '@/lib/supabase/users'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const user = await getCurrentUserOrThrow(supabase)
    const { searchParams } = new URL(request.url)

    const page = Number(searchParams.get('page') ?? '1')
    const limit = Number(searchParams.get('limit') ?? '20')

    const result = await getProofreadHistory(supabase, user.id, page, limit)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '履歴の取得に失敗しました' },
      { status: 500 },
    )
  }
}
