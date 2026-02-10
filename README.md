# Showcase℠ — Full-Stack Portfolio Playground

**Stack**
- **.NET 10, Next.js 15, SQLite** — Minimal API, EF Core 10, Ardalis.Specification  

---

## Structure
```
showcase/
│
├─ apps/
│  ├─ api/
│  │   ├─ Api.Core/            # Entities, abstractions, specifications
│  │   ├─ Api.Infrastructure/  # EF Core 10 + repositories + DbContext
│  │   └─ Api.Web/             # Minimal API, DI, Swagger, Serilog
│  │
│  └─ web/
│      ├─ src/
│      │   ├─ app/          # Next.js App Router pages
│      │   ├─ components/   # UI components (Navbar, ProjectCard)
│      │   └─ lib/          # Hooks, types, utilities
│      └─ .env.local        # Front-end env vars
│
└─ README.md
```

---

## Local Development (arch linux, omarchy version, 3.3.0 i think, January 2026)

### BACKEND
Requirements:
```
dotnet-sdk
aspnet-runtime
aspnet-targeting-pack (?)
```
```bash
cd apps/api
dotnet run --project Api.Web --urls http://localhost:8080
```

### FRONTEND
Requirements:
```
- Node.js ≥ 20  
- .NET SDK 10  
- pnpm (`npm i -g pnpm` or `corepack enable && corepack prepare pnpm@9 --activate`)
```
```bash
cd apps/web
npm run dev
```

---

## 🔧 Common Tasks

| Task | Command | Notes |
|------|----------|-------|
| Run API | `dotnet run --project Api.Web --urls http://localhost:8080` | SQLite local DB |
| Run migrations | `dotnet ef migrations add <Name> -p Api.Infrastructure -s Api.Web` | |
| Apply migrations | `dotnet ef database update -p Api.Infrastructure -s Api.Web` | |
| Run frontend | `pnpm dev` | Runs on port 3000 |
| Lint frontend | `pnpm lint` | ESLint + TypeScript |
| Clean Next.js cache | PowerShell: `Remove-Item -Recurse -Force .next` | |

---

## Seeding
The API auto-seeds one project (`clean-architecture-blueprint`) if the database is empty.  
Data is stored in `app.db` under `Api.Web`. Delete it anytime to re-seed.

---

## Environment Variables

**`apps/web/.env.local`**
```
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

**`apps/api/Api.Web/appsettings.Development.json`**
```json
{
  "ConnectionStrings": { "db": "Data Source=app.db" },
  "AllowedOrigin": "http://localhost:3000"
}
```

---

## Next Steps
- Add `/portfolio/[slug]` route for detailed case studies (MDX or API)  
- Implement live demo endpoints (e.g., Pathfinding, AI integrations)  
- Add Dockerfile + GitHub Actions for Azure/Vercel deployments  
- Replace seed data with JSON/MDX content pipeline  
- Introduce Contentlayer for type-safe static content

---

## Troubleshooting

| Issue | Likely Fix |
|-------|-------------|
| CORS error | Ensure `AllowedOrigin` matches `http://localhost:3000` exactly |
| `pnpm: command not found` | Install globally or `corepack enable` |
| EF Core migration error | Both `Api.Infrastructure` and `Api.Web` need `Microsoft.EntityFrameworkCore.Design` |
| Next.js “invalid element type” | Check default vs named imports |
| Port conflict | Kill process (`netstat -ano | findstr :8080`) or change port |

---

## License
MIT — do whatever you want; credit link appreciated.

---

## Author
**Tămaș Cosmin** but you can call me Tom  
.NET / Full-Stack Developer
[LinkedIn](https://www.linkedin.com/in/tamascosmin) • [GitHub](https://github.com/CsmnTms)
