FROM node:24-alpine

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@12.3.4 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

RUN mkdir -p public/uploads && chown -R node:node /app

# Serwer produkcyjny (next start) — bez trybu deweloperskiego i bez uprawnień roota.
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

USER node

EXPOSE 3000

# Migracja i seed muszą poprzedzić build, ponieważ strony są prerenderowane z bazy.
CMD ["sh", "-c", "pnpm db:migrate && pnpm db:seed && pnpm build && pnpm start"]
