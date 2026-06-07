/**
 * Apply supabase/migrations/*.sql to the remote database.
 *
 * Requires SUPABASE_DB_PASSWORD in .env.local (Project Settings > Database).
 * Optional: SUPABASE_PROJECT_REF (defaults to curlkwygoozixibypwaq)
 */
import { readFileSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import pg from 'pg'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

function loadEnvLocal() {
  const paths = [
    join(root, '.env.local'),
    join(root, '..', '.env.local'),
  ]

  for (const envPath of paths) {
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
      // ignore missing files
    }
  }
}

loadEnvLocal()

const projectRef =
  process.env.SUPABASE_PROJECT_REF ?? 'curlkwygoozixibypwaq'
const password = process.env.SUPABASE_DB_PASSWORD

if (!password) {
  console.error(
    'Missing SUPABASE_DB_PASSWORD.\n\n' +
      '1. Open https://supabase.com/dashboard/project/curlkwygoozixibypwaq/settings/database\n' +
      '2. Copy "Database password" (or reset it if unknown)\n' +
      '3. Add to secretary-platform/.env.local:\n' +
      '   SUPABASE_DB_PASSWORD=your-password\n' +
      '4. Re-run: npm run db:migrate\n\n' +
      'Alternative: paste supabase/migrations/001_initial.sql into SQL Editor.',
  )
  process.exit(1)
}

function buildConnectionCandidates(projectRef, dbPassword) {
  const encoded = encodeURIComponent(dbPassword)
  const regions = [
    'ap-northeast-1',
    'ap-northeast-2',
    'us-east-1',
    'us-west-1',
    'eu-west-1',
    'eu-central-1',
  ]
  const poolerPrefixes = ['aws-1', 'aws-0']

  const candidates = [
    process.env.DATABASE_URL,
    `postgresql://postgres:${encoded}@db.${projectRef}.supabase.co:5432/postgres`,
  ]

  for (const prefix of poolerPrefixes) {
    for (const region of regions) {
      candidates.push(
        `postgresql://postgres.${projectRef}:${encoded}@${prefix}-${region}.pooler.supabase.com:5432/postgres`,
        `postgresql://postgres.${projectRef}:${encoded}@${prefix}-${region}.pooler.supabase.com:6543/postgres`,
      )
    }
  }

  return [...new Set(candidates.filter(Boolean))]
}

const connectionCandidates = buildConnectionCandidates(projectRef, password)

const migrationsDir = join(root, 'supabase', 'migrations')
const files = readdirSync(migrationsDir)
  .filter((name) => name.endsWith('.sql'))
  .sort()

if (files.length === 0) {
  console.error('No migration files found.')
  process.exit(1)
}

let client = null
let lastError = null

for (const connectionString of connectionCandidates) {
  const candidate = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  })

  try {
    await candidate.connect()
    client = candidate
    console.log('Connected to database.')
    break
  } catch (error) {
    lastError = error
    await candidate.end().catch(() => {})
  }
}

if (!client) {
  console.error(
    'Could not connect to database.',
    lastError instanceof Error ? lastError.message : lastError,
  )
  process.exit(1)
}

try {
  console.log(`Applying ${files.length} migration(s)...`)

  const { rows: existing } = await client.query(
    "SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'tasks' LIMIT 1",
  )

  if (existing.length > 0) {
    console.log('Schema already applied — skipping SQL migrations.')
  } else {
    for (const file of files) {
      const sql = readFileSync(join(migrationsDir, file), 'utf8')
      console.log(`→ ${file}`)
      await client.query(sql)
    }
    console.log('Migrations applied successfully.')
  }

  await client.query(`
    GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
    GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
    GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
    GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;
    NOTIFY pgrst, 'reload schema';
  `)
  console.log('PostgREST schema reloaded.')
} catch (error) {
  console.error('Migration failed:', error instanceof Error ? error.message : error)
  process.exit(1)
} finally {
  await client.end()
}
