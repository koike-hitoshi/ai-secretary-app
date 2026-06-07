@AGENTS.md

# secretary-platform

AI secretary web app (early scaffold). Monorepo path: `ai-secretary-app/secretary-platform`.

## Stack

- **Next.js 16.2** (App Router, Turbopack) — APIs differ from older Next; read `node_modules/next/dist/docs/` before changing framework code.
- **React 19**, **TypeScript** (strict), **Tailwind CSS v3** (`tailwind.config.ts` + `@tailwind` directives in `globals.css`)
- Path alias: `@/*` → `src/*`

## Commands

Run from `secretary-platform/`:

```bash
npm run dev      # http://localhost:3000
npm run build
npm run start
npm run lint
```

Repo root (`ai-secretary-app/`) has **Prettier** only (`singleQuote`, `semi: false`, `trailingComma: all`). Format app code with Prettier from the root when touching multiple packages.

## Layout

```
src/app/          App Router (layout.tsx, page.tsx, globals.css)
public/           Static assets
next.config.ts    Next config (turbopack.root set to this package)
.env.local        Local secrets (gitignored); copy from .env.example
```

## Conventions

- App Router only; no `pages/` directory.
- Prefer Server Components; add `'use client'` only when needed.
- Use `@/` imports for anything under `src/`.
- Keep UI in `src/components/`, shared logic in `src/lib/` as the app grows.
- Do not commit `.env*` files with real keys.

## Environment

`.env.example` lists expected variables. Add values in `.env.local` for local dev.

## Status

App shell with dashboard and feature route placeholders. Requirements: `docs/REQUIREMENTS.md`. Implementation notes: `docs/PRODUCT_SPEC.md`. Phase 1+: Google auth, tasks, AI integrations.
