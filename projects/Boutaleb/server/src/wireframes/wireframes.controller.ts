import { Body, Controller, Get, HttpCode, Param, ParseIntPipe, Post, Req } from '@nestjs/common';
import {
    roundStart,
    roundVerdict,
    uploadCommit,
    uploadStart,
    type RoundStart,
    type RoundVerdict,
    type UploadCommit,
    type UploadStart,
} from '@repo/schemas';
import type { AccessRequest } from '../access/access.guard.js';
import { Requires } from '../access/requires.decorator.js';
import { ZodPipe } from '../common/zod.pipe.js';
import { WireframesService } from './wireframes.service.js';

// /projects/:id/wireframes: the rounds, newest first. Every change answers
// with the whole list, as the plan does: the tab redraws the live round and
// its history together. There is no PATCH and no DELETE, on purpose:
// history is append-only.
@Controller('projects/:id/wireframes')
export class WireframesController {
    constructor(private readonly wf: WireframesService) {}

    @Get()
    @Requires('view', 'projects')
    list(@Param('id') id: string) {
        return this.wf.list(id);
    }

    @Post()
    @Requires('edit', 'projects')
    start(@Param('id') id: string, @Body(new ZodPipe(roundStart)) body: RoundStart, @Req() req: AccessRequest) {
        return this.wf.start(id, body, req);
    }

    @Post(':v/upload')
    @HttpCode(200)
    @Requires('edit', 'projects')
    uploadStart(@Param('id') id: string, @Param('v', ParseIntPipe) v: number, @Body(new ZodPipe(uploadStart)) body: UploadStart) {
        return this.wf.uploadStart(id, v, body);
    }

    @Post(':v/upload/commit')
    @HttpCode(200)
    @Requires('edit', 'projects')
    uploadCommit(@Param('id') id: string, @Param('v', ParseIntPipe) v: number, @Body(new ZodPipe(uploadCommit)) body: UploadCommit, @Req() req: AccessRequest) {
        return this.wf.uploadCommit(id, v, body, req);
    }

    @Post(':v/send')
    @HttpCode(200)
    @Requires('edit', 'projects')
    send(@Param('id') id: string, @Param('v', ParseIntPipe) v: number, @Req() req: AccessRequest) {
        return this.wf.send(id, v, req);
    }

    @Post(':v/verdict')
    @HttpCode(200)
    @Requires('edit', 'projects')
    verdict(@Param('id') id: string, @Param('v', ParseIntPipe) v: number, @Body(new ZodPipe(roundVerdict)) body: RoundVerdict, @Req() req: AccessRequest) {
        return this.wf.verdict(id, v, body, req);
    }

    @Post(':v/view')
    @HttpCode(200)
    @Requires('view', 'projects')
    view(@Param('id') id: string, @Param('v', ParseIntPipe) v: number) {
        return this.wf.viewLink(id, v);
    }
}
