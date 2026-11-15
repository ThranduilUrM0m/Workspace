import { createHash, timingSafeEqual } from 'node:crypto';
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { Request } from 'express';
import type { Env } from '../env.js';

// /portal/* is reached only through the site's own /api/portal routes and
// its /p page, server to server, with the same shared key as the public
// forms. The client's browser never talks to the API, so the API address
// stays out of the link's reach and a stranger cannot guess-and-call it.

export type PortalRequest = Request & { visitor: string };

const digest = (s: string) => createHash('sha256').update(s).digest();

@Injectable()
export class PortalProxyGuard implements CanActivate {
    private readonly key: Buffer;

    constructor(config: ConfigService<Env, true>) {
        this.key = digest(config.get('FORMS_PROXY_KEY', { infer: true }));
    }

    canActivate(context: ExecutionContext): boolean {
        const req = context.switchToHttp().getRequest<PortalRequest>();
        const sent = req.header('x-forms-key');
        if (!sent || !timingSafeEqual(digest(sent), this.key)) throw new UnauthorizedException({ error: 'unauthorized' });
        req.visitor = (req.header('x-visitor-ip') || 'unknown').slice(0, 64);
        return true;
    }
}

/** 60 calls a minute per visitor: a person filling a form, saving as they type, stays far under it. */
@Injectable()
export class PortalThrottler extends ThrottlerGuard {
    protected override async getTracker(req: Record<string, unknown>): Promise<string> {
        return (req as unknown as PortalRequest).visitor;
    }
}
