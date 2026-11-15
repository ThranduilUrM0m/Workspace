import { Body, Controller, Get, HttpCode, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { portalAnswers, portalIssue, portalResend, portalSubmit, type PortalAnswers, type PortalIssue, type PortalResend } from '@repo/schemas';
import type { AccessRequest } from '../access/access.guard.js';
import { Requires } from '../access/requires.decorator.js';
import { Public } from '../auth/public.decorator.js';
import { ZodPipe } from '../common/zod.pipe.js';
import { PortalProxyGuard, PortalThrottler } from './portal.guards.js';
import { PortalService } from './portal.service.js';

// The owner's two calls: is there a live link, and issue a new one.
// Reading is View on Projects; issuing is Edit, because it kills the old link.
@Controller('projects/:id/portal-link')
export class PortalLinkController {
    constructor(private readonly portal: PortalService) {}

    @Get()
    @Requires('view', 'projects')
    status(@Param('id') id: string) {
        return this.portal.status(id);
    }

    @Post()
    @HttpCode(201)
    @Requires('edit', 'projects')
    issue(@Param('id') id: string, @Body(new ZodPipe(portalIssue)) body: PortalIssue, @Req() req: AccessRequest) {
        return this.portal.issue(id, body.send, req);
    }
}

// "Email me my access link" (T8.5), for a visitor who has no working link.
// Same doors as the client's calls: the site only, and the per-visitor
// throttle. It answers the same two words whatever happened. Declared before
// PortalController so `portal/resend` is never read as `portal/:token`.
@Controller('portal/resend')
@Public()
@UseGuards(PortalProxyGuard, PortalThrottler)
export class PortalResendController {
    constructor(private readonly portal: PortalService) {}

    @Post()
    @HttpCode(200)
    async resend(@Body(new ZodPipe(portalResend)) body: PortalResend) {
        await this.portal.resend(body.email);
        return { ok: true };
    }
}

// The client's three calls, reached only through the site (PortalProxyGuard).
// No Clerk session: the link is the credential.
@Controller('portal/:token')
@Public()
@UseGuards(PortalProxyGuard, PortalThrottler)
export class PortalController {
    constructor(private readonly portal: PortalService) {}

    @Get()
    view(@Param('token') token: string) {
        return this.portal.view(token);
    }

    @Put('draft')
    save(@Param('token') token: string, @Body(new ZodPipe(portalAnswers)) body: PortalAnswers) {
        return this.portal.save(token, body);
    }

    @Post('submit')
    @HttpCode(200)
    submit(@Param('token') token: string, @Body(new ZodPipe(portalSubmit)) body: PortalAnswers) {
        return this.portal.submit(token, body);
    }
}
