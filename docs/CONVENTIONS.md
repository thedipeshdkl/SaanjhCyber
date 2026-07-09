# Code Conventions

## Project Patterns

### Backend (api/)

- **Router pattern**: Each feature gets a `*-router.ts` file exporting a tRPC sub-router
- **Middleware**: `publicQuery`, `authedQuery`, `adminQuery`, `moderatorQuery`, `researcherQuery`
- **DB access**: Always via `getDb()` from `api/queries/connection.ts` (singleton)
- **Validation**: Zod schemas in `.input()` of tRPC procedures
- **Errors**: Use `TRPCError` with codes: UNAUTHORIZED, FORBIDDEN, NOT_FOUND, BAD_REQUEST
- **Env**: Access via `env` object from `api/lib/env.ts` (validated at boot)
- **Auth**: `api/lib/session.ts` handles JWT sign/verify/authenticate

### Frontend (src/)

- **State**: Server state via tRPC + TanStack Query (no Redux/Zustand)
- **Forms**: react-hook-form with zod resolvers
- **Components**: shadcn/ui from `src/components/ui/` — import as `@/components/ui/button`
- **Animations**: framer-motion for page transitions and reveals
- **Auth hook**: `useAuth()` from `@/hooks/useAuth` for user state, login redirect, logout
- **tRPC client**: `trpc` from `@/providers/trpc` — usage: `trpc.report.create.useMutation()`

### Shared (contracts/)

- Types re-exported from `db/schema.ts` (Drizzle inferred types)
- Constants shared between frontend and backend (cookie names, paths, error messages)

## Naming

| What | Convention | Example |
|------|-----------|---------|
| Files | kebab-case | `auth-router.ts`, `use-mobile.ts` |
| React components | PascalCase | `ReportDetail.tsx` |
| DB tables | camelCase | `caseTimeline`, `savedSearches` |
| DB columns | camelCase | `reporterId`, `riskLevel` |
| tRPC routes | camelCase | `report.create`, `entity.search` |
| Env vars | SCREAMING_SNAKE | `DATABASE_URL`, `JWT_SECRET` |
| CSS | Tailwind utility classes | No CSS modules |

## Imports

```typescript
// Path aliases (configured in tsconfig + vite)
import { Button } from "@/components/ui/button";    // src/components/ui/button
import { AuthSession } from "@contracts/constants";  // contracts/constants
import { users } from "@db/schema";                  // db/schema
```

## Testing

- Test files: `api/**/*.test.ts` or `api/**/*.spec.ts`
- Framework: Vitest with Node environment
- Run: `npm run test`

## Style

- Formatter: Prettier (`.prettierrc`)
- Linter: ESLint with flat config (`eslint.config.js`)
- TypeScript: Strict mode, no unused locals/params
- Semicolons: Yes (Prettier default)
- Quotes: Double (Prettier default)
- Indent: 2 spaces

## Git

- `.env` is gitignored — use `.env.example` as reference
- `node_modules/`, `dist/`, `coverage/` are gitignored
- DB migration SQL files are gitignored (regenerate with `db:generate`)
