# Boutaleb Project

This project is part of the [My Workspace Monorepo](../../README.md).

## Local Development

```bash
cd projects/Boutaleb
pnpm install
pnpm run dev
```

## Deployment (Netlify + Oracle Cloud/Coolify)

### Client (Netlify)

- Base directory: `projects/Boutaleb/client`
- Build Command: `pnpm install --frozen-lockfile && pnpm build`
- Publish directory: `.next`
- Set environment variables in Netlify site settings (see .env)

### Server (Oracle Cloud Always Free, via Coolify)

- Deployed as a Docker container per `server/Dockerfile`, orchestrated by
  Coolify running on an Oracle Cloud Always Free `VM.Standard.A1.Flex`
  instance, alongside self-hosted MongoDB.
- Build/start handled by Coolify from the Dockerfile (`pnpm install
  --frozen-lockfile && pnpm build`, then `node dist/main.js`).
- Secrets managed via Infisical, not committed `.env` files.
- Full design/reasoning:
  `Blueprinting/plans/2026-07-31-boutaleb-deployment-infra-implementation.md`
  and ADR-006 through ADR-011 in `decisions/`.

## Environment Variables

See `client/.env` and `server/.env` for required variables.

For more details, see the main workspace [README](../../README.md).
