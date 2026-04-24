# Copilot instructions — showcase

Portfolio site for tecdev. Next.js 16 static export, TypeScript 6, Tailwind v4.
App lives in `apps/web/src/`. No backend, no API, no database, no runtime fetch.

## Stack

Next.js 16 App Router · React 19 · TypeScript 6 · Tailwind v4 · pnpm monorepo

## Design system

All component styles are in `apps/web/src/app/globals.css` scoped under `.kit` on `<body>`.
Primitives: `AscFrame`, `WinBar`, `SecH`, `Pill`, `Tag` — all in `apps/web/src/components/kit.tsx`.

Key CSS variables:
- `--bg / --bg-1 / --bg-2 / --bg-3` — background layers
- `--ink / --ink-2 / --ink-3 / --ink-4` — text, dimmer as number increases
- `--rust` — primary accent (interactive, emphasis)
- `--olive / --teal / --mustard / --plum` — secondary accents
- `--mono / --sans` — font stacks
- `--rule / --rule-2` — border colors

Two themes: `warm` (light, default) and `dusk` (dark) via `data-theme` on `<html>`.

## Conventions

- Use Tailwind for layout (flex, grid, spacing). Never for color, font, or shape — those are kit CSS.
- Server components by default. `'use client'` only for browser APIs, event handlers, or hooks.
- All visible text lowercase.
- TypeScript strict — no `any`, no untyped props.
- No runtime `fetch` — all data is statically imported at build time.
- No `console.log` in committed code.
- All new tools go in `apps/web/src/app/<name>/page.tsx` and in the `TOOLS` array in `navbar.tsx`.
