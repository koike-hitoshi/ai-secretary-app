import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import pg from 'pg'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const env = readFileSync(join(root, '.env.local'), 'utf8')
const match = env.match(/^SUPABASE_DB_PASSWORD=(.+)$/m)

if (!match) {
  console.error('No password')
  process.exit(1)
}

const enc = encodeURIComponent(match[1])
const url = `postgresql://postgres.curlkwygoozixibypwaq:${enc}@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres`

const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } })
await client.connect()

const tables = await client.query(
  "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename",
)
console.log('Tables:', tables.rows.map((r) => r.tablename).join(', ') || '(none)')

const db = await client.query('SELECT current_database()')
console.log('Database:', db.rows[0].current_database)

await client.end()
