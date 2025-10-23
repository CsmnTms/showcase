# Showcase℠ — Full-Stack Portfolio Playground

**Stack**
- 🟦 **.NET 10** — Minimal API, EF Core 10, Ardalis.Specification  
- ⚛️ **Next.js 15 (App Router)** — TypeScript, Tailwind CSS, React Query  
- 🐘 **SQLite** — local database  
- ☁️ **Deploy target:** Azure Container App (API) + Vercel (Web)

---

## 🧩 Structure
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

## 🚀 Local Development

### Prerequisites
- Node.js ≥ 20  
- .NET SDK 10  
- pnpm (`npm i -g pnpm` or `corepack enable && corepack prepare pnpm@9 --activate`)

### 1️⃣ Start the API
```bash
cd apps/api
dotnet run --project Api.Web --urls http://localhost:8080
```

Endpoints:
- `GET /health` → `{ "status": "ok" }`
- `GET /projects` → Seeded project list
- Swagger: [http://localhost:8080/swagger](http://localhost:8080/swagger)

> If you hit CORS issues, check `AllowedOrigin` in `Api.Web/appsettings.Development.json`.

### 2️⃣ Start the Web App
```bash
cd apps/web
pnpm install
pnpm dev
```

Then open [http://localhost:3000](http://localhost:3000).  
The `/portfolio` page pulls data from the API.

---

## 🧱 Project Philosophy
This repository is a **personal showcase and experimentation playground** that blends:

- Clean backend architecture in .NET (no MediatR, no AutoMapper)  
- Modern frontend practices (App Router, React Query, Tailwind)  
- Ready-to-deploy infrastructure layout  

> **Goal:** A full-stack foundation that scales from a personal site → production demos → client projects.

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

## 🌱 Seeding
The API auto-seeds one project (`clean-architecture-blueprint`) if the database is empty.  
Data is stored in `app.db` under `Api.Web`. Delete it anytime to re-seed.

---

## 🔒 Environment Variables

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

## 🧭 Next Steps
- Add `/portfolio/[slug]` route for detailed case studies (MDX or API)  
- Implement live demo endpoints (e.g., Pathfinding, AI integrations)  
- Add Dockerfile + GitHub Actions for Azure/Vercel deployments  
- Replace seed data with JSON/MDX content pipeline  
- Introduce Contentlayer for type-safe static content

---

## 🧠 Troubleshooting

| Issue | Likely Fix |
|-------|-------------|
| CORS error | Ensure `AllowedOrigin` matches `http://localhost:3000` exactly |
| `pnpm: command not found` | Install globally or `corepack enable` |
| EF Core migration error | Both `Api.Infrastructure` and `Api.Web` need `Microsoft.EntityFrameworkCore.Design` |
| Next.js “invalid element type” | Check default vs named imports |
| Port conflict | Kill process (`netstat -ano | findstr :8080`) or change port |

---

## 🧾 License
MIT — do whatever you want; credit link appreciated.

---

## 👤 Author
**Tămaș Cosmin** but you can call me Tom  
.NET / Full-Stack Developer
[LinkedIn](https://www.linkedin.com/in/tamascosmin) • [GitHub](https://github.com/CsmnTms)
