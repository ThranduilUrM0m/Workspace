import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { Public } from '../auth/public.decorator.js';
import { EnquiriesService } from './enquiries.service.js';
import { EnquiryThrottler, FormsProxyGuard, type FormRequest } from './enquiry.guards.js';
import { FormTokens } from './form-token.js';

// The public forms' two calls, both reached only through the site's
// /api/enquiries route (FormsProxyGuard): a token when a form is shown,
// then the send. No Clerk session: these are strangers.
@Controller('enquiries')
@Public()
export class EnquiriesController {
    constructor(
        private readonly enquiries: EnquiriesService,
        private readonly tokens: FormTokens,
    ) {}

    @Get('token')
    @UseGuards(FormsProxyGuard)
    token() {
        return { t: this.tokens.issue() };
    }

    @Post()
    @UseGuards(FormsProxyGuard, EnquiryThrottler)
    async receive(@Body() body: Record<string, unknown>, @Req() req: FormRequest, @Res() res: Response) {
        const answer = await this.enquiries.receive(body ?? {}, req.token);
        res.status(answer.status).json(answer.body);
    }
}
