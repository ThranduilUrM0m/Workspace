import { createHmac, timingSafeEqual } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Env } from '../env.js';

/**
 * Short-lived signed claims for URLs that cannot carry a Bearer token: a
 * local-folder upload, a round's pages opened in a new tab. A claim is
 * base64url JSON plus an HMAC over it, with an expiry inside. Twelve lines
 * of node:crypto instead of a JWT library: one signer, one verifier, both
 * here, and nothing else in the app needs JWTs it issues itself.
 */
@Injectable()
export class Signer {
    private readonly key: string;

    constructor(config: ConfigService<Env, true>) {
        this.key = config.get('SIGNING_KEY', { infer: true });
    }

    sign(claim: Record<string, unknown>, ttlSeconds: number): string {
        const body = Buffer.from(JSON.stringify({ ...claim, exp: Math.floor(Date.now() / 1000) + ttlSeconds })).toString('base64url');
        return `${body}.${this.mac(body)}`;
    }

    /** The claim, or null when the signature is wrong, the token is malformed, or it has expired. */
    verify<T extends Record<string, unknown>>(token: string): (T & { exp: number }) | null {
        const [body, mac] = token.split('.');
        if (!body || !mac) return null;
        const want = Buffer.from(this.mac(body));
        const got = Buffer.from(mac);
        if (want.length !== got.length || !timingSafeEqual(want, got)) return null;
        try {
            const claim = JSON.parse(Buffer.from(body, 'base64url').toString()) as T & { exp: number };
            return typeof claim.exp === 'number' && claim.exp > Date.now() / 1000 ? claim : null;
        } catch {
            return null;
        }
    }

    private mac(body: string) {
        return createHmac('sha256', this.key).update(body).digest('base64url');
    }
}
