/**
 * ルート・ナビゲーションのスモークテスト（dev サーバー起動中に実行）
 * Usage: node scripts/verify-smoke.mjs [baseUrl]
 */
const base = process.argv[2] ?? 'http://localhost:3000'

const routes = [
  { path: '/', expectStatus: [307, 308] },
  { path: '/dashboard', expectStatus: [200], contains: ['ダッシュボード', 'aria-current'] },
  { path: '/dashboard/tasks', expectStatus: [200], contains: ['タスク管理'] },
  { path: '/dashboard/calendar', expectStatus: [200], contains: ['カレンダー'] },
  { path: '/dashboard/documents/proofread', expectStatus: [200], contains: ['文章校正'] },
  { path: '/dashboard/documents/minutes', expectStatus: [200], contains: ['議事録'] },
  { path: '/dashboard/documents/research', expectStatus: [200], contains: ['リサーチ'] },
  {
    path: '/dashboard/design-system',
    expectStatus: [200],
    contains: ['デザインシステム', 'btn-primary', 'role="tablist"'],
  },
]

const legacyRedirects = [
  ['/tasks', '/dashboard/tasks'],
  ['/proofreading', '/dashboard/documents/proofread'],
]

let failed = 0

async function check(path, expectStatus, contains = []) {
  const url = `${base}${path}`
  const res = await fetch(url, { redirect: 'manual' })
  if (!expectStatus.includes(res.status)) {
    console.error(`FAIL ${path}: expected ${expectStatus.join('|')}, got ${res.status}`)
    failed++
    return
  }
  if (contains.length && res.status === 200) {
    const html = await res.text()
    for (const needle of contains) {
      if (!html.includes(needle)) {
        console.error(`FAIL ${path}: missing "${needle}"`)
        failed++
      }
    }
  }
  console.log(`OK   ${path} (${res.status})`)
}

console.log(`Smoke test: ${base}\n`)

for (const r of routes) {
  await check(r.path, r.expectStatus, r.contains ?? [])
}

for (const [from, to] of legacyRedirects) {
  const res = await fetch(`${base}${from}`, { redirect: 'manual' })
  const loc = res.headers.get('location') ?? ''
  if (![301, 302, 307, 308].includes(res.status) || !loc.includes(to)) {
    console.error(`FAIL redirect ${from} -> ${to}, got ${res.status} ${loc}`)
    failed++
  } else {
    console.log(`OK   redirect ${from} -> ${to}`)
  }
}

if (failed > 0) {
  console.error(`\n${failed} check(s) failed`)
  process.exit(1)
}
console.log('\nAll smoke checks passed')
