FROM node:22-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates openssl \
  && rm -rf /var/lib/apt/lists/* \
  && corepack enable \
  && corepack prepare pnpm@9.14.4 --activate

WORKDIR /app

COPY . .

RUN pnpm install --frozen-lockfile \
  && pnpm --filter=@webstudio-is/prisma-client generate \
  && pnpm --filter=@webstudio-is/builder build

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["pnpm", "--filter=@webstudio-is/builder", "start"]
