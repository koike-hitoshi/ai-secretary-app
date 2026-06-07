const base = process.argv[2] ?? 'https://ai-secretary-app.vercel.app'

async function status(path, init = {}) {
  const res = await fetch(`${base}${path}`, { redirect: 'manual', ...init })
  return {
    status: res.status,
    location: res.headers.get('location') ?? '',
    text: res.status === 200 ? await res.text() : '',
  }
}

console.log(`Production check: ${base}\n`)

const routes = [
  '/',
  '/login',
  '/dashboard',
  '/proofreading',
  '/auth/callback',
  '/api/auth/google/callback',
  '/api/calendar/auth',
]

for (const path of routes) {
  const r = await status(path)
  console.log(`${path} -> ${r.status}${r.location ? ` ${r.location}` : ''}`)
}

const home = await status('/')
const checks = [
  ['ルートがリダイレクト', [301, 302, 307, 308].includes(home.status)],
  ['旧デザインシステムが消えた', !home.text.includes('カラーパレット')],
  ['/proofreading リダイレクト', [301, 302, 307, 308].includes((await status('/proofreading')).status)],
  ['/api/auth/google/callback 存在', (await status('/api/auth/google/callback')).status !== 404],
]

const login = await status('/login')
const scripts = [...login.text.matchAll(/src="(\/_next\/static\/chunks\/[^"]+)"/g)].map((m) => m[1])
let supabase = false
let localhost = false
let vercel = false
for (const script of scripts.slice(0, 15)) {
  const js = await (await fetch(`${base}${script}`)).text()
  if (js.includes('curlkwygoozixibypwaq')) supabase = true
  if (js.includes('localhost:3000')) localhost = true
  if (js.includes('ai-secretary-app.vercel.app')) vercel = true
}

checks.push(['Supabase URL がバンドルに含まれる', supabase])
checks.push(['localhost:3000 がバンドルにない', !localhost])
checks.push(['vercel.app がバンドルに含まれる', vercel])

console.log('')
let passed = 0
for (const [name, ok] of checks) {
  console.log(`${ok ? 'OK' : 'NG'}  ${name}`)
  if (ok) passed++
}
console.log(`\n${passed}/${checks.length} passed`)
process.exit(passed === checks.length ? 0 : 1)
