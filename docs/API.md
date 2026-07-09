# API Reference

All endpoints are tRPC procedures at `/api/trpc`. Client uses `httpBatchLink` with superjson.

## Auth Levels

| Middleware | Access |
|-----------|--------|
| `publicQuery` | Anyone (no auth needed) |
| `authedQuery` | Logged-in users |
| `moderatorQuery` | admin, moderator |
| `adminQuery` | admin only |
| `researcherQuery` | admin, researcher |

## Routers

### ping
- `ping` (public query) → `{ ok: boolean, ts: number }`

### auth
- `auth.register` (public mutation) → `{ name, email, password }` → sets session cookie
- `auth.login` (public mutation) → `{ email, password }` → sets session cookie
- `auth.me` (authed query) → current user object
- `auth.logout` (authed mutation) → clears session cookie

### report
- `report.create` (authed mutation) → creates report + case number
- `report.getById` (public query) → single report by ID
- `report.list` (public query) → paginated reports (public only)
- `report.myReports` (authed query) → user's own reports
- `report.getStats` (public query) → aggregate stats (total, by status, resolved)
- `report.addEvidence` (authed mutation) → attach file to report
- `report.updateStatus` (moderator mutation) → change report status

### entity
- `entity.search` (public query) → search entities by value/type/risk
- `entity.getById` (public query) → single entity details
- `entity.getStats` (public query) → entity aggregate stats
- `entity.create` (moderator mutation) → add new entity
- `entity.update` (moderator mutation) → update entity risk/status

### notification
- `notification.list` (authed query) → user's notifications
- `notification.markRead` (authed mutation) → mark as read
- `notification.markAllRead` (authed mutation) → mark all read

### bookmark
- `bookmark.list` (authed query) → user's bookmarked reports
- `bookmark.toggle` (authed mutation) → add/remove bookmark
- `bookmark.check` (authed query) → check if report is bookmarked

### search
- `search.query` (public query) → full-text search across entities + reports
- `search.save` (authed mutation) → save search query

### appeal
- `appeal.create` (authed mutation) → appeal a report/entity
- `appeal.list` (moderator query) → list pending appeals
- `appeal.resolve` (moderator mutation) → approve/reject appeal

### feedback
- `feedback.create` (public mutation) → submit platform feedback
- `feedback.list` (admin query) → list all feedback

### research
- `research.submitSurvey` (public mutation) → SUS survey submission
- `research.registerParticipant` (public mutation) → participant registration
- `research.getResults` (researcher query) → aggregated research data

### admin
- `admin.getStats` (admin query) → admin dashboard stats
- `admin.listReports` (admin query) → all reports with filters
- `admin.listUsers` (admin query) → all users
- `admin.updateUserRole` (admin mutation) → change user role

### article
- `article.list` (public query) → published articles
- `article.getBySlug` (public query) → single article by slug
- `article.create` (admin mutation) → create article
- `article.update` (admin mutation) → update article

## Auth Flow

1. User submits email + password on `/login`
2. Backend verifies credentials (scrypt hash)
3. Signs a JWT session token (HS256, 7-day expiry)
4. Sets `saanjhcyber_auth_session` httpOnly cookie
5. Frontend calls `auth.me` to get user object
6. Logout clears the cookie (maxAge=0)

## Session Token

- Algorithm: HS256
- Secret: `JWT_SECRET` env var
- Payload: `{ userId: string }` (maps to `users.unionId`)
- Expiry: 7 days
- Storage: httpOnly cookie, sameSite=Lax (localhost) or None (production)
