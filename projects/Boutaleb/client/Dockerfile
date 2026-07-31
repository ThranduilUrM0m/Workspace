# Next multi-stage Dockerfile
FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --only=production || true

FROM node:18-alpine AS builder
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache bash curl && curl -1sLf 'https://artifacts-cli.infisical.com/setup.alpine.sh' | bash && apk add --no-cache infisical
COPY --from=builder /app/ ./
EXPOSE 3002
CMD infisical run --env=${INFISICAL_ENV:-prod} --token=$INFISICAL_TOKEN -- npm start
