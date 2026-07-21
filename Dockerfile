# ══════════════════════════════════════════════════════════════════
# SaanjhCyber — Multi-stage Production Dockerfile
# ══════════════════════════════════════════════════════════════════

# ── Stage 1: Install dependencies ──────────────────────────────
FROM node:22-alpine AS deps
WORKDIR /app

RUN apk add --no-cache libc6-compat

# Copy only package files for maximum layer caching
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts && npm cache clean --force

# ── Stage 2: Build application ─────────────────────────────────
FROM node:22-alpine AS build
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build frontend (Vite) + backend (esbuild)
RUN npm run build

# Remove dev dependencies for smaller production image
RUN npm prune --omit=dev && npm cache clean --force

# ── Stage 3: Production runtime ───────────────────────────────
FROM node:22-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000

# Install wget for healthcheck + dumb-init for proper signal handling
RUN apk add --no-cache wget dumb-init

# Security: run as non-root user
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

# Copy only production artifacts
COPY --from=build --chown=appuser:appgroup /app/package.json ./
COPY --from=build --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=build --chown=appuser:appgroup /app/dist ./dist

# Copy DB migrations + drizzle config for runtime migration support
COPY --from=build --chown=appuser:appgroup /app/db/migrations ./db/migrations
COPY --from=build --chown=appuser:appgroup /app/drizzle.config.ts ./drizzle.config.ts

USER appuser

EXPOSE 3000

# Health check — hits the tRPC ping endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/trpc/ping || exit 1

# Use dumb-init to handle PID 1 signals properly (graceful shutdown)
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/boot.js"]
