FROM node:24-alpine AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@12.3.4 --activate

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# Build nie łączy się z bazą: wszystkie trasy są dynamiczne (nonce CSP),
# więc obraz można zbudować bez działającego PostgreSQL.
FROM deps AS builder
COPY . .
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    BETTER_AUTH_URL=http://localhost:3000 \
    BETTER_AUTH_SECRET=build-only-secret-not-used-at-runtime-0123456789 \
    DATABASE_URL=postgresql://build:build@127.0.0.1:1/build
RUN pnpm build

FROM base AS runner
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3000

# Tylko zależności produkcyjne — bez TypeScript, ESLint, Tailwind i narzędzi dev.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --prod && pnpm store prune

COPY --from=builder --chown=node:node /app/.next ./.next
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/next.config.mjs ./next.config.mjs
COPY --from=builder --chown=node:node /app/scripts ./scripts
COPY --from=builder --chown=node:node /app/db ./db
RUN mkdir -p public/uploads && chown -R node:node public/uploads

USER node
EXPOSE 3000

# Migracje i seed muszą poprzedzić start. Bootstrap admina jest idempotentny.
CMD ["sh", "-c", "node scripts/migrate.mjs && node scripts/seed-if-empty.mjs && node scripts/create-account.mjs --from-env && node node_modules/next/dist/bin/next start"]
