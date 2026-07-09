# Progress Log

## What's Done

### Infrastructure
- [x] Docker Compose — MySQL 8.4 + app service, healthcheck, volume persistence
- [x] Dockerfile — multi-stage Node 22 Alpine build (base → build → runtime)
- [x] Environment — simplified to 3 vars: `JWT_SECRET`, `DATABASE_URL`, `ADMIN_EMAIL`
- [x] npm registry — fixed 319 dead mirror URLs in package-lock.json
- [x] TypeScript — 0 errors, strict mode, TS 5.9 compatible configs
- [x] Vitest — 15 tests passing (router, env, full auth integration)
- [x] Build — Vite frontend + esbuild backend, single `npm run build`

### Auth System
- [x] Standalone JWT auth (no external OAuth dependency)
- [x] Email/password registration with scrypt hashing (64-byte key, random salt)
- [x] Login with credential verification
- [x] Session tokens — HS256 JWT, 7-day expiry, httpOnly cookie
- [x] `auth.me` — returns user without password hash
- [x] `auth.logout` — clears session cookie
- [x] Superadmin role — one and only one, auto-created from ADMIN_EMAIL
- [x] Superadmin protection — cannot be deleted, demoted, or modified
- [x] Password never exposed in any API response

### Admin Panel (`/admin`)
- [x] Overview tab — 8 stat cards with live data
- [x] Reports tab — filterable table, inline status change
- [x] Users tab — search, role filter, role management, delete (superadmin only)
- [x] Security tab — admin count, inactive users, security rules display
- [x] Audit tab — full action log with timestamps
- [x] Role-based access — only admin/superadmin can access
- [x] Audit logging — all role changes, deletions, status changes logged

### Frontend
- [x] 12 pages: Home, Report, Search, Track, ReportDetail, Dashboard, Admin, Research, Awareness, ArticleDetail, Login, NotFound
- [x] Layout with responsive navbar + footer
- [x] Admin badge in navbar for admin/superadmin
- [x] Admin Panel link in mobile nav
- [x] Login page — email/password with register toggle
- [x] 53 shadcn/ui components
- [x] Framer Motion animations
- [x] Tailwind CSS with custom Nepal-themed design tokens

### Backend (tRPC)
- [x] 12 routers: ping, auth, report, entity, notification, bookmark, search, appeal, feedback, research, admin, article
- [x] 5 middleware levels: public, authed, moderator, admin, superadmin
- [x] Drizzle ORM with 15+ MySQL tables
- [x] Body limit (50MB) for evidence uploads
- [x] superjson transformer for dates and BigInt

### Database
- [x] Users (with roles: user, moderator, admin, superadmin, researcher)
- [x] Reports (16 crime categories, 7 statuses, privacy levels)
- [x] Evidence (7 file types, S3-ready)
- [x] Entities (17 types, 4 risk levels, verification status)
- [x] Case Timeline, Comments, Notifications, Bookmarks
- [x] Appeals, Feedback, Surveys, Participants
- [x] Articles (5 categories, slug-based)
- [x] Nepal Geography (provinces, districts, municipalities)
- [x] Audit Logs

### Security
- [x] scrypt password hashing with random salt
- [x] JWT sessions with HS256 signing
- [x] httpOnly cookies (secure in production, sameSite)
- [x] Role-based middleware on every protected route
- [x] Superadmin immutability (cannot be removed from system)
- [x] Audit trail for all admin actions
- [x] No password exposure in API responses
- [x] Input validation via Zod on all endpoints

## What's Not Done Yet

- [ ] Email verification on registration
- [ ] Password reset flow
- [ ] Rate limiting on login/register
- [ ] File upload to S3 (presigned URLs exist in schema, not implemented)
- [ ] Real-time notifications (WebSocket/SSE)
- [ ] Search indexing (currently uses LIKE queries)
- [ ] Nepal geography seed data (provinces/districts/municipalities)
- [ ] Article content editor (markdown or rich text)
- [ ] Export reports to PDF/CSV
- [ ] Multi-language support (Nepali translations)
- [ ] Dashboard charts (recharts imported but not wired to real data)
- [ ] Mobile app or PWA
