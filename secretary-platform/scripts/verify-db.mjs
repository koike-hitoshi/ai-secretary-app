/**
 * Smoke-test Supabase connectivity and schema presence.
 */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { createClient } from '@supabase/supabase-js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

function loadEnvLocal() {
  const raw = readFileSync(join(root, '.env.local'), 'utf8')
  for (const line of raw.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq)
    const value = trimmed.slice(eq + 1)
    if (!process.env[key]) process.env[key] = value
  }
}

loadEnvLocal()

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  console.error('Missing Supabase env vars in .env.local')
  process.exit(1)
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const tables = [
  { name: 'tasks', column: 'id' },
  { name: 'writing_style_profiles', column: 'id' },
  { name: 'proofreading_history', column: 'id' },
  { name: 'meeting_minutes', column: 'id' },
  { name: 'research_sessions', column: 'id' },
  { name: 'google_calendar_tokens', column: 'user_id' },
]

let ok = 0
let missing = 0

for (const table of tables) {
  const { error } = await supabase.from(table.name).select(table.column).limit(1)

  if (error?.code === 'PGRST205') {
    console.log(`✗ ${table.name} — not found (run npm run db:migrate)`)
    missing += 1
  } else if (error) {
    console.log(`✗ ${table.name} — ${error.message}`)
    missing += 1
  } else {
    console.log(`✓ ${table.name}`)
    ok += 1
  }
}

console.log(`\n${ok}/${tables.length} tables ready.`)

if (missing > 0) {
  process.exit(1)
}
