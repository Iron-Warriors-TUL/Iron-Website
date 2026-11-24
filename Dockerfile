FROM node:24-alpine

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@12.3.4 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
# Chown tylko raz, w warstwie zależności — nie przy każdej zmianie kodu.
RUN pnpm install --frozen-lockfile && chown -R node:node /app

# Pliki źródłowe od razu z właścicielem node (bez kosztownego chown -R 48k plików).
COPY --chown=node:node . .
RUN mkdir -p public/uploads && chown -R node:node public/uploads

# Serwer produkcyjny (next start) — bez trybu deweloperskiego i bez uprawnień roota.
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

USER node

EXPOSE 3000

# Migracja i seed muszą poprzedzić build, ponieważ strony są prerenderowane z bazy.
CMD ["sh", "-c", "pnpm db:migrate && pnpm db:seed && pnpm build && pnpm start"]
