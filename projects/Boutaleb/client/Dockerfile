# Next multi-stage Dockerfile
FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --only=production || true

FROM node:18-alpine AS builder
WORKDIR /app
COPY . .
RUN npm install
# NEXT_PUBLIC_* vars are inlined at build time by Next.js. This Dockerfile's build stage
# runs unwrapped, so NEXT_PUBLIC_SITE_URL/NEXT_PUBLIC_API_URL bake in as undefined here —
# this image is a local-dev fallback with degraded SEO env, not prod. Netlify (Task 9) is
# the real client deploy target and injects these correctly before its own build.
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache bash curl && curl -1sLf 'https://artifacts-cli.infisical.com/setup.alpine.sh' | bash && apk add --no-cache infisical
COPY --from=builder /app/ ./
EXPOSE 3002
CMD ["sh", "-c", "exec infisical run --env=${INFISICAL_ENV:-prod} --token=$INFISICAL_TOKEN -- npm start"]
