# Future Updates

Prioritized roadmap of features and improvements.

## Priority 1 — Security & Reliability

| Feature | Effort | Impact |
|---------|--------|--------|
| Rate limiting on auth endpoints | Small | Prevents brute-force attacks |
| Email verification on registration | Medium | Ensures valid email ownership |
| Password reset via email | Medium | Essential for production users |
| CSRF protection (double-submit cookie) | Small | Prevents cross-site request forgery |
| Session revocation (logout all devices) | Small | User can invalidate all sessions |
| Account lockout after N failed attempts | Small | Mitigates credential stuffing |
| IP-based login alerts | Medium | Notifies user of new device logins |

## Priority 2 — Core Features

| Feature | Effort | Impact |
|---------|--------|--------|
| S3 file upload for evidence | Medium | Required for production evidence storage |
| Nepal geography seed data | Small | Populates province/district/municipality dropdowns |
| Search improvements (full-text index) | Medium | Much faster entity and report search |
| Real-time notifications (SSE) | Medium | Live updates for case status changes |
| Report PDF/CSV export | Medium | Users can download their case files |
| Article markdown editor | Medium | Admin can write awareness content |

## Priority 3 — UX & Frontend

| Feature | Effort | Impact |
|---------|--------|--------|
| Dashboard charts with real data | Small | Visual analytics for users and admins |
| Dark mode | Small | Accessibility and user preference |
| Nepali language (i18n) | Large | Nepal-specific audience needs |
| Progressive Web App (PWA) | Medium | Offline access, push notifications |
| Accessibility audit (WCAG 2.1 AA) | Medium | Inclusive design |
| Code splitting (lazy routes) | Small | Faster initial page load |
| Image optimization + lazy loading | Small | Better performance |

## Priority 4 — Admin & Moderation

| Feature | Effort | Impact |
|---------|--------|--------|
| Bulk actions (approve/reject multiple reports) | Small | Faster moderation workflow |
| Report assignment to moderators | Small | Distributed workload |
| Entity merge/dedup tool | Medium | Cleaner database |
| Auto-risk scoring (ML/heuristic) | Large | Automated triage |
| Admin dashboard email reports (weekly digest) | Medium | Passive monitoring |
| Export audit logs | Small | Compliance requirements |
| Moderator activity tracking | Small | Accountability |

## Priority 5 — Research & Analytics

| Feature | Effort | Impact |
|---------|--------|--------|
| SUS score visualization | Small | Research data display |
| Participant consent management | Medium | Ethics compliance |
| A/B testing framework | Large | UX research capability |
| Geographic heatmap of reports | Medium | Visual crime hotspot mapping |
| Time-series analysis | Medium | Trend detection |
| API for external researchers | Medium | Data sharing |

## Architecture Improvements

| Improvement | Reason |
|-------------|--------|
| Add Redis for session store | Enables session revocation, rate limiting |
| Queue system (BullMQ) for emails | Async email sending, retries |
| Separate API from frontend build | Independent scaling |
| Database read replicas | Handle read-heavy search traffic |
| CDN for static assets | Faster global delivery |
| Structured logging (pino) | Production debugging |
| Health check endpoint | Container orchestration readiness |
| OpenTelemetry tracing | Performance monitoring |

## Tech Debt

| Item | Priority |
|------|----------|
| Add Drizzle relations (currently empty file) | Low |
| Remove unused `InsertUser` type export | Low |
| Update `input-otp` package (React 19 compat) | Low |
| Add frontend tests (React Testing Library) | Medium |
| Add E2E tests (Playwright) | Medium |
| Seed script for development data | Medium |
| CI/CD pipeline (GitHub Actions) | High |
| Environment-specific configs (staging vs prod) | High |

## How to Pick Next Tasks

1. If deploying to production → Priority 1 (security)
2. If demoing to stakeholders → Priority 2 + 3 (features + UX)
3. If writing dissertation → Priority 5 (research)
4. If onboarding team → Architecture + Tech Debt
