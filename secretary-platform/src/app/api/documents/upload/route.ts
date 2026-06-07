import { NextResponse, type NextRequest } from 'next/server'

import { uploadAudioFile } from '@/lib/minutes/minutesService'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUserOrThrow } from '@/lib/supabase/users'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const user = await getCurrentUserOrThrow(supabase)
    const formData = await request.formData()
    const file = formData.get('file')

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: '音声ファイルを選択してください' },
        { status: 400 },
      )
    }

    const result = await uploadAudioFile(user.id, file)
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'アップロードに失敗しました' },
      { status: 500 },
    )
  }
}
