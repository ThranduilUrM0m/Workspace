import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Request } from 'express';
import type { Model } from 'mongoose';
import type { Member } from '../access/member.schema.js';
import { ACTIVITY, ROUTINE_DAYS, SEEN_SESSION, type ActivityEvent, type Kind, type Weight } from './activity.schema.js';

export interface Entry {
    kind: Kind;
    weight: Weight;
    action: string;
    actor?: Pick<Member, '_id' | 'clerkUserId' | 'name'>;
    section?: string;
    target?: { type: string; id: string; label?: string };
    before?: unknown;
    after?: unknown;
    request?: Request;
    status?: number;
    sessionId?: string;
}

const DAY = 24 * 60 * 60 * 1000;

// The one way into the log. Services call record() for their own changes
// (with before → after); the interceptor and the access guard call it for
// every request. Writing never fails the request it describes: a lost log
// line is reported, a refused save would be worse.
@Injectable()
export class ActivityService {
    private readonly logger = new Logger(ActivityService.name);
    private readonly seen = new Set<string>();

    constructor(
        @InjectModel(ACTIVITY) private readonly events: Model<ActivityEvent>,
        @InjectModel(SEEN_SESSION) private readonly sessions: Model<{ _id: string; clerkUserId: string }>,
    ) {}

    async record(e: Entry): Promise<void> {
        const now = new Date();
        try {
            await this.events.create({
                at: now,
                kind: e.kind,
                weight: e.weight,
                action: e.action,
                actor: e.actor && { member: e.actor._id, clerkUserId: e.actor.clerkUserId, name: e.actor.name },
                section: e.section,
                target: e.target,
                before: e.before,
                after: e.after,
                request: e.request && {
                    method: e.request.method,
                    path: e.request.path,
                    status: e.status,
                    ip: e.request.ip,
                    userAgent: e.request.get('user-agent')?.slice(0, 300),
                },
                sessionId: e.sessionId,
                expireAt: e.weight === 'routine' ? new Date(now.getTime() + ROUTINE_DAYS * DAY) : undefined,
            });
        } catch (err) {
            this.logger.error(`activity not recorded: ${e.action}`, err as Error);
        }
    }

    /**
     * The first request a session makes is its sign-in. Clerk's webhooks
     * would say so too, but need a public URL; this needs nothing. Sign-out
     * and revocation arrive with those webhooks at deploy time.
     */
    async noteSession(sessionId: string, actor: Entry['actor'] & {}, request: Request): Promise<void> {
        if (this.seen.has(sessionId)) return;
        try {
            const res = await this.sessions.updateOne(
                { _id: sessionId },
                { $setOnInsert: { clerkUserId: actor.clerkUserId, at: new Date() } },
                { upsert: true },
            );
            if (this.seen.size > 5000) this.seen.clear();
            this.seen.add(sessionId);
            if (res.upsertedCount) await this.record({ kind: 'access', weight: 'notable', action: 'sign_in', actor, request, sessionId });
        } catch (err) {
            this.logger.error('session not noted', err as Error);
        }
    }
}
