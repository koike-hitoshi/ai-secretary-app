/**
 * Verify DB + configure Supabase Auth (Google OAuth).
 */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const projectRef = process.env.SUPABASE_PROJECT_REF ?? 'curlkwygoozixibypwaq'

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

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
const googleClientId = process.env.GOOGLE_CLIENT_ID
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET
const accessToken = process.env.SUPABASE_ACCESS_TOKEN
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

async function getGoogleEnabled() {
  const res = await fetch(`https://${projectRef}.supabase.co/auth/v1/settings`, {
    headers: { apikey: anonKey ?? '' },
  })
  const settings = await res.json()
  return Boolean(settings?.external?.google)
}

console.log('=== Step 1: Database migration ===')
const migrate = spawnSync('npm', ['run', 'db:migrate'], {
  cwd: root,
  stdio: 'inherit',
  shell: true,
})
if (migrate.status !== 0) process.exit(1)

console.log('\n=== Step 2: Database CRUD test ===')
const test = spawnSync('npm', ['run', 'db:test'], {
  cwd: root,
  stdio: 'inherit',
  shell: true,
})
if (test.status !== 0) process.exit(1)

console.log('\n=== Step 3: Google OAuth provider ===')
let googleEnabled = await getGoogleEnabled()
console.log(`Status: ${googleEnabled ? 'enabled ✓' : 'disabled'}`)

console.log('\n=== Step 4: Google OAuth credentials ===')
const verify = spawnSync('npm', ['run', 'verify:google-oauth'], {
  cwd: root,
  stdio: 'inherit',
  shell: true,
})
const googleCredentialsValid = verify.status === 0

if (!googleEnabled && accessToken) {
  console.log('Configuring via Management API...')
  const patchRes = await fetch(
    `https://api.supabase.com/v1/projects/${projectRef}/config/auth`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        site_url: appUrl,
        uri_allow_list: `${appUrl}/auth/callback`,
        external_google_enabled: true,
        external_google_client_id: googleClientId,
        external_google_secret: googleClientSecret,
      }),
    },
  )

  if (patchRes.ok) {
    googleEnabled = await getGoogleEnabled()
    console.log(`Status after API: ${googleEnabled ? 'enabled ✓' : 'still disabled'}`)
  } else {
    console.log('Management API failed, trying config push...')
    process.env.SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET ??= googleClientSecret
    const push = spawnSync(
      'npx',
      ['supabase', 'config', 'push', '--project-ref', projectRef, '--yes'],
      { cwd: root, stdio: 'inherit', shell: true, env: process.env },
    )
    if (push.status === 0) {
      googleEnabled = await getGoogleEnabled()
      console.log(`Status after push: ${googleEnabled ? 'enabled ✓' : 'still disabled'}`)
    }
  }
}

console.log('\n=== Setup summary ===')
console.log(`Database: ready`)
console.log(`Google OAuth: ${googleEnabled ? 'enabled' : 'needs configuration'}`)
console.log(
  `Google credentials: ${googleCredentialsValid ? 'valid ✓' : 'INVALID — update in Google Cloud + Supabase Dashboard'}`,
)

if (!googleEnabled || !googleCredentialsValid) {
  console.log(`
Manual setup (5 min):

1. Supabase → Auth → Providers → Google
   https://supabase.com/dashboard/project/${projectRef}/auth/providers
   Client ID: ${googleClientId}
   Client Secret: (from .env.local GOOGLE_CLIENT_SECRET)

2. Supabase → Auth → URL Configuration
   https://supabase.com/dashboard/project/${projectRef}/auth/url-configuration
   Site URL: ${appUrl}
   Redirect URLs: ${appUrl}/auth/callback

3. Google Cloud Console → OAuth client → Authorized redirect URIs
   https://${projectRef}.supabase.co/auth/v1/callback

4. (Optional) Auto-config next time — add to .env.local:
   SUPABASE_ACCESS_TOKEN=<from https://supabase.com/dashboard/account/tokens>
   Then run: npm run setup:auth
`)
  process.exit(1)
}

console.log('\nAll set. Run: npm run dev')
