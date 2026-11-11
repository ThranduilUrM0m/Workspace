import { Body, Controller, Get, HttpCode, Param, Post, Put, Req } from '@nestjs/common';
import { briefNote, briefSendBack, briefWrite, type BriefNote, type BriefSendBack, type BriefWrite } from '@repo/schemas';
import type { AccessRequest } from '../access/access.guard.js';
import { Requires } from '../access/requires.decorator.js';
import { ZodPipe } from '../common/zod.pipe.js';
import { BriefsService } from './briefs.service.js';

// /projects/:id/brief: the project's one brief. Reading it is View on
// Projects; writing and every ruling is Edit. Rulings are POSTs named for
// what they do, because each is a transition, not a field edit.
@Controller('projects/:id/brief')
export class BriefsController {
    constructor(private readonly briefs: BriefsService) {}

    @Get()
    @Requires('view', 'projects')
    get(@Param('id') id: string) {
        return this.briefs.get(id);
    }

    @Put()
    @Requires('edit', 'projects')
    write(@Param('id') id: string, @Body(new ZodPipe(briefWrite)) body: BriefWrite, @Req() req: AccessRequest) {
        return this.briefs.write(id, body, req);
    }

    @Post('approve')
    @HttpCode(200)
    @Requires('edit', 'projects')
    approve(@Param('id') id: string, @Req() req: AccessRequest) {
        return this.briefs.approve(id, req);
    }

    @Post('send-back')
    @HttpCode(200)
    @Requires('edit', 'projects')
    sendBack(@Param('id') id: string, @Body(new ZodPipe(briefSendBack)) body: BriefSendBack, @Req() req: AccessRequest) {
        return this.briefs.sendBack(id, body, req);
    }

    @Post('reopen')
    @HttpCode(200)
    @Requires('edit', 'projects')
    reopen(@Param('id') id: string, @Req() req: AccessRequest) {
        return this.briefs.reopen(id, req);
    }

    @Put('areas/:area/note')
    @Requires('edit', 'projects')
    note(@Param('id') id: string, @Param('area') area: string, @Body(new ZodPipe(briefNote)) body: BriefNote, @Req() req: AccessRequest) {
        return this.briefs.note(id, area, body, req);
    }
}
