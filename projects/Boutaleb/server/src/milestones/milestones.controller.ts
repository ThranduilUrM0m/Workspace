import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Req } from '@nestjs/common';
import { milestoneCreate, milestoneMove, milestoneUpdate, type MilestoneCreate, type MilestoneMove, type MilestoneUpdate } from '@repo/schemas';
import type { AccessRequest } from '../access/access.guard.js';
import { Requires } from '../access/requires.decorator.js';
import { ZodPipe } from '../common/zod.pipe.js';
import { MilestonesService } from './milestones.service.js';

// /projects/:id/milestones: the plan's phases, in the owner's order.
// Every change answers with the whole ordered list, because a reorder
// moves two rows and the screen redraws the plan, not one line of it.
@Controller('projects/:id/milestones')
export class MilestonesController {
    constructor(private readonly milestones: MilestonesService) {}

    @Get()
    @Requires('view', 'projects')
    list(@Param('id') id: string) {
        return this.milestones.list(id);
    }

    @Post()
    @Requires('edit', 'projects')
    create(@Param('id') id: string, @Body(new ZodPipe(milestoneCreate)) body: MilestoneCreate, @Req() req: AccessRequest) {
        return this.milestones.create(id, body, req);
    }

    @Patch(':mid')
    @Requires('edit', 'projects')
    update(@Param('id') id: string, @Param('mid') mid: string, @Body(new ZodPipe(milestoneUpdate)) body: MilestoneUpdate, @Req() req: AccessRequest) {
        return this.milestones.update(id, mid, body, req);
    }

    @Delete(':mid')
    @Requires('edit', 'projects')
    remove(@Param('id') id: string, @Param('mid') mid: string, @Req() req: AccessRequest) {
        return this.milestones.remove(id, mid, req);
    }

    @Post(':mid/move')
    @HttpCode(200)
    @Requires('edit', 'projects')
    move(@Param('id') id: string, @Param('mid') mid: string, @Body(new ZodPipe(milestoneMove)) body: MilestoneMove, @Req() req: AccessRequest) {
        return this.milestones.move(id, mid, body, req);
    }
}

// /milestones/open: the Projects list's one aggregate read, instead of
// one plan request per row.
@Controller('milestones')
export class OpenMilestonesController {
    constructor(private readonly milestones: MilestonesService) {}

    @Get('open')
    @Requires('view', 'projects')
    open() {
        return this.milestones.open();
    }
}
