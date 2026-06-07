import { NextResponse, type NextRequest } from 'next/server'

import {
  getMinutes,
  removeMinutes,
  updateMinutes,
} from '@/lib/minutes/minutesService'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUserOrThrow } from '@/lib/supabase/users'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const supabase = await createClient()
    const user = await getCurrentUserOrThrow(supabase)
    const record = await getMinutes(supabase, user.id, id)
    return NextResponse.json({ record })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '取得に失敗しました' },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const supabase = await createClient()
    const user = await getCurrentUserOrThrow(supabase)
    const body = (await request.json()) as {
      title?: string
      discussed?: string
      decisions?: string
      nextActions?: string
      transcript?: string
    }

    const record = await updateMinutes(supabase, user.id, id, body)
    return NextResponse.json({ record })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '更新に失敗しました' },
      { status: 500 },
    )
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const supabase = await createClient()
    const user = await getCurrentUserOrThrow(supabase)
    await removeMinutes(supabase, user.id, id)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '削除に失敗しました' },
      { status: 500 },
    )
  }
}
