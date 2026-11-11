import { CopyObjectCommand, GetObjectCommand, ListObjectsV2Command, NoSuchKey, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { ObjectStore } from './object-store.js';
import { PUT_TTL_SECONDS } from './object-store.js';

export interface S3Config {
    endpoint: string;
    region: string;
    bucket: string;
    accessKeyId: string;
    secretAccessKey: string;
}

/**
 * Oracle Object Storage through its S3-compatible API (one bucket per
 * environment: boutaleb-dev, boutaleb-prod). Endpoint:
 * https://<namespace>.compat.objectstorage.<region>.oraclecloud.com
 *
 * Two settings Oracle needs that AWS does not:
 * - forcePathStyle: Oracle's compat endpoint does not serve
 *   bucket-as-subdomain addresses.
 * - checksums WHEN_REQUIRED: since early 2025 the AWS SDK adds CRC32
 *   checksums to every upload by default, and S3-compatible stores that do
 *   not implement them refuse the request. Off unless an operation needs it.
 */
export class S3Store implements ObjectStore {
    private readonly s3: S3Client;
    private readonly bucket: string;

    constructor(c: S3Config) {
        this.bucket = c.bucket;
        this.s3 = new S3Client({
            endpoint: c.endpoint,
            region: c.region,
            forcePathStyle: true,
            credentials: { accessKeyId: c.accessKeyId, secretAccessKey: c.secretAccessKey },
            requestChecksumCalculation: 'WHEN_REQUIRED',
            responseChecksumValidation: 'WHEN_REQUIRED',
        });
    }

    async presignPut(key: string, contentType: string, bytes: number) {
        const cmd = new PutObjectCommand({ Bucket: this.bucket, Key: key, ContentType: contentType });
        void bytes; // A pre-signed PUT cannot cap its size here; the declared sizes were checked before signing.
        const url = await getSignedUrl(this.s3, cmd, { expiresIn: PUT_TTL_SECONDS, signableHeaders: new Set(['content-type']) });
        return { url, headers: { 'Content-Type': contentType } };
    }

    async list(prefix: string): Promise<string[]> {
        const keys: string[] = [];
        let token: string | undefined;
        do {
            const page = await this.s3.send(new ListObjectsV2Command({ Bucket: this.bucket, Prefix: prefix, ContinuationToken: token }));
            for (const o of page.Contents ?? []) if (o.Key) keys.push(o.Key);
            token = page.IsTruncated ? page.NextContinuationToken : undefined;
        } while (token);
        return keys;
    }

    async get(key: string): Promise<Buffer | null> {
        try {
            const res = await this.s3.send(new GetObjectCommand({ Bucket: this.bucket, Key: key }));
            return res.Body ? Buffer.from(await res.Body.transformToByteArray()) : null;
        } catch (e) {
            if (e instanceof NoSuchKey || (e as { name?: string }).name === 'NoSuchKey') return null;
            throw e;
        }
    }

    /** Server-side copies: no bytes come through the API. */
    async copyPrefix(from: string, to: string): Promise<number> {
        const keys = await this.list(from);
        for (const key of keys) {
            await this.s3.send(
                new CopyObjectCommand({ Bucket: this.bucket, Key: to + key.slice(from.length), CopySource: `${this.bucket}/${encodeURIComponent(key).replace(/%2F/g, '/')}` }),
            );
        }
        return keys.length;
    }
}
