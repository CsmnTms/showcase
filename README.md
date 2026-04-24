# showcase

Personal portfolio — [csmntms.github.io/showcase](https://csmntms.github.io/showcase)

Next.js 16 · TypeScript 6 · Tailwind v4 · static export · GitHub Pages

---

## Dev

```bash
cd apps/web
pnpm install
pnpm dev        # → http://localhost:3000
```

```bash
pnpm build      # static export → apps/web/out/
```

Or: `make dev` / `make build` from repo root.

---

## Structure

```
apps/web/src/
  app/            routes (App Router)
  components/     kit.tsx — design system primitives
                  navbar.tsx
  data/           projects.fallback.json — edit to update portfolio
  app/
    globals.css   entire design system (.kit scoped)
```

See [AGENTS.md](./AGENTS.md) for architecture, design system reference, and conventions.
See [docs/WIKI.md](./docs/WIKI.md) for a broader overview.

---

## Deploy

Push to `main` touching `apps/web/**` → GitHub Actions builds and deploys automatically.

---

## License

MIT