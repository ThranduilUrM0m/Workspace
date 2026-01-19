# Boutaleb Project

This project is part of the [My Workspace Monorepo](../../README.md).

## Local Development

```bash
cd projects/Boutaleb
pnpm install
pnpm run dev
```

## Deployment (Render)

### Client
- Root Directory: `projects/Boutaleb/client`
- Build Command: `pnpm install --frozen-lockfile && pnpm build`
- Start Command: `pnpm start`
- Set environment variables in Render dashboard (see .env)

### Server
- Root Directory: `projects/Boutaleb/server`
- Build Command: `pnpm install --frozen-lockfile && pnpm build`
- Start Command: `node dist/main.js`
- Set environment variables in Render dashboard (see .env)

## Environment Variables

See `client/.env` and `server/.env` for required variables.

For more details, see the main workspace [README](../../README.md).
