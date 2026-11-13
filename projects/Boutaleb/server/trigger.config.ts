import { defineConfig } from '@trigger.dev/sdk';

// Trigger.dev, Boutaleb's background jobs (src/trigger). Development:
// `pnpm jobs:dev` runs them on this machine through Infisical, so the data
// never leaves it; the dashboard only sees run metadata. Production: the
// self-hosted Trigger.dev on Oracle (Casablanca), set up at deploy.
//
// 3 attempts with backoff, retried in dev too, so a failure behaves here
// as it will in production (public-forms.md §5).
export default defineConfig({
    project: 'proj_lurzeocljqflswepvand',
    dirs: ['./src/trigger'],
    maxDuration: 120,
    retries: {
        enabledInDev: true,
        default: { maxAttempts: 3, minTimeoutInMs: 2_000, maxTimeoutInMs: 60_000, factor: 3, randomize: true },
    },
});
