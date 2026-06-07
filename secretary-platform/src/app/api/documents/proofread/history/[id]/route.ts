import { NextResponse, type NextRequest } from 'next/server'

import { deleteProofreadHistoryItem } from '@/lib/documents/proofreadService'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUserOrThrow } from '@/lib/supabase/users'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    if (!id) {
      return NextResponse.json({ error: 'ID が必要です' }, { status: 400 })
    }

    const supabase = await createClient()
    const user = await getCurrentUserOrThrow(supabase)
    await deleteProofreadHistoryItem(supabase, user.id, id)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '削除に失敗しました' },
      { status: 500 },
    )
  }
}
