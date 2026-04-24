# showcase — wiki

Personal portfolio site for tecdev (Tămaș E. Cosmin).  
Live: [csmntms.github.io/showcase](https://csmntms.github.io/showcase)

---

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (static export) |
| Language | TypeScript 6 |
| Styling | Tailwind v4 + custom CSS design system |
| Font | JetBrains Mono (monospace), system sans |
| Package manager | pnpm (workspace monorepo) |
| Deploy | GitHub Pages via Actions |

No backend. No API. No database. Everything is static.

---

## Repo layout

```
showcase/
  apps/web/          Next.js app
    src/
      app/           Routes (Next.js App Router)
        page.tsx     Home / hero
        portfolio/   Portfolio listing
        tetris/      Tetris game
      components/    Shared components
        navbar.tsx   Polybar-style nav with tools dropdown
        kit.tsx      Design system primitives
      data/          Static data
        projects.fallback.json
      app/
        globals.css  All styles (scoped under .kit)
        layout.tsx   Root layout
  .github/workflows/
    pages.yml        CI/CD → GitHub Pages
```

---

## Design system

All styles live in `globals.css` scoped under `.kit` (applied to `<body>`).

**Themes:** `warm` (default) / `dusk` — toggled via `data-theme` on `<html>`.

**Key CSS vars:**
```
--bg, --bg-1/2/3       backgrounds
--ink through --ink-4  text shades
--rust                 accent (used for emphasis)
--olive, --teal, --mustard, --plum  secondary accents
--rule, --rule-2       border colors
--mono, --sans         font stacks
```

**Bracket corners:** `.asc__corner--tl/tr/bl/br` — empty `aria-hidden` spans, L-shaped borders in `--rust`.

**Primitives in `kit.tsx`:** `AscFrame`, `WinBar`, `SecH`, `Tag`, `Pill`.

---

## Running locally

```bash
cd apps/web
pnpm install
pnpm dev          # http://localhost:3000
```

Build (static export):
```bash
pnpm build        # outputs to apps/web/out/
```

Or from repo root: `make dev` / `make build` (see `Makefile`).

---

## Deploy

Push to `main` touching `apps/web/**` → `pages.yml` builds and deploys automatically.

The workflow:
1. Checks out, sets up Node 22 + pnpm 9
2. Builds with `NEXT_PUBLIC_SITE_URL` set
3. Adds `.nojekyll`, copies `index.html` → `404.html` (SPA fallback)
4. Uploads to GitHub Pages

`basePath: /showcase` and `assetPrefix: /showcase/` are set in `next.config.ts`.

---

## Content

Projects data lives in `src/data/projects.fallback.json` — edit that file to update the portfolio listing.

Placeholder entries are marked with `<placeholder>` — replace with real content when ready.
