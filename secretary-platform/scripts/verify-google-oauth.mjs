/**
 * Verify Google OAuth client credentials against Google's token endpoint.
 * Uses a dummy auth code; invalid_client means ID/secret are wrong or deleted.
 */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
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

const clientId = process.env.GOOGLE_CLIENT_ID
const clientSecret = process.env.GOOGLE_CLIENT_SECRET
const redirectUri = `https://${projectRef}.supabase.co/auth/v1/callback`

if (!clientId || !clientSecret) {
  console.error('Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET in .env.local')
  process.exit(1)
}

const body = new URLSearchParams({
  client_id: clientId,
  client_secret: clientSecret,
  code: 'verify-credentials-dummy-code',
  grant_type: 'authorization_code',
  redirect_uri: redirectUri,
})

const res = await fetch('https://oauth2.googleapis.com/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body,
})

const payload = await res.json()
const error = payload?.error

if (error === 'invalid_client') {
  console.error('Google OAuth credentials are INVALID (client not found or secret mismatch).')
  console.error('')
  console.error('Fix:')
  console.error('1. Google Cloud Console → APIs & Services → Credentials')
  console.error('2. Create OAuth client type "Web application" (or open the correct existing one)')
  console.error(`3. Authorized redirect URI: ${redirectUri}`)
  console.error('4. Copy Client ID + Secret → Supabase → Auth → Providers → Google')
  console.error('5. Update GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET in .env.local')
  process.exit(1)
}

if (error === 'invalid_grant') {
  console.log('Google OAuth credentials look valid (.env.local matches Google Cloud).')
  console.log('')
  console.log('If login still fails with "Unable to exchange external code",')
  console.log('Supabase Dashboard likely has a different Client ID/Secret — re-paste from Google Cloud.')
  process.exit(0)
}

console.log(`Unexpected response (${res.status}):`, JSON.stringify(payload))
process.exit(error ? 1 : 0)
