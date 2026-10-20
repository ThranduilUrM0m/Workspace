import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { ActivityService } from '../activity/activity.service.js';
import type { AuthedRequest } from '../auth/clerk-auth.guard.js';
import { IS_PUBLIC } from '../auth/public.decorator.js';
import { abilityFor, type AppAbility } from './abilities.js';
import { MEMBER, ROLE, type Member, type Role } from './member.schema.js';
import { REQUIRES, type Requirement } from './requires.decorator.js';

export type AccessRequest = AuthedRequest & {
    member?: Member;
    role?: Role;
    ability?: AppAbility;
    section?: string;
};

// Runs after ClerkAuthGuard. Clerk said who is calling; this finds them
// among the members, builds their abilities from their role, and checks
// the route's requirement. No member, a revoked one, or a route that
// states no requirement: 403. Every refusal is logged.
@Injectable()
export class AccessGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly activity: ActivityService,
        @InjectModel(MEMBER) private readonly members: Model<Member>,
        @InjectModel(ROLE) private readonly roles: Model<Role>,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const targets = [context.getHandler(), context.getClass()];
        if (this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, targets)) return true;

        const req = context.switchToHttp().getRequest<AccessRequest>();
        const need = this.reflector.getAllAndOverride<Requirement | undefined>(REQUIRES, targets);

        const member = await this.members.findOne({ clerkUserId: req.auth.userId }).lean<Member>();
        const role = member && member.status === 'active' ? await this.roles.findById(member.role).lean<Role>() : null;

        const refuse = async (reason: string) => {
            await this.activity.record({
                kind: 'access',
                weight: 'critical',
                action: 'denied',
                actor: member ? member : { clerkUserId: req.auth.userId } as Member,
                section: need?.kind === 'ability' ? need.section : undefined,
                after: { reason, route: `${req.method} ${req.route?.path ?? req.path}` },
                request: req,
                status: 403,
                sessionId: req.auth.sessionId,
            });
            throw new ForbiddenException();
        };

        if (!member || !role) return refuse(member ? 'revoked' : 'not a member');

        await this.activity.noteSession(req.auth.sessionId, member, req);

        const ability = abilityFor({ owner: role.owner, levels: role.levels ?? {}, rights: role.rights ?? {} });
        Object.assign(req, { member, role, ability });

        if (!need) return refuse('route states no requirement');
        if (need.kind === 'owner' && !role.owner) return refuse('owner only');
        if (need.kind === 'ability') {
            req.section = need.section;
            if (!ability.can(need.action, need.section)) return refuse(`needs ${need.action} on ${need.section}`);
        }
        return true;
    }
}
