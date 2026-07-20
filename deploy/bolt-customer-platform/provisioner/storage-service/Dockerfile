FROM node:20.18.0-alpine

RUN apk add --no-cache git

WORKDIR /app

COPY package.json ./
COPY src ./src

RUN addgroup -S bolt && adduser -S -G bolt -u 10001 bolt

USER bolt

ENV PORT=4100 \
    REPOSITORY_ROOT=/repository

EXPOSE 4100

CMD ["node", "src/server.mjs"]
