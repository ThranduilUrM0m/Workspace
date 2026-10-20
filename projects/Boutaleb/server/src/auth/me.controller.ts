import { Controller, Get, Req } from '@nestjs/common';
import type { AccessRequest } from '../access/access.guard.js';
import { AnyMember } from '../access/requires.decorator.js';

// Who the API thinks is calling, and what they may do. The client draws
// its navigation from `rules` (hiding what cannot be opened); the API
// checks them again on every request.
@Controller('me')
export class MeController {
    @Get()
    @AnyMember()
    me(@Req() req: AccessRequest) {
        const { member, role, ability, auth } = req;
        return {
            userId: auth.userId,
            sessionId: auth.sessionId,
            member: { id: String(member!._id), name: member!.name, email: member!.email },
            role: { id: String(role!._id), name: role!.name, owner: role!.owner },
            rules: ability!.rules,
        };
    }
}
