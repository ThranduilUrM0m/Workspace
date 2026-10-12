# Build context: the my_workspace root (pnpm workspace + lockfile), e.g.
#   docker build -f projects/Boutaleb/server/Dockerfile .
FROM node:24-alpine AS builder
WORKDIR /repo
RUN corepack enable
COPY . .
RUN pnpm install --frozen-lockfile --filter boutaleb-server... \
    && pnpm --filter boutaleb-server build \
    && pnpm --filter boutaleb-server deploy --legacy --prod /out \
    && cp -r projects/Boutaleb/server/dist /out/dist

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4002
RUN apk add --no-cache bash curl && curl -1sLf 'https://artifacts-cli.infisical.com/setup.alpine.sh' | bash && apk add --no-cache infisical
COPY --from=builder /out ./
EXPOSE 4002
CMD ["sh", "-c", "exec infisical run --env=${INFISICAL_ENV:-prod} --token=$INFISICAL_TOKEN -- node dist/main.js"]
