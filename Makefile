dev:
\tcd apps/api && dotnet run & \\
\tcd apps/web && pnpm dev

test:
\tdotnet test || true
\tpnpm -C apps/web test || true
