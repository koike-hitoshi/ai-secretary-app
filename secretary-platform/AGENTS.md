<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# Agent guide

## Working directory

Primary app: **`secretary-platform/`** (not the repo root). The root only holds shared Prettier config.

## Before shipping changes

1. `npm run lint` in `secretary-platform/`
2. `npm run build` if routes, config, or dependencies changed

## Code style

- TypeScript strict mode; no `any` without reason.
- Match existing formatting: single quotes, no semicolons (Prettier at repo root).
- Tailwind utility classes in components; theme tokens in `globals.css` `:root` and `tailwind.config.ts`.

## Adding features

- New routes: `src/app/<route>/page.tsx`
- API routes: `src/app/api/<name>/route.ts`
- Shared UI: `src/components/`
- Server-only helpers: `src/lib/`
