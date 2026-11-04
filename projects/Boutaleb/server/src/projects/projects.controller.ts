import { Body, Controller, Get, HttpCode, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { projectCreate, projectListQuery, projectUpdate, type ProjectCreate, type ProjectListQuery, type ProjectUpdate } from '@repo/schemas';
import type { AccessRequest } from '../access/access.guard.js';
import { Requires } from '../access/requires.decorator.js';
import { ZodPipe } from '../common/zod.pipe.js';
import { ProjectsService } from './projects.service.js';

// /projects: list, get, create, update, archive, restore. Viewing needs
// View on Projects, every change needs Edit. Archive is a POST, not a
// DELETE: nothing is deleted, and restore is its undo.
@Controller('projects')
export class ProjectsController {
    constructor(private readonly projects: ProjectsService) {}

    @Get()
    @Requires('view', 'projects')
    list(@Query(new ZodPipe(projectListQuery)) q: ProjectListQuery) {
        return this.projects.list(q);
    }

    @Get(':id')
    @Requires('view', 'projects')
    get(@Param('id') id: string) {
        return this.projects.get(id);
    }

    @Post()
    @Requires('edit', 'projects')
    create(@Body(new ZodPipe(projectCreate)) body: ProjectCreate, @Req() req: AccessRequest) {
        return this.projects.create(body, req);
    }

    @Patch(':id')
    @Requires('edit', 'projects')
    update(@Param('id') id: string, @Body(new ZodPipe(projectUpdate)) body: ProjectUpdate, @Req() req: AccessRequest) {
        return this.projects.update(id, body, req);
    }

    @Post(':id/archive')
    @HttpCode(200)
    @Requires('edit', 'projects')
    archive(@Param('id') id: string, @Req() req: AccessRequest) {
        return this.projects.setArchived(id, true, req);
    }

    @Post(':id/restore')
    @HttpCode(200)
    @Requires('edit', 'projects')
    restore(@Param('id') id: string, @Req() req: AccessRequest) {
        return this.projects.setArchived(id, false, req);
    }
}
