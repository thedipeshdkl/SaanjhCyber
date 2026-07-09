# Architecture

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | React + TypeScript | 19.x |
| Bundler | Vite | 7.x |
| Styling | Tailwind CSS + shadcn/ui components | 3.4 |
| Routing (FE) | react-router-dom | 7.x |
| State/Data | TanStack Query + tRPC React | 5.x / 11.x |
| Backend | Hono (Node.js) | 4.x |
| API Layer | tRPC | 11.x |
| ORM | Drizzle ORM | 0.45 |
| Database | MySQL | 8.4 |
| Auth | Email/password + jose JWT sessions | - |
| Validation | Zod | 4.x |
| Testing | Vitest | 4.x |
| Deploy | Docker + docker-compose | - |

## Folder Structure

```
├── api/                    # Backend (Hono + tRPC)
│   ├── boot.ts             # Server entry point
│   ├── router.ts           # Root tRPC router (merges sub-routers)
│   ├── middleware.ts       # tRPC init, auth/role middleware
│   ├── context.ts          # tRPC context (req, resHeaders, user?)
│   ├── *-router.ts         # Feature routers (auth, report, entity, etc.)
│   ├── lib/                # Utilities (env, cookies, session, http, vite)
│   └── queries/            # DB connection + user queries
├── contracts/              # Shared types/constants (frontend + backend)
│   ├── types.ts            # Re-exports from db/schema
│   ├── constants.ts        # AuthSession config, ErrorMessages, Paths
│   └── errors.ts           # Typed error constructors
├── db/                     # Database layer
│   ├── schema.ts           # Drizzle table definitions (15+ tables)
│   ├── relations.ts        # Drizzle relations
│   ├── seed.ts             # Seed script
│   └── migrations/         # Generated SQL migrations
├── src/                    # Frontend (React)
│   ├── App.tsx             # Route definitions
│   ├── main.tsx            # React entry (BrowserRouter + TRPCProvider)
│   ├── components/         # Layout + 53 shadcn/ui components
│   ├── pages/              # Page components (12 pages)
│   ├── hooks/              # Custom hooks (useAuth, useMobile)
│   └── providers/          # tRPC + QueryClient provider
├── docs/                   # This documentation folder
├── docker-compose.yml      # MySQL 8.4 + app services
├── Dockerfile              # Multi-stage Node 22 Alpine build
├── vite.config.ts          # Dev server (Hono plugin) + build config
├── vitest.config.ts        # Test config (api/**/*.test.ts)
├── drizzle.config.ts       # Drizzle Kit config (MySQL)
└── tsconfig.json           # Project references (app, node, server)
```

## Request Flow

```
Browser → Vite Dev Server (port 3000)
  ├── /api/trpc/*  → Hono → tRPC fetchRequestHandler → router → DB
  └── /*           → Vite React (SPA)
```

## Build & Production

```
npm run build
  1. vite build → dist/public/ (static frontend assets)
  2. esbuild api/boot.ts → dist/boot.js (server bundle)

npm run start
  → node dist/boot.js (serves API + static files on port 3000)
```

## Key Design Decisions

- Single port (3000) serves both API and frontend
- tRPC with superjson transformer for type-safe API calls
- Standalone auth: email/password registration + login, JWT in httpOnly cookie
- Session tokens signed with HS256 (jose library), 7-day expiry
- Drizzle ORM with raw mysql2 driver (planetscale mode)
- All env vars validated at startup via `api/lib/env.ts`
- Frontend uses path aliases: `@/` = src, `@contracts/` = contracts, `@db/` = db
