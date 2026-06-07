import { NextResponse } from 'next/server'

import { getUserWritingStyleProfile } from '@/lib/documents/proofreadService'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUserOrThrow } from '@/lib/supabase/users'

export async function GET() {
  try {
    const supabase = await createClient()
    const user = await getCurrentUserOrThrow(supabase)
    const profile = await getUserWritingStyleProfile(supabase, user.id)
    return NextResponse.json({ profile })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '文体情報の取得に失敗しました' },
      { status: 500 },
    )
  }
}
