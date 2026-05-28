# ─── Stage 1: Build ─────────────────────────────────────────────
FROM node:24-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.14.0 --activate

WORKDIR /app

# Copy workspace config first (cache layer for deps)
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json turbo.json ./
COPY packages/tarot-db/package.json packages/tarot-db/
COPY packages/tarot-core/package.json packages/tarot-core/
COPY packages/tarot-ai/package.json packages/tarot-ai/
COPY packages/auth-core/package.json packages/auth-core/
COPY packages/payments-core/package.json packages/payments-core/
COPY apps/tarot-web/package.json apps/tarot-web/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code for workspace packages
COPY packages/tarot-db/ packages/tarot-db/
COPY packages/tarot-core/ packages/tarot-core/
COPY packages/tarot-ai/ packages/tarot-ai/
COPY packages/auth-core/ packages/auth-core/
COPY packages/payments-core/ packages/payments-core/

# Copy app source
COPY apps/tarot-web/ apps/tarot-web/

# Build only tarot-web and its dependencies
RUN pnpm --filter @webdrops/tarot-web... build

# ─── Stage 2: Production ────────────────────────────────────────
FROM node:24-alpine AS runner

RUN corepack enable && corepack prepare pnpm@10.14.0 --activate

WORKDIR /app

# Copy workspace scaffolding
COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./

# Copy built app output
COPY --from=builder /app/apps/tarot-web/dist/ apps/tarot-web/dist/
COPY --from=builder /app/apps/tarot-web/package.json apps/tarot-web/

# Copy Node HTTP entry point
COPY apps/tarot-web/server-entry.mjs apps/tarot-web/dist/server/entry.mjs

# Copy workspace package.json files (needed for resolution)
COPY --from=builder /app/packages/tarot-db/package.json packages/tarot-db/
COPY --from=builder /app/packages/tarot-core/package.json packages/tarot-core/
COPY --from=builder /app/packages/tarot-ai/package.json packages/tarot-ai/
COPY --from=builder /app/packages/auth-core/package.json packages/auth-core/
COPY --from=builder /app/packages/payments-core/package.json packages/payments-core/

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy node_modules for workspace packages (needed at runtime)
COPY --from=builder /app/packages/tarot-db/node_modules/ packages/tarot-db/node_modules/
COPY --from=builder /app/packages/tarot-core/node_modules/ packages/tarot-core/node_modules/
COPY --from=builder /app/packages/tarot-ai/node_modules/ packages/tarot-ai/node_modules/
COPY --from=builder /app/packages/auth-core/node_modules/ packages/auth-core/node_modules/
COPY --from=builder /app/packages/payments-core/node_modules/ packages/payments-core/node_modules/

# Set working directory to app
WORKDIR /app/apps/tarot-web

# Expose port
EXPOSE 3010

# Environment defaults
ENV PORT=3010
ENV NODE_ENV=production

# Start the server
CMD ["node", "dist/server/entry.mjs"]
