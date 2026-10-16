import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { verifyToken } from '@clerk/backend';
import type { Request } from 'express';
import type { Env } from '../env.js';
import { IS_PUBLIC } from './public.decorator.js';

export interface SessionAuth {
    userId: string;
    sessionId: string;
}

export type AuthedRequest = Request & { auth: SessionAuth };

// Clerk authenticates; who may do what is ours (CASL roles in Mongo, T6.4).
// The client sends the session token as a Bearer header (`getToken()`).
@Injectable()
export class ClerkAuthGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly config: ConfigService<Env, true>,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [context.getHandler(), context.getClass()]);
        if (isPublic) return true;

        const req = context.switchToHttp().getRequest<AuthedRequest>();
        const [scheme, token] = (req.headers.authorization ?? '').split(' ');
        if (scheme !== 'Bearer' || !token) throw new UnauthorizedException();

        try {
            const claims = await verifyToken(token, {
                jwtKey: this.config.get('CLERK_JWT_KEY', { infer: true }),
                secretKey: this.config.get('CLERK_SECRET_KEY', { infer: true }),
                authorizedParties: [this.config.get('CLIENT_ORIGIN', { infer: true })],
            });
            if (!claims.sub || typeof claims.sid !== 'string') throw new Error('not a session token');
            req.auth = { userId: claims.sub, sessionId: claims.sid };
            return true;
        } catch {
            // Expired, forged, wrong origin: the caller only learns "no".
            throw new UnauthorizedException();
        }
    }
}
