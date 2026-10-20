import { CallHandler, ExecutionContext, HttpException, Injectable, NestInterceptor } from '@nestjs/common';
import type { Response } from 'express';
import { catchError, tap, throwError, type Observable } from 'rxjs';
import type { AccessRequest } from '../access/access.guard.js';
import { ActivityService } from './activity.service.js';

const WRITES = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

// Every request a member makes lands in the log once, after it is answered
// (spec 11b: "track everything"). Reads are routine and expire; writes are
// notable. A service that changes a record adds its own entry with before →
// after; this one says the request happened. Refusals are logged by the
// access guard, which runs before this.
@Injectable()
export class ActivityInterceptor implements NestInterceptor {
    constructor(private readonly activity: ActivityService) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
        const http = context.switchToHttp();
        const req = http.getRequest<AccessRequest>();
        if (!req.member) return next.handle();

        const write = WRITES.has(req.method);
        const log = (status: number) =>
            void this.activity.record({
                kind: write ? 'change' : 'view',
                weight: write ? 'notable' : 'routine',
                action: `${req.method} ${req.route?.path ?? req.path}`,
                actor: req.member,
                section: req.section,
                request: req,
                status,
                sessionId: req.auth.sessionId,
            });

        return next.handle().pipe(
            tap(() => log(http.getResponse<Response>().statusCode)),
            catchError((err: unknown) => {
                log(err instanceof HttpException ? err.getStatus() : 500);
                return throwError(() => err);
            }),
        );
    }
}
