FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache bash curl && curl -1sLf 'https://artifacts-cli.infisical.com/setup.alpine.sh' | bash && apk add --no-cache infisical
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 4002
CMD infisical run --env=${INFISICAL_ENV:-prod} --token=$INFISICAL_TOKEN -- node dist/main.js
