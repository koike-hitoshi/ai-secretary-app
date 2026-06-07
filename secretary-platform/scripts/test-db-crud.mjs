/**
 * Basic CRUD smoke test for Supabase data layer.
 * Creates a temporary user, runs operations, then cleans up.
 */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { createClient } from '@supabase/supabase-js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

function loadEnvLocal() {
  for (const envPath of [join(root, '.env.local'), join(root, '..', '.env.local')]) {
    try {
      const raw = readFileSync(envPath, 'utf8')
      for (const line of raw.split('\n')) {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith('#')) continue
        const eq = trimmed.indexOf('=')
        if (eq === -1) continue
        const key = trimmed.slice(0, eq)
        const value = trimmed.slice(eq + 1)
        if (!process.env[key]) process.env[key] = value
      }
    } catch {
      // ignore
    }
  }
}

loadEnvLocal()

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !anonKey || !serviceKey) {
  console.error('Missing Supabase env vars')
  process.exit(1)
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const results = []

function pass(name, detail = '') {
  results.push({ name, ok: true, detail })
  console.log(`✓ ${name}${detail ? ` — ${detail}` : ''}`)
}

function fail(name, error) {
  const message = error instanceof Error ? error.message : String(error)
  results.push({ name, ok: false, detail: message })
  console.error(`✗ ${name} — ${message}`)
}

function assert(condition, name, detail = '') {
  if (condition) pass(name, detail)
  else fail(name, detail || 'Assertion failed')
}

const testEmail = `db-test-${Date.now()}@example.com`
const testPassword = `Test-${Date.now()}!Aa`
let userId = null
let taskId = null

try {
  // --- Setup: create test user ---
  const { data: created, error: createUserError } =
    await admin.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: {
        full_name: 'DB Test User',
        avatar_url: 'https://example.com/avatar.png',
      },
    })

  if (createUserError) throw createUserError
  userId = created.user.id
  pass('ユーザー作成', `id=${userId.slice(0, 8)}…`)

  // Authenticated client (RLS enforced)
  const client = createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { error: signInError } = await client.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  })
  if (signInError) throw signInError
  pass('ユーザーログイン')

  // --- User: get current user ---
  const { data: authData, error: getUserError } = await client.auth.getUser()
  if (getUserError) throw getUserError
  assert(authData.user?.id === userId, 'ユーザー情報取得', authData.user?.email)
  assert(
    authData.user?.user_metadata?.full_name === 'DB Test User',
    'ユーザーメタデータ取得',
    authData.user?.user_metadata?.full_name,
  )

  // --- User: save & retrieve writing style profile ---
  const { data: profile, error: upsertError } = await client
    .from('writing_style_profiles')
    .upsert(
      {
        user_id: userId,
        tone_description: '丁寧で簡潔',
        sample_excerpts: ['サンプル文1', 'サンプル文2'],
      },
      { onConflict: 'user_id' },
    )
    .select()
    .single()

  if (upsertError) throw upsertError
  pass('ユーザープロファイル保存', profile.tone_description)

  const { data: fetchedProfile, error: fetchProfileError } = await client
    .from('writing_style_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (fetchProfileError) throw fetchProfileError
  assert(
    fetchedProfile?.tone_description === '丁寧で簡潔',
    'ユーザープロファイル取得',
    fetchedProfile?.tone_description,
  )

  // --- Task: create ---
  const { data: createdTask, error: createTaskError } = await client
    .from('tasks')
    .insert({
      user_id: userId,
      title: 'テストタスク',
      description: 'CRUDテスト用',
      priority: 'high',
      due_date: '2026-06-15',
      completed: false,
    })
    .select()
    .single()

  if (createTaskError) throw createTaskError
  taskId = createdTask.id
  pass('タスク作成', `id=${taskId.slice(0, 8)}…`)

  // --- Task: get single ---
  const { data: singleTask, error: getTaskError } = await client
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .eq('id', taskId)
    .maybeSingle()

  if (getTaskError) throw getTaskError
  assert(singleTask?.title === 'テストタスク', 'タスク単体取得', singleTask?.title)

  // --- Task: list ---
  const { data: taskList, error: listError } = await client
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (listError) throw listError
  assert(
    taskList?.some((t) => t.id === taskId),
    'タスク一覧取得',
    `${taskList?.length ?? 0}件`,
  )

  // --- Task: update ---
  const { data: updatedTask, error: updateError } = await client
    .from('tasks')
    .update({ title: '更新済みタスク', completed: true })
    .eq('user_id', userId)
    .eq('id', taskId)
    .select()
    .single()

  if (updateError) throw updateError
  assert(
    updatedTask.title === '更新済みタスク' && updatedTask.completed === true,
    'タスク更新',
    updatedTask.title,
  )

  // --- RLS: other user cannot read ---
  const otherClient = createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  await otherClient.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  })
  await otherClient.auth.signOut()

  const outsiderEmail = `db-outsider-${Date.now()}@example.com`
  const { data: outsider } = await admin.auth.admin.createUser({
    email: outsiderEmail,
    password: testPassword,
    email_confirm: true,
  })

  const outsiderClient = createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  await outsiderClient.auth.signInWithPassword({
    email: outsiderEmail,
    password: testPassword,
  })

  const { data: forbiddenTask } = await outsiderClient
    .from('tasks')
    .select('*')
    .eq('id', taskId)
    .maybeSingle()

  assert(forbiddenTask === null, 'RLS: 他ユーザーのタスクは取得不可')

  await admin.auth.admin.deleteUser(outsider.user.id)

  // --- Task: delete ---
  const { error: deleteError } = await client
    .from('tasks')
    .delete()
    .eq('user_id', userId)
    .eq('id', taskId)

  if (deleteError) throw deleteError
  pass('タスク削除')

  const { data: deletedCheck } = await client
    .from('tasks')
    .select('id')
    .eq('id', taskId)
    .maybeSingle()

  assert(deletedCheck === null, 'タスク削除確認')
} catch (error) {
  fail('テスト実行', error)
} finally {
  if (userId) {
    const { error: cleanupError } = await admin.auth.admin.deleteUser(userId)
    if (cleanupError) {
      console.error('⚠ クリーンアップ失敗:', cleanupError.message)
    } else {
      console.log('✓ テストユーザー削除（クリーンアップ）')
    }
  }
}

const passed = results.filter((r) => r.ok).length
const failed = results.filter((r) => !r.ok).length

console.log(`\n--- 結果: ${passed} passed, ${failed} failed ---`)

if (failed > 0) {
  process.exit(1)
}
