# AGENTS.md

AI agent context for working in this repository.
Read this before making any changes.

---

## What this is

Personal portfolio site for tecdev (Tămaș E. Cosmin).
Static Next.js app deployed to GitHub Pages — no backend, no API, no database.

## Architecture

Pnpm monorepo with one app: `apps/web` (Next.js 16, App Router, static export).

All data is statically imported at build time from JSON files.
There is no `fetch` at runtime, no server components with data fetching, no React Query, no API routes.

## Tech stack

| | Version |
|---|---|
| Next.js | 16.2.4 |
| React | 19.2.5 |
| TypeScript | 6 |
| Tailwind | v4 |
| pnpm | 9 |
| Node | 22 |

## Commands

```bash
# Dev server — run from apps/web
cd apps/web && pnpm dev          # → http://localhost:3000

# Production build (static export → apps/web/out/)
cd apps/web && pnpm build

# Type check
cd apps/web && pnpm exec tsc --noEmit
```

Or from repo root via `make dev` / `make build`.

## Repository layout

```
apps/web/src/
  app/
    page.tsx              home / hero
    about/page.tsx        about page
    portfolio/page.tsx    full project listing
    tetris/page.tsx       tetris game
    json-formatter/       json formatter tool
    layout.tsx            root layout — loads fonts, wraps in .kit
    globals.css           entire design system (scoped under .kit)
  components/
    kit.tsx               design system primitives
    navbar.tsx            polybar-style nav — only 'use client' component at top level
    project-card.tsx      project card
    projects-preview.tsx  home page project preview (server component)
  data/
    projects.fallback.json  only source of project data — edit this to update portfolio
apps/web/
  next.config.ts          static export, basePath /showcase
  package.json
.github/workflows/
  pages.yml               CI: build → GitHub Pages
docs/
  WIKI.md                 architecture and dev guide
```

## Design system

Everything is in `globals.css` scoped under `.kit` on `<body>`.
Never add styles for component-level rules outside `.kit` scope.

### Themes

Two themes via `data-theme` on `<html>`: `warm` (light, default) and `dusk` (dark).
Theme toggle is in the navbar; preference is persisted in `localStorage`.

### CSS variables

```css
--bg, --bg-1, --bg-2, --bg-3   /* background layers — higher number = darker/more elevated */
--ink, --ink-2, --ink-3, --ink-4  /* text — higher number = lighter/dimmer */
--rust                          /* primary accent, used for emphasis and interactive focus */
--olive, --teal, --mustard, --plum  /* secondary accents */
--rule, --rule-2                /* border / separator colors */
--mono, --sans                  /* font stack references */
--radius: 2px                   /* global border-radius */
```

### Kit primitives (`components/kit.tsx`)

| Component | Purpose |
|---|---|
| `AscFrame` | Panel with CSS bracket corners. `title` prop shows `# label` above top-left corner. |
| `WinBar` | Terminal-style title bar with traffic light dots (`●●●`). |
| `SecH` | Section heading with `#` prefix. `level` 1/2/3 controls number of `#`. |
| `Pill` | Inline chip. `tone`: `rust \| olive \| teal \| mustard`. |
| `Tag` | Small label. |

### Bracket corners

`.asc` panels get four empty `aria-hidden` spans (`.asc__corner--tl/tr/bl/br`).
Each is 10×10px, absolutely positioned, `background: inherit` so it covers the parent's border, with its two visible edges drawn in `--rust`.
**Never put a border directly on `.asc`** — the corners rely on the parent border being `--rule-2`.

### Naming

- CSS classes: kebab-case under `.kit`
- Component files: kebab-case (`project-card.tsx`)
- Component exports: PascalCase
- All visible text: lowercase (matches the site aesthetic)

## Conventions

**Tailwind for layout only.** Spacing, flex, grid, responsive utilities — fine.
Never use Tailwind for color, font, or anything the kit CSS already controls.
The kit CSS has higher specificity (`.kit .component`) and will silently win or lose, causing hard-to-debug visual bugs.

**Server components by default.** Only add `'use client'` when the component needs browser APIs, event handlers, or hooks. Currently only `navbar.tsx` is a client component at the top level.

**TypeScript strict.** No `any`. No untyped props. No non-null assertions without a comment explaining why.

**No runtime data fetching.** All data comes from statically imported JSON at build time.

**No `console.log` in committed code.**

## Adding a new tool

1. Create `apps/web/src/app/<tool-name>/page.tsx`
2. Add it to the `TOOLS` array in `navbar.tsx`
3. That's it — Next.js picks up the route automatically

## Deployment

Push to `main` touching `apps/web/**` triggers `.github/workflows/pages.yml`:
1. Node 22 + pnpm 9
2. `NEXT_PUBLIC_SITE_URL` set for the build
3. Static export → `apps/web/out/`
4. `.nojekyll` written, `index.html` → `404.html` for SPA routing fallback
5. Artifact uploaded and deployed to `https://csmntms.github.io/showcase`

`basePath: /showcase` and `assetPrefix: /showcase/` are in `next.config.ts` — these are intentional, do not remove them.

## Anti-patterns

| Don't | Because |
|---|---|
| Add `fetch` calls in components | Static export — no runtime server |
| Add API routes | No server; they'd be ignored by static export anyway |
| Add `console.log` | Noise in production |
| Use Tailwind color/font utilities | Kit CSS specificity conflict |
| Remove `basePath` from config | Breaks all assets on GitHub Pages |
| Add new dependencies speculatively | Dep list was deliberately trimmed — justify first |
| Store secrets in source | Public repo |
