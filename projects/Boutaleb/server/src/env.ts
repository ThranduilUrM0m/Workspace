import { z } from 'zod';

// Secrets come from Infisical (`infisical run`, ADR-008), never a .env file.
// Local dev needs nothing set: the defaults point at the docker-compose Mongo.
const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(4002),
    MONGODB_URI: z.string().min(1).default('mongodb://127.0.0.1:27017/boutaleb'),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(raw: Record<string, unknown>): Env {
    const env = envSchema.parse(raw);
    // The local default must never reach production silently.
    if (env.NODE_ENV === 'production' && !raw.MONGODB_URI) {
        throw new Error('MONGODB_URI is required in production');
    }
    return env;
}
