import { Controller, Get, Req } from '@nestjs/common';
import type { AuthedRequest, SessionAuth } from './clerk-auth.guard.js';

// Who the API thinks is calling. T6.4 adds the member and their role.
@Controller('me')
export class MeController {
    @Get()
    me(@Req() req: AuthedRequest): SessionAuth {
        return req.auth;
    }
}
