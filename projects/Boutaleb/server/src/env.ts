import { randomBytes } from 'node:crypto';
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
        // The API's own public address: local uploads and round view links
        // point back at it.
        PUBLIC_API_URL: z.url().default('http://localhost:4002'),
        // Signs upload and view links. Local dev gets a random one per run
        // (links die on restart, which is harmless); production must set it.
        SIGNING_KEY: z.string().min(32).optional(),
        // File storage (T7.5d). With all S3_* set, Oracle Object Storage
        // (S3-compatible); without them, a local folder.
        STORAGE_DIR: z.string().min(1).default('.storage'),
        S3_ENDPOINT: z.url().optional(),
        S3_REGION: z.string().min(1).optional(),
        S3_BUCKET: z.string().min(1).optional(),
        S3_ACCESS_KEY_ID: z.string().min(1).optional(),
        S3_SECRET_ACCESS_KEY: z.string().min(1).optional(),
    })
    .refine((env) => env.CLERK_SECRET_KEY || env.CLERK_JWT_KEY, {
        message: 'CLERK_SECRET_KEY or CLERK_JWT_KEY is required',
        path: ['CLERK_SECRET_KEY'],
    });

export type Env = z.infer<typeof envSchema> & { SIGNING_KEY: string };

const S3_KEYS = ['S3_ENDPOINT', 'S3_REGION', 'S3_BUCKET', 'S3_ACCESS_KEY_ID', 'S3_SECRET_ACCESS_KEY'] as const;

export function validateEnv(raw: Record<string, unknown>): Env {
    const env = envSchema.parse(raw);
    // The local defaults must never reach production silently.
    if (env.NODE_ENV === 'production' && (!raw.MONGODB_URI || !raw.CLIENT_ORIGIN || !raw.PUBLIC_API_URL || !env.SIGNING_KEY)) {
        throw new Error('MONGODB_URI, CLIENT_ORIGIN, PUBLIC_API_URL and SIGNING_KEY are required in production');
    }
    // Half an S3 configuration is a typo, not a choice: refuse it rather than fall back to the local folder.
    const s3 = S3_KEYS.filter((k) => env[k]);
    if (s3.length && s3.length !== S3_KEYS.length) {
        throw new Error(`S3 storage needs all of ${S3_KEYS.join(', ')}; missing ${S3_KEYS.filter((k) => !env[k]).join(', ')}`);
    }
    if (env.NODE_ENV === 'production' && !s3.length) throw new Error('Production stores files in S3: set the S3_* variables');
    return { ...env, SIGNING_KEY: env.SIGNING_KEY ?? randomBytes(32).toString('hex') };
}
