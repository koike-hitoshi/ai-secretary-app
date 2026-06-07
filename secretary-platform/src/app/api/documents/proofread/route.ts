import { NextResponse, type NextRequest } from 'next/server'

import { runProofread } from '@/lib/documents/proofreadService'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUserOrThrow } from '@/lib/supabase/users'
import type { DocumentType, ProofreadRequest } from '@/types/document'

const VALID_TYPES = new Set<DocumentType>([
  'email',
  'report',
  'proposal',
  'general',
])

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const user = await getCurrentUserOrThrow(supabase)
    const body = (await request.json()) as Partial<ProofreadRequest>

    const content = body.content?.trim()
    if (!content) {
      return NextResponse.json({ error: '校正する文章を入力してください' }, { status: 400 })
    }

    const documentType = body.documentType ?? 'general'
    if (!VALID_TYPES.has(documentType)) {
      return NextResponse.json({ error: '無効な文書タイプです' }, { status: 400 })
    }

    const result = await runProofread(supabase, user.id, {
      content,
      documentType,
      applyUserStyle: body.applyUserStyle ?? true,
    })

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '校正に失敗しました' },
      { status: 500 },
    )
  }
}
