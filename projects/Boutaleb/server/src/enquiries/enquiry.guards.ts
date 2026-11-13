import { createHash, timingSafeEqual } from 'node:crypto';
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ThrottlerGuard } from '@nestjs/throttler';
import { HONEYPOT } from '@repo/schemas';
import type { Request } from 'express';
import type { Env } from '../env.js';
import { FormTokens, type TokenCheck } from './form-token.js';

// POST /enquiries is reached only through the site's own /api/enquiries
// route, server to server. That route proves itself with FORMS_PROXY_KEY
// and says who the visitor is (their IP), which the rate limit counts by.
// Anyone else, including a script calling the API directly, is refused.

export type FormRequest = Request & { visitor: string; token: TokenCheck };

const digest = (s: string) => createHash('sha256').update(s).digest();

@Injectable()
export class FormsProxyGuard implements CanActivate {
    private readonly key: Buffer;

    constructor(
        config: ConfigService<Env, true>,
        private readonly tokens: FormTokens,
    ) {
        this.key = digest(config.get('FORMS_PROXY_KEY', { infer: true }));
    }

    canActivate(context: ExecutionContext): boolean {
        const req = context.switchToHttp().getRequest<FormRequest>();
        const sent = req.header('x-forms-key');
        // Compared as digests: equal length, constant time, whatever was sent.
        if (!sent || !timingSafeEqual(digest(sent), this.key)) throw new UnauthorizedException({ error: 'unauthorized' });
        req.visitor = (req.header('x-visitor-ip') || 'unknown').slice(0, 64);
        // Read before validation strips unknown keys (public-forms.md §2).
        const body = (req.body ?? {}) as Record<string, unknown>;
        req.token = body[HONEYPOT] ? 'bot' : this.tokens.check(body.t);
        return true;
    }
}

/**
 * 5 sends per 10 minutes and 20 per day, per visitor (public-forms.md §3).
 * Bots skip it: they get their fake success whatever the count, because a
 * bot that sees a 429 learns it was noticed.
 */
@Injectable()
export class EnquiryThrottler extends ThrottlerGuard {
    protected override async getTracker(req: Record<string, unknown>): Promise<string> {
        return (req as unknown as FormRequest).visitor;
    }

    protected override async shouldSkip(context: ExecutionContext): Promise<boolean> {
        return context.switchToHttp().getRequest<FormRequest>().token === 'bot';
    }
}
