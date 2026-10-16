import { z } from 'zod';

// Secrets come from Infisical (`infisical run`, ADR-008), never a .env file.
// Local dev needs nothing set: the defaults point at the local Mongo service.
const envSchema = z
    .object({
        NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
        PORT: z.coerce.number().int().positive().default(4002),
        MONGODB_URI: z.string().min(1).default('mongodb://127.0.0.1:27017/boutaleb'),
        // The client's origin: Clerk tokens carry it as `azp`, and only it may
        // call the API.
        CLIENT_ORIGIN: z.url().default('http://localhost:3002'),
        // Either verifies Clerk session tokens. CLERK_JWT_KEY (the PEM public
        // key) does it without a network call; CLERK_SECRET_KEY fetches JWKS.
        CLERK_SECRET_KEY: z.string().min(1).optional(),
        CLERK_JWT_KEY: z.string().min(1).optional(),
    })
    .refine((env) => env.CLERK_SECRET_KEY || env.CLERK_JWT_KEY, {
        message: 'CLERK_SECRET_KEY or CLERK_JWT_KEY is required',
        path: ['CLERK_SECRET_KEY'],
    });

export type Env = z.infer<typeof envSchema>;

export function validateEnv(raw: Record<string, unknown>): Env {
    const env = envSchema.parse(raw);
    // The local defaults must never reach production silently.
    if (env.NODE_ENV === 'production' && (!raw.MONGODB_URI || !raw.CLIENT_ORIGIN)) {
        throw new Error('MONGODB_URI and CLIENT_ORIGIN are required in production');
    }
    return env;
}
