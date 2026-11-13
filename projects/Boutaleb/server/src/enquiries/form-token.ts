import { createHmac, hkdfSync, timingSafeEqual } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Env } from '../env.js';

// The signed timestamp (public-forms.md §3). A form asks for one when it is
// shown; a send carries it back. Too fast after showing (under 3 s) or a
// bad signature means a script, not a person. Older than 24 h means a tab
// left open: refused honestly, the form asks for a reload.
//
// Hand-rolled on node:crypto on purpose: about fifteen lines, and no
// maintained library does exactly this. The key is derived from
// SIGNING_KEY (HKDF, label "forms"), so no extra secret, and a leak of
// this key alone reveals nothing about the upload-link signatures.

export const MIN_AGE_MS = 3_000;
export const MAX_AGE_MS = 24 * 60 * 60 * 1000;

export type TokenCheck = 'ok' | 'bot' | 'expired';

@Injectable()
export class FormTokens {
    private readonly key: Buffer;

    constructor(config: ConfigService<Env, true>) {
        this.key = Buffer.from(hkdfSync('sha256', config.get('SIGNING_KEY', { infer: true }), Buffer.alloc(0), 'forms', 32));
    }

    /** `<ms>.<hmac>`. `at` is for tests. */
    issue(at = Date.now()): string {
        return `${at}.${this.sign(String(at))}`;
    }

    check(token: unknown, now = Date.now()): TokenCheck {
        if (typeof token !== 'string') return 'bot';
        const [at, sig] = token.split('.');
        if (!at || !sig || !/^\d{13}$/.test(at)) return 'bot';
        const want = Buffer.from(this.sign(at));
        const got = Buffer.from(sig);
        if (want.length !== got.length || !timingSafeEqual(want, got)) return 'bot';
        const age = now - Number(at);
        if (age < MIN_AGE_MS) return 'bot';
        if (age > MAX_AGE_MS) return 'expired';
        return 'ok';
    }

    private sign(s: string): string {
        return createHmac('sha256', this.key).update(s).digest('base64url');
    }
}
