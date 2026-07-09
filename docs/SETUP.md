# Setup Guide

## Prerequisites

- Node.js 22+
- Docker & Docker Compose
- npm 10+

## Quick Start (Development)

```bash
# 1. Install dependencies
npm install

# 2. Start MySQL via Docker
docker compose up db -d

# 3. Wait for healthy status
docker compose ps   # should show "healthy"

# 4. Push schema to DB
npm run db:push

# 5. Start dev server
npm run dev
# → http://localhost:3000
```

## Environment Variables

Copy `.env.example` to `.env` and fill in values:

| Variable | Required | Description |
|----------|----------|-------------|
| `JWT_SECRET` | Yes | Secret key for signing session JWTs (any long random string) |
| `DATABASE_URL` | Yes | MySQL connection string: `mysql://user:pass@host:port/db` |
| `ADMIN_EMAIL` | No | Email address that gets admin role on registration |

## Docker (Production)

```bash
# Build and start everything
docker compose up --build -d

# View logs
docker compose logs -f app
docker compose logs -f db
```

The app container:
1. Installs deps (`npm ci`)
2. Builds frontend + backend (`npm run build`)
3. Prunes dev deps
4. Runs `npm run start` → `node dist/boot.js` on port 3000

The db container:
- MySQL 8.4 with `--mysql-native-password=ON`
- Auto-creates database `saanjhcyber` and user `saanjh`
- Data persisted in `mysql_data` volume
- Healthcheck via mysqladmin ping

## Commands Reference

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with Hono backend |
| `npm run build` | Build frontend (Vite) + backend (esbuild) |
| `npm run start` | Run production server |
| `npm run check` | TypeScript type check |
| `npm run lint` | ESLint |
| `npm run format` | Prettier format all files |
| `npm run test` | Run Vitest (api tests) |
| `npm run db:generate` | Generate Drizzle migration |
| `npm run db:migrate` | Apply Drizzle migrations |
| `npm run db:push` | Push schema to DB (dev shortcut) |

## Troubleshooting

### Docker "unknown variable default-authentication-plugin"
MySQL 8.4 removed this option. Use `--mysql-native-password=ON` instead.

### npm install fails with ENOTFOUND
Check `package-lock.json` for dead registry mirrors. Replace with `https://registry.npmjs.org/`.

### TypeScript "Invalid value for ignoreDeprecations"
TS 5.9+ no longer accepts `"ignoreDeprecations": "6.0"`. Remove it from tsconfig files.

### Port 3306 already in use
Stop local MySQL or change the port mapping in docker-compose.yml.
