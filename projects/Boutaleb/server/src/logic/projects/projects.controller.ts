import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ProjectsService } from './projects.service';

@Controller('api/public/projects')
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @Get('featured')
  async getFeatured(@Query('limit') limit: string = '6') {
    const projects = await this.projectsService.findAll(0, Number(limit));
    return {
      data: projects,
      success: true,
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':slug')
  async getBySlug(@Param('slug') slug: string) {
    const project = await this.projectsService.findBySlug(slug);
    return {
      data: project,
      success: !!project,
      timestamp: new Date().toISOString(),
    };
  }

  @Get()
  async getAll(
    @Query('skip') skip: string = '0',
    @Query('limit') limit: string = '10',
    @Query('clientId') clientId?: string,
  ) {
    let projects;
    if (clientId) {
      projects = await this.projectsService.findByClientId(clientId);
    } else {
      projects = await this.projectsService.findAll(Number(skip), Number(limit));
    }
    return {
      data: projects,
      success: true,
      timestamp: new Date().toISOString(),
    };
  }

  @Post()
  async create(@Body() data: any) {
    const project = await this.projectsService.create(data);
    return {
      data: project,
      success: true,
      timestamp: new Date().toISOString(),
    };
  }
}
