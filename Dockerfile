FROM node:24-alpine

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@12.3.4 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

ENV NODE_ENV=development
ENV HOSTNAME=0.0.0.0

EXPOSE 3000

CMD ["sh", "-c", "pnpm db:migrate && pnpm db:seed && pnpm dev"]
