/**
 * Push supabase/config.toml (Google OAuth) to remote project.
 */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

function loadEnvLocal() {
  for (const envPath of [join(root, '.env.local'), join(root, '..', '.env.local')]) {
    try {
      const raw = readFileSync(envPath, 'utf8')
      for (const line of raw.split('\n')) {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith('#')) continue
        const eq = trimmed.indexOf('=')
        if (eq === -1) continue
        process.env[trimmed.slice(0, eq)] = trimmed.slice(eq + 1)
      }
    } catch {
      // ignore
    }
  }
}

loadEnvLocal()

const projectRef = process.env.SUPABASE_PROJECT_REF ?? 'curlkwygoozixibypwaq'
const token = process.env.SUPABASE_ACCESS_TOKEN

if (!token) {
  console.error(
    'Missing SUPABASE_ACCESS_TOKEN.\n' +
      'Add to secretary-platform/.env.local from:\n' +
      'https://supabase.com/dashboard/account/tokens',
  )
  process.exit(1)
}

const result = spawnSync(
  'npx',
  ['supabase', 'config', 'push', '--project-ref', projectRef, '--yes'],
  {
    cwd: root,
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      SUPABASE_ACCESS_TOKEN: token,
    },
  },
)

process.exit(result.status ?? 1)
