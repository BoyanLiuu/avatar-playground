# Avatar Playground

Generate avatars in six styles: pick a style, randomize, tweak each part, export.
Plan and mockups: `../docs/avatar/implementation-plan.md`, `../docs/avatar/playground-*.png`.

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind v4 · shadcn/ui (`base-nova`, Base UI) · Vitest · Playwright

## Commands

pnpm is provided by corepack (`corepack pnpm …`, or run `corepack enable` once to get a plain `pnpm`).

| Command         | What it does                                                                                  |
| --------------- | --------------------------------------------------------------------------------------------- |
| `pnpm dev`      | Dev server on http://127.0.0.1:3001 (loopback only)                                           |
| `pnpm check`    | Lint + unit tests + production build                                                          |
| `pnpm format`   | Prettier (+ Tailwind class sorting), same setup as `boyanliu.me`; `format:check` to verify    |
| `pnpm test`     | Unit tests (Vitest, `src/**/*.test.ts`)                                                       |
| `pnpm test:e2e` | E2E tests (Playwright) against the production build on 127.0.0.1:3200; run `pnpm build` first |

## Layout

- `src/app`: routes (`layout.tsx` sets the static `dark` class; v1 is dark-only)
- `src/components/ui`: shadcn components. Add with `pnpm dlx shadcn@latest add <name>`, then run `pnpm lint --fix && pnpm format`: shadcn emits `function` components, the ESLint rules (same as `boyanliu.me`) convert them to arrow functions, and Prettier cleans up the result
- `prototype/`: the JS prototype the engine is ported from (M1, M5); not part of the build
