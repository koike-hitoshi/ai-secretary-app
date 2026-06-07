/**
 * 3000 番ポート解放 → .next 削除 → dev 起動
 * Usage: npm run dev:fresh
 */
import { execSync, spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const nextDir = path.join(projectRoot, '.next')
const port = 3000

function killPortWindows(p) {
  try {
    const out = execSync(`netstat -ano | findstr :${p}`, { encoding: 'utf8' })
    const pids = new Set()
    for (const line of out.split(/\r?\n/)) {
      if (!line.includes('LISTENING')) continue
      const pid = line.trim().split(/\s+/).pop()
      if (pid && /^\d+$/.test(pid)) pids.add(pid)
    }
    for (const pid of pids) {
      try {
        execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' })
        console.log(`Stopped process on port ${p} (PID ${pid})`)
      } catch {
        /* already gone */
      }
    }
  } catch {
    /* nothing listening */
  }
}

if (process.platform === 'win32') {
  killPortWindows(port)
} else {
  try {
    execSync(`lsof -ti:${port} | xargs kill -9 2>/dev/null`, { shell: true })
  } catch {
    /* ignore */
  }
}

if (fs.existsSync(nextDir)) {
  fs.rmSync(nextDir, { recursive: true, force: true })
  console.log('Removed .next cache')
}

console.log(`Starting dev server at http://localhost:${port} ...\n`)

const child = spawn('npx', ['next', 'dev', '-p', String(port)], {
  cwd: projectRoot,
  stdio: 'inherit',
  shell: true,
})

child.on('exit', (code) => process.exit(code ?? 0))
